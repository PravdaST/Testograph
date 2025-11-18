import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface AppDataStats {
  mealPlan: {
    hasActivePlan: boolean;
    planData: any;
    createdAt: string | null;
  };
  sleepLogs: {
    totalLogs: number;
    latestLogs: any[];
    averageQuality: number | null;
    lastLogDate: string | null;
  };
  labResults: {
    totalResults: number;
    latestResults: any[];
    lastTestDate: string | null;
  };
  exerciseLogs: {
    totalLogs: number;
    latestLogs: any[];
    lastWorkoutDate: string | null;
  };
  analyticsEvents: {
    totalEvents: number;
    recentEvents: any[];
    mostUsedFeatures: string[];
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);

    // Get user_id from email via auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = authUser.id;

    // Fetch meal plans
    const { data: mealPlans } = await supabase
      .from('meal_plans_app')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Fetch sleep logs
    const { data: sleepLogs } = await supabase
      .from('sleep_logs_app')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(10);

    // Fetch lab results
    const { data: labResults } = await supabase
      .from('lab_results_app')
      .select('*')
      .eq('user_id', userId)
      .order('test_date', { ascending: false })
      .limit(10);

    // Fetch exercise logs
    const { data: exerciseLogs } = await supabase
      .from('exercise_logs_app')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch analytics events
    const { data: analyticsEvents } = await supabase
      .from('analytics_events_app')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate statistics
    const stats: AppDataStats = {
      mealPlan: {
        hasActivePlan: !!mealPlans && mealPlans.length > 0,
        planData: mealPlans?.[0]?.plan_data || null,
        createdAt: mealPlans?.[0]?.created_at || null,
      },
      sleepLogs: {
        totalLogs: sleepLogs?.length || 0,
        latestLogs: sleepLogs || [],
        averageQuality: sleepLogs && sleepLogs.length > 0
          ? sleepLogs.reduce((sum, log) => sum + (log.quality || 0), 0) / sleepLogs.length
          : null,
        lastLogDate: sleepLogs?.[0]?.log_date || null,
      },
      labResults: {
        totalResults: labResults?.length || 0,
        latestResults: labResults || [],
        lastTestDate: labResults?.[0]?.test_date || null,
      },
      exerciseLogs: {
        totalLogs: exerciseLogs?.length || 0,
        latestLogs: exerciseLogs || [],
        lastWorkoutDate: exerciseLogs?.[0]?.created_at || null,
      },
      analyticsEvents: {
        totalEvents: analyticsEvents?.length || 0,
        recentEvents: analyticsEvents || [],
        mostUsedFeatures: getMostUsedFeatures(analyticsEvents || []),
      },
    };

    return NextResponse.json({
      email,
      userId,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching app data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch app data' },
      { status: 500 }
    );
  }
}

function getMostUsedFeatures(events: any[]): string[] {
  const featureCounts = events.reduce((acc, event) => {
    const feature = event.event_type || 'unknown';
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(featureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([feature]) => feature);
}
