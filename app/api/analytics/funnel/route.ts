import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Validate required fields
    if (!event.event || !event.sessionId || !event.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store in Supabase if available
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('funnel_events')
        .insert({
          event_type: event.event,
          session_id: event.sessionId,
          timestamp: new Date(event.timestamp).toISOString(),
          step: event.step,
          choice: event.choice,
          tier: event.tier,
          url: event.url,
          user_data: event.userData,
          metadata: event.metadata,
        });

      if (error) {
        console.error('Supabase error:', error);
        // Don't fail the request if Supabase is unavailable
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
