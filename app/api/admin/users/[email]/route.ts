import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface TimelineEvent {
  id: string;
  type: 'chat_session' | 'funnel_session' | 'funnel_event' | 'purchase';
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

    // Get user's purchases and profile data
    // First find user_id by email from auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === email);
    let purchases: any[] = [];
    let profile: any = null;
    let banInfo: any = null;

    if (authUser) {
      // Fetch purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', authUser.id)
        .order('purchased_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Map snake_case to camelCase for frontend
      purchases = purchasesData?.map(p => ({
        id: p.id,
        productName: p.product_name,
        productType: p.product_type,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        appsIncluded: p.apps_included,
        purchasedAt: p.purchased_at,
      })) || [];

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profileError && profileData) {
        profile = {
          name: profileData.name,
          avatar: profileData.avatar,
          protocolStartDatePro: profileData.protocol_start_date_pro,
        };
      }

      // Fetch ban info from audit logs
      const { data: banLog, error: banError } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('target_user_id', authUser.id)
        .eq('action_type', 'ban_user')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!banError && banLog) {
        // Check if user is still banned (no unban after this ban)
        const { data: unbanLog } = await supabase
          .from('admin_audit_logs')
          .select('created_at')
          .eq('target_user_id', authUser.id)
          .eq('action_type', 'unban_user')
          .gt('created_at', banLog.created_at)
          .single();

        if (!unbanLog) {
          banInfo = {
            reason: banLog.metadata?.reason || 'No reason provided',
            bannedAt: banLog.created_at,
            bannedBy: banLog.admin_email,
          };
        }
      }
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

    // Add purchases to timeline
    purchases.forEach((purchase) => {
      timeline.push({
        id: purchase.id,
        type: 'purchase',
        timestamp: purchase.purchased_at,
        data: purchase,
      });
    });

    // Sort timeline by timestamp (most recent first)
    timeline.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Calculate stats
    const totalSpent = purchases
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const stats = {
      totalChatSessions: chatSessions?.length || 0,
      totalFunnelAttempts: funnelSessions?.length || 0,
      completedFunnels: funnelSessions?.filter((s) => s.completed).length || 0,
      totalEvents: funnelEvents.length,
      firstName: funnelSessions?.[0]?.user_data?.firstName || null,
      totalPurchases: purchases.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      activeApps: [...new Set(purchases.flatMap((p) => p.apps_included || []))],
    };

    return NextResponse.json({
      email,
      userId: authUser?.id || null,
      userCreatedAt: authUser?.created_at || null,
      emailVerified: authUser?.email_confirmed_at ? true : false,
      profile: profile,
      banned: banInfo !== null,
      banInfo: banInfo,
      stats,
      timeline,
      chatSessions: chatSessions || [],
      funnelSessions: funnelSessions || [],
      purchases: purchases || [],
    });
  } catch (error: any) {
    console.error('Error fetching user timeline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user timeline' },
      { status: 500 }
    );
  }
}
