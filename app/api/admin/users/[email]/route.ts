import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TimelineEvent {
  id: string;
  type: 'chat_session' | 'funnel_session' | 'funnel_event';
  timestamp: string;
  data: any;
}

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);

    // Get chat sessions for this email
    const { data: chatSessions, error: chatError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (chatError) throw chatError;

    // Get funnel sessions for this email
    const { data: funnelSessions, error: funnelError } = await supabase
      .from('funnel_sessions')
      .select('*')
      .eq('user_email', email)
      .order('entry_time', { ascending: false });

    if (funnelError) throw funnelError;

    // Get funnel events for this user's sessions
    const sessionIds = funnelSessions?.map((s) => s.session_id) || [];
    let funnelEvents: any[] = [];

    if (sessionIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from('funnel_events')
        .select('*')
        .in('session_id', sessionIds)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;
      funnelEvents = events || [];
    }

    // Create timeline by merging all events
    const timeline: TimelineEvent[] = [];

    // Add chat sessions
    chatSessions?.forEach((session) => {
      timeline.push({
        id: session.id,
        type: 'chat_session',
        timestamp: session.created_at,
        data: session,
      });
    });

    // Add funnel sessions
    funnelSessions?.forEach((session) => {
      timeline.push({
        id: session.id,
        type: 'funnel_session',
        timestamp: session.entry_time,
        data: session,
      });
    });

    // Add funnel events (limited to most important ones)
    funnelEvents.forEach((event) => {
      if (
        event.event_type === 'offer_viewed' ||
        event.event_type === 'button_clicked' ||
        event.event_type === 'exit_intent'
      ) {
        timeline.push({
          id: event.id,
          type: 'funnel_event',
          timestamp: event.timestamp,
          data: event,
        });
      }
    });

    // Sort timeline by timestamp (most recent first)
    timeline.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Calculate stats
    const stats = {
      totalChatSessions: chatSessions?.length || 0,
      totalFunnelAttempts: funnelSessions?.length || 0,
      completedFunnels: funnelSessions?.filter((s) => s.completed).length || 0,
      totalEvents: funnelEvents.length,
      firstName: funnelSessions?.[0]?.user_data?.firstName || null,
    };

    return NextResponse.json({
      email,
      stats,
      timeline,
      chatSessions: chatSessions || [],
      funnelSessions: funnelSessions || [],
    });
  } catch (error: any) {
    console.error('Error fetching user timeline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user timeline' },
      { status: 500 }
    );
  }
}
