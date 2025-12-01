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
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);

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

    // Get quiz results for this user
    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results_v2')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let quizData = null;
    if (!quizError && quizResult) {
      quizData = {
        category: quizResult.category,
        level: quizResult.determined_level,
        totalScore: quizResult.total_score,
        workoutLocation: quizResult.workout_location,
        dietaryPreference: quizResult.dietary_preference,
        quizDate: quizResult.created_at,
        firstName: quizResult.first_name,
        // Breakdown scores
        breakdown: {
          symptoms: quizResult.breakdown_symptoms,
          nutrition: quizResult.breakdown_nutrition,
          training: quizResult.breakdown_training,
          sleepRecovery: quizResult.breakdown_sleep_recovery,
          context: quizResult.breakdown_context,
        },
      };
    }

    // Get user's purchases and profile data
    // First find user_id by email from auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === email);
    let purchases: any[] = [];
    let profile: any = null;
    let banInfo: any = null;
    let inventory: any = null;

    // Fetch purchases from testoup_purchase_history (by email directly)
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('testoup_purchase_history')
      .select('*')
      .eq('email', email)
      .order('order_date', { ascending: false });

    if (purchasesError) throw purchasesError;

    // Fetch inventory from testoup_inventory (current capsule balance)
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('testoup_inventory')
      .select('*')
      .eq('email', email)
      .single();

    if (!inventoryError && inventoryData) {
      inventory = {
        capsulesRemaining: inventoryData.capsules_remaining,
        totalBottles: inventoryData.bottles_purchased,
        lastPurchaseDate: inventoryData.last_purchase_date,
      };
    }

    // Map to frontend format
    purchases = purchasesData?.map(p => ({
      id: p.id,
      orderId: p.order_id,
      productName: p.product_type === 'full' ? 'TestoUP (60 капсули)' : 'TestoUP Проба (10 капсули)',
      productType: p.product_type,
      amount: parseFloat(p.order_total) || 0,
      currency: 'BGN',
      status: 'paid', // All entries in testoup_purchase_history are paid
      bottles: p.bottles_purchased,
      capsules: p.capsules_added,
      purchasedAt: p.order_date,
    })) || [];

    if (authUser) {

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
        timestamp: purchase.purchasedAt,
        data: purchase,
      });
    });

    // Sort timeline by timestamp (most recent first)
    timeline.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Calculate stats
    const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCapsules = purchases.reduce((sum, p) => sum + (p.capsules || 0), 0);

    const stats = {
      totalChatSessions: chatSessions?.length || 0,
      totalFunnelAttempts: funnelSessions?.length || 0,
      completedFunnels: funnelSessions?.filter((s) => s.completed).length || 0,
      totalEvents: funnelEvents.length,
      firstName: funnelSessions?.[0]?.user_data?.firstName || null,
      totalPurchases: purchases.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalCapsules,
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
      inventory: inventory,
      quizData: quizData,
    });
  } catch (error: any) {
    console.error('Error fetching user timeline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user timeline' },
      { status: 500 }
    );
  }
}
