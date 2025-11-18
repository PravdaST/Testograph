import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/testograph-data
 *
 * Comprehensive data endpoint for testograph-v2 app (app.testograph.eu)
 * Supports multiple types: overview, quiz, workouts, nutrition, sleep, purchases_access
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (type) {
      case 'overview':
        return NextResponse.json(await getOverviewStats());

      case 'quiz':
        return NextResponse.json(await getQuizData(limit, offset));

      case 'workouts':
        return NextResponse.json(await getWorkoutData(limit, offset));

      case 'nutrition':
        return NextResponse.json(await getNutritionData(limit, offset));

      case 'sleep':
        return NextResponse.json(await getSleepData(limit, offset));

      case 'purchases_access':
        return NextResponse.json(await getPurchasesAccessData(limit, offset));

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error fetching testograph data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// ===== OVERVIEW STATS =====
async function getOverviewStats() {
  const [
    { count: totalUsers },
    { count: totalQuizzes },
    { count: totalWorkouts },
    { count: totalMeals },
    { count: totalSleep },
    { data: inventoryData },
    { data: purchasesData }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_results_v2').select('*', { count: 'exact', head: true }),
    supabase.from('workout_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('meal_completions').select('*', { count: 'exact', head: true }),
    supabase.from('sleep_tracking').select('*', { count: 'exact', head: true }),
    supabase.from('testoup_inventory').select('email, capsules_remaining'),
    supabase.from('purchases').select('amount, status')
  ]);

  const activeUsers = inventoryData?.filter(i => i.capsules_remaining > 0).length || 0;
  const totalRevenue = purchasesData?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalPurchases = purchasesData?.filter(p => p.status === 'completed').length || 0;

  return {
    success: true,
    stats: {
      totalUsers: totalUsers || 0,
      activeUsers,
      totalQuizzes: totalQuizzes || 0,
      totalWorkouts: totalWorkouts || 0,
      totalMeals: totalMeals || 0,
      totalSleep: totalSleep || 0,
      totalPurchases,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    }
  };
}

// ===== QUIZ DATA =====
async function getQuizData(limit: number, offset: number) {
  const { data: quizResults, error, count } = await supabase
    .from('quiz_results_v2')
    .select('email, category, level, total_score, workout_location, completed_at', { count: 'exact' })
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    success: true,
    data: quizResults || [],
    total: count || 0
  };
}

// ===== WORKOUT DATA =====
async function getWorkoutData(limit: number, offset: number) {
  const { data: workouts, error, count } = await supabase
    .from('workout_sessions')
    .select('email, date, completed', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Get exercise count per session
  const enrichedWorkouts = await Promise.all(
    (workouts || []).map(async (session) => {
      const { count: exerciseCount } = await supabase
        .from('exercise_logs')
        .select('*', { count: 'exact', head: true })
        .eq('email', session.email)
        .eq('date', session.date);

      return {
        ...session,
        exercisesCount: exerciseCount || 0
      };
    })
  );

  return {
    success: true,
    data: enrichedWorkouts,
    total: count || 0
  };
}

// ===== NUTRITION DATA =====
async function getNutritionData(limit: number, offset: number) {
  const { data: meals, error, count } = await supabase
    .from('meal_completions')
    .select('email, meal_time, date, completed', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    success: true,
    data: meals || [],
    total: count || 0
  };
}

// ===== SLEEP DATA =====
async function getSleepData(limit: number, offset: number) {
  const { data: sleep, error, count } = await supabase
    .from('sleep_tracking')
    .select('email, date, hours_slept, quality, bedtime, wake_time', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    success: true,
    data: sleep || [],
    total: count || 0
  };
}

// ===== PURCHASES & ACCESS DATA =====
async function getPurchasesAccessData(limit: number, offset: number) {
  // Get all purchases
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('*')
    .order('purchased_at', { ascending: false });

  if (purchasesError) throw purchasesError;

  // Get inventory for all users
  const { data: inventory } = await supabase
    .from('testoup_inventory')
    .select('*');

  // Get quiz results for access status
  const { data: quizResults } = await supabase
    .from('quiz_results_v2')
    .select('email, has_active_access, access_start_date, access_end_date, access_type');

  // Get auth users for email mapping
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const userMap = new Map(authUsers?.users.map(u => [u.id, u.email]));

  // Get profiles for names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email, first_name');
  const nameMap = new Map(profiles?.map(p => [p.email, p.first_name]));

  // Merge all data
  const inventoryMap = new Map(inventory?.map(i => [i.email, i]));
  const accessMap = new Map(quizResults?.map(q => [q.email, q]));

  const enrichedData = (purchases || []).map(purchase => {
    const email = userMap.get(purchase.user_id) || 'Unknown';
    const inv = inventoryMap.get(email);
    const access = accessMap.get(email);

    return {
      id: purchase.id,
      email,
      userName: nameMap.get(email) || null,
      productName: purchase.product_name,
      amount: purchase.amount,
      purchasedAt: purchase.purchased_at,
      status: purchase.status,
      // Inventory
      capsulesRemaining: inv?.capsules_remaining || 0,
      bottlesPurchased: inv?.bottles_purchased || 0,
      lastRefillDate: inv?.last_refill_date || null,
      // Access
      hasActiveAccess: access?.has_active_access || false,
      accessStartDate: access?.access_start_date || null,
      accessEndDate: access?.access_end_date || null,
      accessType: access?.access_type || null
    };
  });

  // Apply pagination
  const paginatedData = enrichedData.slice(offset, offset + limit);

  return {
    success: true,
    data: paginatedData,
    total: enrichedData.length
  };
}
