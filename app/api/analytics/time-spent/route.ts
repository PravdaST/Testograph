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

    // Get all step_exited events with time spent
    const { data: exitEvents, error } = await supabase
      .from('funnel_events')
      .select('step_number, metadata')
      .eq('event_type', 'step_exited')
      .gte('timestamp', dateThreshold.toISOString());

    if (error) throw error;

    // Calculate average time per step
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

    const timeSpentData = Object.entries(stepTimes)
      .map(([step, times]) => {
        const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        return {
          step: parseInt(step),
          avgSeconds: Math.round(avg),
          minSeconds: min,
          maxSeconds: max,
          sampleSize: times.length,
        };
      })
      .sort((a, b) => a.step - b.step);

    return NextResponse.json({
      timeSpentData,
      dateRange: {
        from: dateThreshold.toISOString(),
        to: new Date().toISOString(),
        days,
      },
    });
  } catch (error: any) {
    console.error('Error fetching time spent data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch time spent data' },
      { status: 500 }
    );
  }
}
