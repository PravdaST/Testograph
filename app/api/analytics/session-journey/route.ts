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

    // Count events by type
    const eventCounts = {
      step_entered: events?.filter((e) => e.event_type === 'step_entered').length || 0,
      button_clicked: events?.filter((e) => e.event_type === 'button_clicked').length || 0,
      input_changed: events?.filter((e) => e.event_type === 'input_changed').length || 0,
      video_interaction: events?.filter((e) => e.event_type === 'video_interaction').length || 0,
      form_submitted: events?.filter((e) => e.event_type === 'form_submitted').length || 0,
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
      return `Reached Step ${stepNumber}`;
    case 'button_clicked':
      return `Clicked: ${metadata.buttonText || 'Button'}`;
    case 'input_changed':
      return `Input changed: ${metadata.inputName || 'field'}`;
    case 'video_interaction':
      return `Video: ${metadata.action || 'interaction'}`;
    case 'form_submitted':
      return `Form submitted on Step ${stepNumber}`;
    case 'session_started':
      return `Session started`;
    case 'session_completed':
      return `✅ Funnel completed`;
    case 'session_exited':
      return `❌ Exited at Step ${stepNumber}`;
    default:
      return eventType;
  }
}
