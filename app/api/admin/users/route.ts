import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserData {
  email: string;
  firstName?: string;
  chatSessions: number;
  funnelAttempts: number;
  converted: boolean;
  lastActivity: string;
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
        });
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
