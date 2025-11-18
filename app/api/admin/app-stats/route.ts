import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/app-stats
 *
 * Comprehensive stats for testograph-v2 app (app.testograph.eu)
 * Returns REAL data from quiz, profiles, and engagement tracking
 */
export async function GET() {
  try {
    // Calculate date 30 days ago for engagement metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // ===== QUIZ ANALYTICS =====

    // Total quiz completions
    const { count: totalQuizzes } = await supabase
      .from('quiz_results_v2')
      .select('*', { count: 'exact', head: true });

    // Category breakdown
    const { data: categoryData } = await supabase
      .from('quiz_results_v2')
      .select('category');

    const categoryBreakdown = {
      energy: categoryData?.filter(q => q.category === 'energy').length || 0,
      libido: categoryData?.filter(q => q.category === 'libido').length || 0,
      muscle: categoryData?.filter(q => q.category === 'muscle').length || 0,
    };

    // Average quiz score
    const { data: scoresData } = await supabase
      .from('quiz_results_v2')
      .select('total_score');

    const avgQuizScore = scoresData && scoresData.length > 0
      ? Math.round(scoresData.reduce((sum, q) => sum + (q.total_score || 0), 0) / scoresData.length)
      : 0;

    // Workout location distribution
    const { data: locationData } = await supabase
      .from('quiz_results_v2')
      .select('workout_location');

    const workoutLocationBreakdown = {
      gym: locationData?.filter(q => q.workout_location === 'gym').length || 0,
      home: locationData?.filter(q => q.workout_location === 'home').length || 0,
    };

    // Dietary preferences distribution (from users table)
    const { data: dietData } = await supabase
      .from('users')
      .select('dietary_preference')
      .not('dietary_preference', 'is', null);

    const dietaryPreferences = {
      omnivor: dietData?.filter(d => d.dietary_preference === 'omnivor').length || 0,
      vegetarian: dietData?.filter(d => d.dietary_preference === 'vegetarian').length || 0,
      vegan: dietData?.filter(d => d.dietary_preference === 'vegan').length || 0,
      pescatarian: dietData?.filter(d => d.dietary_preference === 'pescatarian').length || 0,
    };

    // ===== USER METRICS =====

    // Total registered users (profiles)
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active users in last 30 days (users with any activity)
    const { data: activeMealUsers } = await supabase
      .from('meal_completions')
      .select('email')
      .gte('date', thirtyDaysAgoStr);

    const { data: activeWorkoutUsers } = await supabase
      .from('workout_sessions')
      .select('email')
      .gte('date', thirtyDaysAgoStr);

    const { data: activeSleepUsers } = await supabase
      .from('sleep_tracking')
      .select('email')
      .gte('date', thirtyDaysAgoStr);

    const activeUserEmails = new Set([
      ...(activeMealUsers?.map(u => u.email) || []),
      ...(activeWorkoutUsers?.map(u => u.email) || []),
      ...(activeSleepUsers?.map(u => u.email) || []),
    ]);

    const activeUsers = activeUserEmails.size;

    // ===== ENGAGEMENT METRICS (Last 30 days) =====

    // Meal logs
    const { count: totalMealLogs } = await supabase
      .from('meal_completions')
      .select('*', { count: 'exact', head: true })
      .gte('date', thirtyDaysAgoStr);

    // Workout sessions
    const { count: totalWorkoutSessions } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('date', thirtyDaysAgoStr);

    // Sleep entries
    const { count: totalSleepEntries } = await supabase
      .from('sleep_tracking')
      .select('*', { count: 'exact', head: true })
      .gte('date', thirtyDaysAgoStr);

    // TestoUP compliance
    const { data: testoUpData } = await supabase
      .from('testoup_tracking')
      .select('morning_taken, evening_taken')
      .gte('date', thirtyDaysAgoStr);

    let avgTestoUpCompliance = 0;
    if (testoUpData && testoUpData.length > 0) {
      const totalDoses = testoUpData.reduce((sum, record) => {
        return sum + (record.morning_taken ? 1 : 0) + (record.evening_taken ? 1 : 0);
      }, 0);
      const possibleDoses = testoUpData.length * 2;
      avgTestoUpCompliance = Math.round((totalDoses / possibleDoses) * 100);
    }

    // ===== PURCHASE STATS =====

    // Total revenue
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select('amount, product_name');

    const totalRevenue = purchasesData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalPurchases = purchasesData?.length || 0;
    const avgOrderValue = totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases) : 0;

    // Product breakdown
    const productBreakdown: Record<string, number> = {};
    purchasesData?.forEach(p => {
      const productName = p.product_name || 'Unknown';
      productBreakdown[productName] = (productBreakdown[productName] || 0) + 1;
    });

    // ===== PRO STATS =====

    // PRO users (users with protocol_start_date_pro set)
    const { count: proUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('protocol_start_date_pro', 'is', null);

    // PRO daily entries in last 30 days
    const { count: proDailyEntries } = await supabase
      .from('daily_entries_pro')
      .select('*', { count: 'exact', head: true })
      .gte('date', thirtyDaysAgoStr);

    // PRO average compliance
    const { data: proComplianceData } = await supabase
      .from('daily_entries_pro')
      .select('discipline_score')
      .gte('date', thirtyDaysAgoStr);

    const avgProCompliance = proComplianceData && proComplianceData.length > 0
      ? Math.round((proComplianceData.reduce((sum, e) => sum + (e.discipline_score || 0), 0) / proComplianceData.length) * 10) / 10
      : 0;

    // ===== PROGRAM COMPLETION =====

    // Users who completed their program (have program_end_date)
    const { count: completedPrograms } = await supabase
      .from('quiz_results_v2')
      .select('*', { count: 'exact', head: true })
      .not('program_end_date', 'is', null)
      .lte('program_end_date', new Date().toISOString());

    const programCompletionRate = totalQuizzes && totalQuizzes > 0
      ? Math.round((completedPrograms || 0) / totalQuizzes * 100)
      : 0;

    return NextResponse.json({
      success: true,
      quiz: {
        totalCompletions: totalQuizzes || 0,
        categoryBreakdown,
        categoryPercentages: {
          energy: totalQuizzes ? Math.round((categoryBreakdown.energy / totalQuizzes) * 100) : 0,
          libido: totalQuizzes ? Math.round((categoryBreakdown.libido / totalQuizzes) * 100) : 0,
          muscle: totalQuizzes ? Math.round((categoryBreakdown.muscle / totalQuizzes) * 100) : 0,
        },
        averageScore: avgQuizScore,
        workoutLocationBreakdown,
        dietaryPreferences,
      },
      users: {
        total: totalUsers || 0,
        active: activeUsers,
        activePercentage: totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0,
        proUsers: proUsersCount || 0,
      },
      engagement: {
        period: '30 days',
        mealLogs: totalMealLogs || 0,
        workoutSessions: totalWorkoutSessions || 0,
        sleepEntries: totalSleepEntries || 0,
        testoUpCompliance: avgTestoUpCompliance,
        proDailyEntries: proDailyEntries || 0,
        proCompliance: avgProCompliance,
      },
      purchases: {
        totalRevenue,
        totalPurchases,
        averageOrderValue: avgOrderValue,
        productBreakdown,
      },
      program: {
        completionRate: programCompletionRate,
        completedPrograms: completedPrograms || 0,
        activePrograms: (totalQuizzes || 0) - (completedPrograms || 0),
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        periodStart: thirtyDaysAgoStr,
        periodEnd: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching app stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch app stats',
    }, { status: 500 });
  }
}
