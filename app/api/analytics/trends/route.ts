import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get all funnel events for heatmap
    const { data: events, error: eventsError } = await supabase
      .from('funnel_events')
      .select('step_number, event_type, timestamp')
      .gte('timestamp', dateThreshold.toISOString());

    if (eventsError) throw eventsError;

    // Calculate activity heatmap per step
    const stepActivity: Record<number, { total: number; enters: number; exits: number; clicks: number }> = {};

    events?.forEach((event) => {
      if (!stepActivity[event.step_number]) {
        stepActivity[event.step_number] = {
          total: 0,
          enters: 0,
          exits: 0,
          clicks: 0,
        };
      }

      stepActivity[event.step_number].total += 1;

      if (event.event_type === 'step_entered') {
        stepActivity[event.step_number].enters += 1;
      } else if (event.event_type === 'step_exited') {
        stepActivity[event.step_number].exits += 1;
      } else if (event.event_type === 'button_clicked') {
        stepActivity[event.step_number].clicks += 1;
      }
    });

    // Convert to array and calculate intensity (0-100 scale)
    const maxActivity = Math.max(...Object.values(stepActivity).map((s) => s.total));

    const heatmapData = Object.entries(stepActivity)
      .map(([step, activity]) => ({
        step: parseInt(step),
        intensity: maxActivity > 0 ? Math.round((activity.total / maxActivity) * 100) : 0,
        enters: activity.enters,
        exits: activity.exits,
        clicks: activity.clicks,
        total: activity.total,
      }))
      .sort((a, b) => a.step - b.step);

    // Get funnel sessions for trend analysis
    const { data: sessions, error: sessionsError } = await supabase
      .from('funnel_sessions')
      .select('entry_time, completed, exit_step')
      .gte('entry_time', dateThreshold.toISOString())
      .order('entry_time', { ascending: true });

    if (sessionsError) throw sessionsError;

    // Group by day for trend comparison
    const dailyStats: Record<string, { sessions: number; completed: number; dropped: number }> = {};

    sessions?.forEach((session) => {
      const date = new Date(session.entry_time).toISOString().split('T')[0];

      if (!dailyStats[date]) {
        dailyStats[date] = { sessions: 0, completed: 0, dropped: 0 };
      }

      dailyStats[date].sessions += 1;

      if (session.completed) {
        dailyStats[date].completed += 1;
      } else if (session.exit_step) {
        dailyStats[date].dropped += 1;
      }
    });

    const trendData = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        sessions: stats.sessions,
        completed: stats.completed,
        dropped: stats.dropped,
        conversionRate: stats.sessions > 0
          ? Math.round((stats.completed / stats.sessions) * 1000) / 10
          : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate average time per step (from existing analytics)
    const { data: exitEvents, error: exitError } = await supabase
      .from('funnel_events')
      .select('step_number, metadata')
      .eq('event_type', 'step_exited')
      .gte('timestamp', dateThreshold.toISOString());

    if (exitError) throw exitError;

    const stepTimes: Record<number, number[]> = {};

    exitEvents?.forEach((event) => {
      const timeSpent = event.metadata?.timeSpentSeconds;
      if (timeSpent && typeof timeSpent === 'number') {
        if (!stepTimes[event.step_number]) {
          stepTimes[event.step_number] = [];
        }
        stepTimes[event.step_number].push(timeSpent);
      }
    });

    const avgTimePerStep = Object.entries(stepTimes)
      .map(([step, times]) => {
        const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
        return {
          step: parseInt(step),
          avgSeconds: Math.round(avg),
          sampleSize: times.length,
        };
      })
      .sort((a, b) => a.step - b.step);

    return NextResponse.json({
      heatmapData,
      trendData,
      avgTimePerStep,
      dateRange: {
        from: dateThreshold.toISOString(),
        to: new Date().toISOString(),
        days,
      },
    });
  } catch (error: any) {
    console.error('Error fetching trends data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trends data' },
      { status: 500 }
    );
  }
}
