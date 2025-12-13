import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface CoachMessage {
  id: string;
  email: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  model_used?: string;
}

interface CoachSession {
  email: string;
  message_count: number;
  user_messages: number;
  assistant_messages: number;
  first_message_at: string;
  last_message_at: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // Get all coach messages (unified App Coach system)
    let query = supabase
      .from('coach_messages')
      .select('email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    // Group messages by email to create "sessions"
    const sessionMap = new Map<string, CoachSession>();

    (messages || []).forEach((msg: { email: string; role: string; created_at: string }) => {
      const existing = sessionMap.get(msg.email);

      if (!existing) {
        sessionMap.set(msg.email, {
          email: msg.email,
          message_count: 1,
          user_messages: msg.role === 'user' ? 1 : 0,
          assistant_messages: msg.role === 'assistant' ? 1 : 0,
          first_message_at: msg.created_at,
          last_message_at: msg.created_at,
        });
      } else {
        existing.message_count++;
        if (msg.role === 'user') existing.user_messages++;
        if (msg.role === 'assistant') existing.assistant_messages++;

        // Track first and last message times
        if (new Date(msg.created_at) < new Date(existing.first_message_at)) {
          existing.first_message_at = msg.created_at;
        }
        if (new Date(msg.created_at) > new Date(existing.last_message_at)) {
          existing.last_message_at = msg.created_at;
        }
      }
    });

    // Convert to array and sort by last activity
    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    // Apply pagination
    const total = sessions.length;
    const paginatedSessions = sessions.slice(offset, offset + limit);

    return NextResponse.json({
      sessions: paginatedSessions,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching coach sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch coach sessions' },
      { status: 500 }
    );
  }
}
