import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ActivityEvent {
  id: string;
  type: 'chat_session' | 'chat_message' | 'funnel_session' | 'funnel_event';
  timestamp: string;
  user: string;
  description: string;
  metadata?: any;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities: ActivityEvent[] = [];

    // Get recent chat sessions
    const { data: chatSessions, error: chatError } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (chatError) throw chatError;

    chatSessions?.forEach((session) => {
      activities.push({
        id: session.id,
        type: 'chat_session',
        timestamp: session.created_at,
        user: session.email,
        description: session.pdf_filename
          ? `Започна нова chat сесия с PDF: ${session.pdf_filename}`
          : 'Започна нова chat сесия',
        metadata: session,
      });
    });

    // Get recent funnel sessions
    const { data: funnelSessions, error: funnelError } = await supabase
      .from('funnel_sessions')
      .select('*')
      .order('entry_time', { ascending: false })
      .limit(20);

    if (funnelError) throw funnelError;

    funnelSessions?.forEach((session) => {
      const firstName = session.user_data?.firstName || '';
      const userName = firstName
        ? `${firstName} (${session.user_email})`
        : session.user_email;

      if (session.completed) {
        activities.push({
          id: session.id,
          type: 'funnel_session',
          timestamp: session.last_activity,
          user: userName,
          description: `✅ Завърши funnel-а успешно! Offer: ${session.offer_tier || 'N/A'}`,
          metadata: session,
        });
      } else {
        activities.push({
          id: session.id,
          type: 'funnel_session',
          timestamp: session.entry_time,
          user: userName,
          description: session.exit_step
            ? `Започна funnel и напусна на Step ${session.exit_step}`
            : 'Започна да преминава през funnel-а',
          metadata: session,
        });
      }
    });

    // Get recent important funnel events
    const { data: funnelEvents, error: eventsError } = await supabase
      .from('funnel_events')
      .select('*, funnel_sessions!inner(user_email, user_data)')
      .in('event_type', ['offer_viewed', 'button_clicked', 'exit_intent'])
      .order('timestamp', { ascending: false })
      .limit(30);

    if (eventsError) throw eventsError;

    funnelEvents?.forEach((event: any) => {
      const session = event.funnel_sessions;
      const firstName = session?.user_data?.firstName || '';
      const userName = firstName
        ? `${firstName} (${session.user_email})`
        : session?.user_email || 'Unknown';

      let description = '';
      if (event.event_type === 'offer_viewed') {
        description = `Видял ${event.metadata?.offerTier || ''} оферта на Step ${event.step_number}`;
      } else if (event.event_type === 'button_clicked') {
        description = `Кликнал "${event.metadata?.buttonText || 'бутон'}" на Step ${event.step_number}`;
      } else if (event.event_type === 'exit_intent') {
        description = `Exit intent detection на Step ${event.step_number}`;
      }

      activities.push({
        id: event.id,
        type: 'funnel_event',
        timestamp: event.timestamp,
        user: userName,
        description,
        metadata: event,
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Limit to requested amount
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: limitedActivities.length,
    });
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
