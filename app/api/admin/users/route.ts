import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface UserData {
  email: string;
  firstName?: string;
  chatSessions: number;
  funnelAttempts: number;
  converted: boolean;
  lastActivity: string;
  purchasesCount: number;
  totalSpent: number;
  latestPurchase?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get all chat sessions emails
    const { data: chatSessions, error: chatError } = await supabase
      .from('chat_sessions')
      .select('email, created_at, updated_at');

    if (chatError) throw chatError;

    // Get all funnel sessions emails and user data
    const { data: funnelSessions, error: funnelError } = await supabase
      .from('funnel_sessions')
      .select('user_email, user_data, completed, entry_time, last_activity');

    if (funnelError) throw funnelError;

    // Get all purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        user_id,
        amount,
        status,
        purchased_at,
        profiles:user_id (
          id,
          name
        )
      `)
      .eq('status', 'completed');

    if (purchasesError) throw purchasesError;

    // Merge and aggregate data by email
    const usersMap = new Map<string, UserData>();

    // Process chat sessions
    chatSessions?.forEach((session) => {
      if (!session.email) return;

      const existing = usersMap.get(session.email);
      if (existing) {
        existing.chatSessions += 1;
        if (new Date(session.updated_at) > new Date(existing.lastActivity)) {
          existing.lastActivity = session.updated_at;
        }
      } else {
        usersMap.set(session.email, {
          email: session.email,
          chatSessions: 1,
          funnelAttempts: 0,
          converted: false,
          lastActivity: session.updated_at,
          purchasesCount: 0,
          totalSpent: 0,
        });
      }
    });

    // Process funnel sessions
    funnelSessions?.forEach((session) => {
      if (!session.user_email) return;

      const existing = usersMap.get(session.user_email);
      if (existing) {
        existing.funnelAttempts += 1;
        if (session.completed) {
          existing.converted = true;
        }
        if (new Date(session.last_activity) > new Date(existing.lastActivity)) {
          existing.lastActivity = session.last_activity;
        }
        // Add firstName if available
        if (session.user_data?.firstName && !existing.firstName) {
          existing.firstName = session.user_data.firstName;
        }
      } else {
        usersMap.set(session.user_email, {
          email: session.user_email,
          firstName: session.user_data?.firstName,
          chatSessions: 0,
          funnelAttempts: 1,
          converted: session.completed || false,
          lastActivity: session.last_activity,
          purchasesCount: 0,
          totalSpent: 0,
        });
      }
    });

    // Process purchases - match by user_id to email from profiles
    // First, create a map of user_id to email from existing users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id');

    // Get auth.users emails to match with purchases user_id
    purchases?.forEach((purchase: any) => {
      // We need to find the email for this user_id
      // Since purchases have user_id, we need to get the email from auth.users
      // For now, we'll aggregate by user_id and match later
    });

    // Alternative approach: Get profiles with email mapping
    const { data: profilesWithAuth } = await supabase
      .from('profiles')
      .select('id, name');

    // Create user_id to existing usersMap mapping
    // We'll need to query auth.users table for emails
    // Since we can't directly access auth.users, let's use a different approach

    // Group purchases by user_id first
    const purchasesByUserId = new Map<string, { count: number; total: number; latest: string }>();
    purchases?.forEach((purchase: any) => {
      const userId = purchase.user_id;
      const existing = purchasesByUserId.get(userId);
      if (existing) {
        existing.count += 1;
        existing.total += parseFloat(purchase.amount);
        if (new Date(purchase.purchased_at) > new Date(existing.latest)) {
          existing.latest = purchase.purchased_at;
        }
      } else {
        purchasesByUserId.set(userId, {
          count: 1,
          total: parseFloat(purchase.amount),
          latest: purchase.purchased_at,
        });
      }
    });

    // Now we need to match user_id to email
    // Get all profiles to map id to emails in chat_sessions or funnel_sessions
    // This is tricky - we'll fetch auth users list with service role
    const { data: authUsers } = await supabase.auth.admin.listUsers();

    authUsers?.users.forEach((authUser) => {
      const userId = authUser.id;
      const email = authUser.email;

      if (!email) return;

      const purchaseData = purchasesByUserId.get(userId);
      if (purchaseData) {
        const existing = usersMap.get(email);
        if (existing) {
          existing.purchasesCount = purchaseData.count;
          existing.totalSpent = Math.round(purchaseData.total * 100) / 100;
          existing.latestPurchase = purchaseData.latest;
        } else {
          // User has purchases but no chat/funnel activity
          usersMap.set(email, {
            email,
            chatSessions: 0,
            funnelAttempts: 0,
            converted: true, // Has made a purchase
            lastActivity: purchaseData.latest,
            purchasesCount: purchaseData.count,
            totalSpent: Math.round(purchaseData.total * 100) / 100,
            latestPurchase: purchaseData.latest,
          });
        }
      }
    });

    // Convert to array and filter by search
    let users = Array.from(usersMap.values());

    if (search) {
      users = users.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by last activity (most recent first)
    users.sort((a, b) => {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users data' },
      { status: 500 }
    );
  }
}
