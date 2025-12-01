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

    // Total app users (from users table - app.testograph.eu)
    const { count: totalAppUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total site users (from profiles - testograph.eu Supabase auth)
    const { count: totalSiteUsers } = await supabase
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

    const { data: activeTestoUpUsers } = await supabase
      .from('testoup_tracking')
      .select('email')
      .gte('date', thirtyDaysAgoStr);

    const activeUserEmails = new Set([
      ...(activeMealUsers?.map(u => u.email) || []),
      ...(activeWorkoutUsers?.map(u => u.email) || []),
      ...(activeSleepUsers?.map(u => u.email) || []),
      ...(activeTestoUpUsers?.map(u => u.email) || []),
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

    // ===== PURCHASE STATS (from testoup_purchase_history) =====

    // Total revenue from Shopify orders
    const { data: purchasesData } = await supabase
      .from('testoup_purchase_history')
      .select('order_total, product_type')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY');

    const totalRevenue = purchasesData?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;
    const totalPurchases = purchasesData?.length || 0;
    const avgOrderValue = totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases) : 0;

    // Product breakdown by type
    const productBreakdown: Record<string, number> = {};
    purchasesData?.forEach(p => {
      const productName = p.product_type === 'full' ? 'TestoUP (60 капсули)' : 'TestoUP Проба (10 капсули)';
      productBreakdown[productName] = (productBreakdown[productName] || 0) + 1;
    });

    // ===== PENDING ORDERS STATS =====
    const { data: pendingOrdersData } = await supabase
      .from('pending_orders')
      .select('order_id, email, total_price, status')
      .eq('status', 'pending');

    const pendingOrdersCount = pendingOrdersData?.length || 0;
    const pendingWithEmail = pendingOrdersData?.filter(o => o.email && o.email !== '').length || 0;
    const pendingWithoutEmail = pendingOrdersCount - pendingWithEmail;
    const pendingRevenue = pendingOrdersData?.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0) || 0;

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

    // ===== TESTOUP INVENTORY STATS =====
    const { data: inventoryData } = await supabase
      .from('testoup_inventory')
      .select('email, capsules_remaining, total_capsules, bottles_purchased');

    const inventoryStats = {
      totalUsers: inventoryData?.length || 0,
      lowStock: inventoryData?.filter(i => i.capsules_remaining > 0 && i.capsules_remaining <= 10).length || 0,
      outOfStock: inventoryData?.filter(i => i.capsules_remaining === 0).length || 0,
      healthyStock: inventoryData?.filter(i => i.capsules_remaining > 10).length || 0,
      totalBottlesPurchased: inventoryData?.reduce((sum, i) => sum + (i.bottles_purchased || 0), 0) || 0,
    };

    // ===== AI COACH STATS =====
    const { count: totalCoachMessages } = await supabase
      .from('coach_messages')
      .select('*', { count: 'exact', head: true });

    const { data: coachEmailsData } = await supabase
      .from('coach_messages')
      .select('email');

    const uniqueCoachUsers = new Set(coachEmailsData?.map(c => c.email) || []).size;

    const { count: recentCoachMessages } = await supabase
      .from('coach_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoStr);

    const coachStats = {
      totalMessages: totalCoachMessages || 0,
      uniqueUsers: uniqueCoachUsers,
      recentMessages: recentCoachMessages || 0,
    };

    // ===== AFFILIATE STATS =====
    const { count: affiliateApplications } = await supabase
      .from('affiliate_applications')
      .select('*', { count: 'exact', head: true });

    const { count: pendingApplications } = await supabase
      .from('affiliate_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: activeAffiliates } = await supabase
      .from('affiliates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: affiliateOrdersData } = await supabase
      .from('affiliate_orders')
      .select('commission_amount');

    const { count: totalAffiliateClicks } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true });

    const affiliateStats = {
      totalApplications: affiliateApplications || 0,
      pendingApplications: pendingApplications || 0,
      activeAffiliates: activeAffiliates || 0,
      totalClicks: totalAffiliateClicks || 0,
      totalOrders: affiliateOrdersData?.length || 0,
      totalCommission: affiliateOrdersData?.reduce((sum, o) => sum + (o.commission_amount || 0), 0) || 0,
    };

    // ===== CONVERSION FUNNEL =====
    // Get unique quiz emails
    const { data: quizEmails } = await supabase
      .from('quiz_results_v2')
      .select('email');

    const uniqueQuizEmails = new Set(quizEmails?.map(q => q.email).filter(Boolean) || []);

    // Get users table emails (app registrations)
    const { data: userEmails } = await supabase
      .from('users')
      .select('email, has_active_subscription');

    const registeredEmails = new Set(userEmails?.map(u => u.email) || []);
    const subscribedEmails = new Set(userEmails?.filter(u => u.has_active_subscription).map(u => u.email) || []);

    // Calculate conversions
    const quizToRegistration = uniqueQuizEmails.size > 0
      ? Math.round((registeredEmails.size / uniqueQuizEmails.size) * 100)
      : 0;

    const registrationToSubscription = registeredEmails.size > 0
      ? Math.round((subscribedEmails.size / registeredEmails.size) * 100)
      : 0;

    const conversionFunnel = {
      quizCompletions: uniqueQuizEmails.size,
      appRegistrations: registeredEmails.size,
      activeSubscriptions: subscribedEmails.size,
      quizToRegistrationRate: quizToRegistration,
      registrationToSubscriptionRate: registrationToSubscription,
      notRegistered: uniqueQuizEmails.size - registeredEmails.size,
    };

    // ===== FEEDBACK STATS =====
    const { count: totalFeedback } = await supabase
      .from('feedback_submissions')
      .select('*', { count: 'exact', head: true });

    const { count: recentFeedback } = await supabase
      .from('feedback_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoStr);

    const feedbackStats = {
      total: totalFeedback || 0,
      recent: recentFeedback || 0,
    };

    // ===== BODY MEASUREMENTS STATS =====
    const { count: totalMeasurements } = await supabase
      .from('body_measurements')
      .select('*', { count: 'exact', head: true });

    const { data: measurementUsers } = await supabase
      .from('body_measurements')
      .select('email');

    const uniqueMeasurementUsers = new Set(measurementUsers?.map(m => m.email) || []).size;

    const measurementStats = {
      total: totalMeasurements || 0,
      uniqueUsers: uniqueMeasurementUsers,
    };

    // ===== PROGRESS PHOTOS STATS =====
    const { count: totalPhotos } = await supabase
      .from('progress_photos')
      .select('*', { count: 'exact', head: true });

    const { data: photoUsers } = await supabase
      .from('progress_photos')
      .select('email');

    const uniquePhotoUsers = new Set(photoUsers?.map(p => p.email) || []).size;

    const photoStats = {
      total: totalPhotos || 0,
      uniqueUsers: uniquePhotoUsers,
    };

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
        total: totalAppUsers || 0,
        siteUsers: totalSiteUsers || 0,
        active: activeUsers,
        // Cap percentage at 100% (active users might be from tracking tables before user record exists)
        activePercentage: totalAppUsers ? Math.min(100, Math.round((activeUsers / totalAppUsers) * 100)) : 0,
      },
      engagement: {
        period: '30 days',
        mealLogs: totalMealLogs || 0,
        workoutSessions: totalWorkoutSessions || 0,
        sleepEntries: totalSleepEntries || 0,
        testoUpCompliance: avgTestoUpCompliance,
      },
      purchases: {
        totalRevenue,
        totalPurchases,
        averageOrderValue: avgOrderValue,
        productBreakdown,
        // Pending orders (COD not yet delivered)
        pendingOrders: pendingOrdersCount,
        pendingWithEmail,
        pendingWithoutEmail,
        pendingRevenue,
      },
      program: {
        completionRate: programCompletionRate,
        completedPrograms: completedPrograms || 0,
        activePrograms: (totalQuizzes || 0) - (completedPrograms || 0),
      },
      // NEW: TestoUP Inventory Stats
      inventory: inventoryStats,
      // NEW: AI Coach Stats
      coach: coachStats,
      // NEW: Affiliate Stats
      affiliates: affiliateStats,
      // NEW: Conversion Funnel
      funnel: conversionFunnel,
      // NEW: Feedback Stats
      feedback: feedbackStats,
      // NEW: Body Measurements
      measurements: measurementStats,
      // NEW: Progress Photos
      photos: photoStats,
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
