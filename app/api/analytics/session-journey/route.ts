import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS policies in server-side API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/analytics/session-journey?sessionId=xxx
 * Returns complete journey for a specific funnel session
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('funnel_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get all events for this session, ordered by timestamp
    const { data: events, error: eventsError } = await supabase
      .from('funnel_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    // Process events to create a timeline
    const timeline = events?.map((event) => {
      const metadata = event.metadata || {};
      return {
        eventId: event.id,
        timestamp: event.timestamp,
        eventType: event.event_type,
        stepNumber: event.step_number,
        description: getEventDescription(event.event_type, event.step_number, metadata),
        metadata,
      };
    }) || [];

    // Calculate session stats
    const entryTime = new Date(session.entry_time).getTime();
    const lastActivity = new Date(session.last_activity).getTime();
    const totalTimeSeconds = Math.round((lastActivity - entryTime) / 1000);

    // Count events by type (actual event types we track in funnel)
    const eventCounts = {
      step_entered: events?.filter((e) => e.event_type === 'step_entered').length || 0,
      step_exited: events?.filter((e) => e.event_type === 'step_exited').length || 0,
      button_clicked: events?.filter((e) => e.event_type === 'button_clicked').length || 0,
      skip_used: events?.filter((e) => e.event_type === 'skip_used').length || 0,
      offer_viewed: events?.filter((e) => e.event_type === 'offer_viewed').length || 0,
      choice_made: events?.filter((e) => e.event_type === 'choice_made').length || 0,
      exit_intent: events?.filter((e) => e.event_type === 'exit_intent').length || 0,
    };

    return NextResponse.json({
      session: {
        sessionId: session.session_id,
        email: session.user_email,
        userData: session.user_data || {},
        entryTime: session.entry_time,
        lastActivity: session.last_activity,
        currentStep: session.current_step,
        maxStepReached: session.max_step_reached,
        completed: session.completed,
        offerTier: session.offer_tier,
        exitStep: session.exit_step,
        utmData: session.utm_data || {},
        userAgent: session.user_agent,
        totalTimeSeconds,
      },
      timeline,
      eventCounts,
      totalEvents: events?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching session journey:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session journey' },
      { status: 500 }
    );
  }
}

/**
 * Helper to generate human-readable event descriptions
 */
function getEventDescription(eventType: string, stepNumber: number | null, metadata: any): string {
  switch (eventType) {
    case 'step_entered':
      return `📍 Влезе на Стъпка ${stepNumber}`;

    case 'step_exited':
      const timeSpent = metadata.timeSpentSeconds;
      const timeText = timeSpent ? ` (прекара ${timeSpent}s)` : '';
      return `👋 Напусна Стъпка ${stepNumber}${timeText}`;

    case 'button_clicked':
      // Check if this is a CTA click (purchase attempt)
      if (metadata.action === 'cta_click' && metadata.tier) {
        const tierNames: Record<string, string> = {
          premium: 'Premium оферта (197 лв)',
          regular: 'Single оферта (97 лв)',
          digital: 'Digital план (47 лв)'
        };
        const tierName = tierNames[metadata.tier] || metadata.tier;
        return `✅ Избра ${tierName}`;
      }

      // Check if this is Skip to Free
      if (metadata.action === 'skip_to_free') {
        return `📄 Избра безплатния 7-дневен план`;
      }

      // Check if this is a Decline button
      if (metadata.action === 'decline_offer') {
        const fromTier = metadata.previousTier || 'unknown';
        const tierNames: Record<string, string> = {
          premium: 'Premium',
          single: 'Single',
          digital: 'Digital'
        };
        return `👎 Отказа ${tierNames[fromTier] || fromTier} оферта`;
      }

      // Regular button clicks
      const buttonText = metadata.buttonText || metadata.action || 'Button';
      return `🖱️ Clicked: "${buttonText}"`;

    case 'skip_used':
      return `⏭️ Прескочи Стъпка ${stepNumber}`;

    case 'offer_viewed':
      const offerTier = metadata.offerTier || 'unknown';
      const offerNames: Record<string, string> = {
        premium: 'Premium оферта',
        regular: 'Single оферта',
        digital: 'Digital оферта',
        single: 'Single оферта'
      };
      return `👁️ Видя ${offerNames[offerTier] || offerTier}`;

    case 'choice_made':
      const choiceValue = metadata.choiceValue;
      return `✅ Направи избор: Опция ${choiceValue}`;

    case 'exit_intent':
      return `🚪 Exit intent на Стъпка ${stepNumber}`;

    case 'session_started':
      return `🚀 Сесията започна`;

    case 'session_completed':
      return `✅ Фунелът завършен`;

    case 'session_exited':
      return `❌ Напусна на Стъпка ${stepNumber}`;

    default:
      return eventType;
  }
}
