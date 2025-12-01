import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/testograph-data
 *
 * Comprehensive data endpoint for Testograph app (app.testograph.eu)
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
    supabase.from('testoup_purchase_history').select('order_total').not('email', 'ilike', '%test%').not('order_id', 'eq', 'MANUAL_REFILL')
  ]);

  const activeUsers = inventoryData?.filter(i => i.capsules_remaining > 0).length || 0;
  const totalRevenue = purchasesData?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;
  const totalPurchases = purchasesData?.length || 0;

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
    .select('email, category, determined_level, total_score, workout_location, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Map to expected format
  const mappedResults = (quizResults || []).map(q => ({
    email: q.email,
    category: q.category,
    level: q.determined_level,
    total_score: q.total_score,
    workout_location: q.workout_location,
    completed_at: q.created_at
  }));

  return {
    success: true,
    data: mappedResults,
    total: count || 0
  };
}

// ===== WORKOUT DATA =====
async function getWorkoutData(limit: number, offset: number) {
  const { data: workouts, error, count } = await supabase
    .from('workout_sessions')
    .select('email, date, completed, duration_minutes, workout_type', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    success: true,
    data: workouts || [],
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
    .select('email, date, hours, quality, bedtime, wake_time', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Map to expected format
  const mappedSleep = (sleep || []).map(s => ({
    ...s,
    hours_slept: s.hours  // Map for backward compatibility
  }));

  return {
    success: true,
    data: mappedSleep,
    total: count || 0
  };
}

// ===== PURCHASES & ACCESS DATA =====
async function getPurchasesAccessData(limit: number, offset: number) {
  // Get all purchases from testoup_purchase_history
  const { data: purchases, error: purchasesError } = await supabase
    .from('testoup_purchase_history')
    .select('*')
    .not('email', 'ilike', '%test%')
    .not('order_id', 'eq', 'MANUAL_REFILL')
    .order('order_date', { ascending: false });

  if (purchasesError) throw purchasesError;

  // Get inventory for all users
  const { data: inventory } = await supabase
    .from('testoup_inventory')
    .select('*');

  // Get users table for subscription/access status
  const { data: usersData } = await supabase
    .from('users')
    .select('email, has_active_subscription, subscription_expires_at, created_at');

  // Merge all data
  const inventoryMap = new Map(inventory?.map(i => [i.email, i]));
  const usersMap = new Map(usersData?.map(u => [u.email, u]));

  const enrichedData = (purchases || []).map(purchase => {
    const email = purchase.email;
    const inv = inventoryMap.get(email);
    const user = usersMap.get(email);

    return {
      id: purchase.id,
      orderId: purchase.order_id,
      email,
      userName: null, // Not stored in testoup_purchase_history
      productName: purchase.product_type === 'full' ? 'TestoUP (60 капсули)' : 'TestoUP Проба (10 капсули)',
      amount: parseFloat(purchase.order_total) || 0,
      purchasedAt: purchase.order_date,
      status: 'paid',
      productType: purchase.product_type,
      bottles: purchase.bottles_purchased,
      capsules: purchase.capsules_added,
      // Inventory
      capsulesRemaining: inv?.capsules_remaining || 0,
      bottlesPurchased: inv?.bottles_purchased || 0,
      lastRefillDate: inv?.last_purchase_date || null,
      // Access (from users table)
      hasActiveAccess: user?.has_active_subscription || false,
      accessStartDate: user?.created_at || null,
      accessEndDate: user?.subscription_expires_at || null,
      accessType: user?.has_active_subscription ? 'subscription' : null
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
