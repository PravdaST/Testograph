import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type'); // meal_plans, sleep_logs, lab_results, exercise_logs, analytics
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all auth users for email mapping
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const emailMap = new Map(
      authData.users.map(user => [user.id, user.email || 'Unknown'])
    );

    let data: any[] = [];
    let total = 0;

    // Fetch based on type
    if (dataType === 'meal_plans' || !dataType) {
      const { data: mealPlans, error, count } = await supabase
        .from('meal_plans_app')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error

      data = mealPlans?.map(plan => ({
        ...plan,
        userEmail: emailMap.get(plan.user_id) || 'Unknown',
        type: 'meal_plan'
      })) || [];
      total = count || 0;
    } else if (dataType === 'sleep_logs') {
      const { data: sleepLogs, error, count } = await supabase
        .from('sleep_logs_app')
        .select('*', { count: 'exact' })
        .order('log_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && error.code !== 'PGRST116') throw error;

      data = sleepLogs?.map(log => ({
        ...log,
        userEmail: emailMap.get(log.user_id) || 'Unknown',
        type: 'sleep_log'
      })) || [];
      total = count || 0;
    } else if (dataType === 'lab_results') {
      const { data: labResults, error, count } = await supabase
        .from('lab_results_app')
        .select('*', { count: 'exact' })
        .order('test_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && error.code !== 'PGRST116') throw error;

      data = labResults?.map(result => ({
        ...result,
        userEmail: emailMap.get(result.user_id) || 'Unknown',
        type: 'lab_result'
      })) || [];
      total = count || 0;
    } else if (dataType === 'exercise_logs') {
      const { data: exerciseLogs, error, count } = await supabase
        .from('exercise_logs_app')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && error.code !== 'PGRST116') throw error;

      data = exerciseLogs?.map(log => ({
        ...log,
        userEmail: emailMap.get(log.user_id) || 'Unknown',
        type: 'exercise_log'
      })) || [];
      total = count || 0;
    } else if (dataType === 'analytics') {
      const { data: analytics, error, count } = await supabase
        .from('analytics_events_app')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && error.code !== 'PGRST116') throw error;

      data = analytics?.map(event => ({
        ...event,
        userEmail: emailMap.get(event.user_id) || 'Unknown',
        type: 'analytics_event'
      })) || [];
      total = count || 0;
    }

    // Get overview stats if no type specified
    if (!dataType) {
      const stats = await getOverviewStats();
      return NextResponse.json({
        success: true,
        stats,
        data: [],
        total: 0
      });
    }

    return NextResponse.json({
      success: true,
      data,
      total,
      type: dataType
    });

  } catch (error: any) {
    console.error('Error fetching app data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch app data' },
      { status: 500 }
    );
  }
}

async function getOverviewStats() {
  try {
    // Get counts for each table
    const [mealPlans, sleepLogs, labResults, exerciseLogs, analytics] = await Promise.all([
      supabase.from('meal_plans_app').select('*', { count: 'exact', head: true }),
      supabase.from('sleep_logs_app').select('*', { count: 'exact', head: true }),
      supabase.from('lab_results_app').select('*', { count: 'exact', head: true }),
      supabase.from('exercise_logs_app').select('*', { count: 'exact', head: true }),
      supabase.from('analytics_events_app').select('*', { count: 'exact', head: true }),
    ]);

    // Get unique users count for each data type
    const [mealPlanUsers, sleepLogUsers, labResultUsers, exerciseLogUsers] = await Promise.all([
      supabase.from('meal_plans_app').select('user_id'),
      supabase.from('sleep_logs_app').select('user_id'),
      supabase.from('lab_results_app').select('user_id'),
      supabase.from('exercise_logs_app').select('user_id'),
    ]);

    const uniqueMealPlanUsers = new Set(mealPlanUsers.data?.map(d => d.user_id) || []).size;
    const uniqueSleepLogUsers = new Set(sleepLogUsers.data?.map(d => d.user_id) || []).size;
    const uniqueLabResultUsers = new Set(labResultUsers.data?.map(d => d.user_id) || []).size;
    const uniqueExerciseLogUsers = new Set(exerciseLogUsers.data?.map(d => d.user_id) || []).size;

    return {
      mealPlans: {
        total: mealPlans.count || 0,
        uniqueUsers: uniqueMealPlanUsers
      },
      sleepLogs: {
        total: sleepLogs.count || 0,
        uniqueUsers: uniqueSleepLogUsers
      },
      labResults: {
        total: labResults.count || 0,
        uniqueUsers: uniqueLabResultUsers
      },
      exerciseLogs: {
        total: exerciseLogs.count || 0,
        uniqueUsers: uniqueExerciseLogUsers
      },
      analyticsEvents: {
        total: analytics.count || 0
      }
    };
  } catch (error) {
    console.error('Error getting overview stats:', error);
    return {
      mealPlans: { total: 0, uniqueUsers: 0 },
      sleepLogs: { total: 0, uniqueUsers: 0 },
      labResults: { total: 0, uniqueUsers: 0 },
      exerciseLogs: { total: 0, uniqueUsers: 0 },
      analyticsEvents: { total: 0 }
    };
  }
}
