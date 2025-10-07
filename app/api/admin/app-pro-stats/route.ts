import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all users with PRO access from purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('user_id, apps_included')
      .eq('status', 'completed');

    const proUsers = new Set<string>();
    const appUsers = new Set<string>();

    purchases?.forEach((purchase) => {
      const apps = purchase.apps_included || [];
      if (apps.includes('testograph-pro')) {
        proUsers.add(purchase.user_id);
      }
      if (apps.some((app: string) =>
        ['meal-planner', 'sleep-protocol', 'exercise-guide', 'lab-testing', 'supplement-timing'].includes(app)
      )) {
        appUsers.add(purchase.user_id);
      }
    });

    // Count active meal plans
    const { count: mealPlansCount } = await supabase
      .from('meal_plans_app')
      .select('*', { count: 'exact', head: true });

    // Count sleep logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: sleepLogsCount } = await supabase
      .from('sleep_logs_app')
      .select('*', { count: 'exact', head: true })
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0]);

    // Count exercise logs (last 30 days)
    const { count: exerciseLogsCount } = await supabase
      .from('exercise_logs_app')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Count lab results (all time)
    const { count: labResultsCount } = await supabase
      .from('lab_results_app')
      .select('*', { count: 'exact', head: true });

    // Get PRO protocol statistics
    const { data: profiles } = await supabase
      .from('profiles')
      .select('protocol_start_date_pro')
      .not('protocol_start_date_pro', 'is', null);

    const activeProProtocols = profiles?.length || 0;

    // Get daily entries count (last 30 days)
    const { count: dailyEntriesCount } = await supabase
      .from('daily_entries_pro')
      .select('*', { count: 'exact', head: true })
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    // Calculate average compliance rate
    const { data: allDailyEntries } = await supabase
      .from('daily_entries_pro')
      .select('plan_compliance');

    const averageCompliance = allDailyEntries && allDailyEntries.length > 0
      ? Math.round(
          (allDailyEntries.reduce((sum, entry) => sum + (entry.plan_compliance || 0), 0) /
            allDailyEntries.length) *
            10
        ) /
        10
      : null;

    // Get weekly measurements count
    const { count: weightTrackingCount } = await supabase
      .from('weekly_measurements_pro')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      app: {
        totalUsers: appUsers.size,
        activeMealPlans: mealPlansCount || 0,
        sleepLogsLast30Days: sleepLogsCount || 0,
        exerciseLogsLast30Days: exerciseLogsCount || 0,
        totalLabResults: labResultsCount || 0,
      },
      pro: {
        totalUsers: proUsers.size,
        activeProtocols: activeProProtocols,
        dailyEntriesLast30Days: dailyEntriesCount || 0,
        averageCompliance,
        totalWeightTracking: weightTrackingCount || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching app/pro stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch app/pro stats' },
      { status: 500 }
    );
  }
}
