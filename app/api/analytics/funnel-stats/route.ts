import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS policies in server-side API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Total sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('funnel_sessions')
      .select('*')
      .gte('entry_time', dateThreshold.toISOString());

    if (sessionsError) throw sessionsError;

    // Conversion funnel (step by step)
    const { data: stepEvents, error: stepError } = await supabase
      .from('funnel_events')
      .select('step_number, session_id')
      .eq('event_type', 'step_entered')
      .gte('timestamp', dateThreshold.toISOString());

    if (stepError) throw stepError;

    // Calculate conversion rates
    const stepCounts: Record<number, Set<string>> = {};
    stepEvents?.forEach((event) => {
      if (!stepCounts[event.step_number]) {
        stepCounts[event.step_number] = new Set();
      }
      stepCounts[event.step_number].add(event.session_id);
    });

    const conversionFunnel = Object.keys(stepCounts)
      .map(Number)
      .sort((a, b) => a - b)
      .map((step) => {
        const count = stepCounts[step].size;
        const rate = stepCounts[1]
          ? (count / stepCounts[1].size) * 100
          : 0;
        return {
          step,
          visitors: count,
          conversionRate: Math.round(rate * 10) / 10,
        };
      });

    // Offer performance
    const offerCounts = {
      premium: sessions?.filter((s) => s.offer_tier === 'premium').length || 0,
      regular: sessions?.filter((s) => s.offer_tier === 'regular').length || 0,
      digital: sessions?.filter((s) => s.offer_tier === 'digital').length || 0,
    };

    // CTA clicks
    const { data: ctaClicks, error: ctaError } = await supabase
      .from('funnel_events')
      .select('metadata')
      .eq('event_type', 'button_clicked')
      .like('metadata->>buttonText', '%CTA:%')
      .gte('timestamp', dateThreshold.toISOString());

    if (ctaError) throw ctaError;

    // Drop-off analysis
    const exitSteps: Record<number, number> = {};
    sessions
      ?.filter((s) => s.exit_step && !s.completed)
      .forEach((s) => {
        exitSteps[s.exit_step] = (exitSteps[s.exit_step] || 0) + 1;
      });

    const dropOffData = Object.entries(exitSteps)
      .map(([step, count]) => ({
        step: parseInt(step),
        exits: count,
        percentage: sessions?.length
          ? Math.round((count / sessions.length) * 1000) / 10
          : 0,
      }))
      .sort((a, b) => b.exits - a.exits);

    // Average time in funnel
    const avgTimeInFunnel = sessions?.length
      ? sessions.reduce((sum, s) => {
          const entry = new Date(s.entry_time).getTime();
          const lastActivity = new Date(s.last_activity).getTime();
          return sum + (lastActivity - entry);
        }, 0) / sessions.length / 1000 // seconds
      : 0;

    // Overall stats
    const stats = {
      totalSessions: sessions?.length || 0,
      completedSessions: sessions?.filter((s) => s.completed).length || 0,
      overallConversionRate: sessions?.length
        ? Math.round(
            (sessions.filter((s) => s.completed).length / sessions.length) *
              1000
          ) / 10
        : 0,
      avgTimeInFunnel: Math.round(avgTimeInFunnel),
      mostCommonExitStep: dropOffData[0]?.step || null,
      totalCTAClicks: ctaClicks?.length || 0,
    };

    return NextResponse.json({
      stats,
      conversionFunnel,
      offerPerformance: offerCounts,
      dropOffData,
      dateRange: {
        from: dateThreshold.toISOString(),
        to: new Date().toISOString(),
        days,
      },
    });
  } catch (error: any) {
    console.error('Error fetching funnel stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
