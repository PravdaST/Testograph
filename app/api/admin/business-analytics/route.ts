import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/business-analytics
 * Returns comprehensive business metrics: Revenue, Retention, Email performance
 * Data source: testoup_purchase_history (Shopify orders)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // ============= REVENUE ANALYTICS =============
    // Using testoup_purchase_history - the main Shopify orders table

    // Total revenue and purchases (exclude test orders)
    const { data: allPurchases, error: purchasesError } = await supabase
      .from('testoup_purchase_history')
      .select('*')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY');

    if (purchasesError) throw purchasesError;

    // Recent purchases (for period)
    const { data: recentPurchases } = await supabase
      .from('testoup_purchase_history')
      .select('*')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY')
      .gte('order_date', dateThreshold.toISOString());

    // Calculate revenue metrics (order_total can be null for manual entries)
    const totalRevenue = allPurchases?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;
    const periodRevenue = recentPurchases?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;

    // Revenue by product type (full vs sample)
    const revenueByProduct: Record<string, number> = {};
    allPurchases?.forEach((purchase) => {
      const productType = purchase.product_type || 'unknown';
      revenueByProduct[productType] = (revenueByProduct[productType] || 0) + (parseFloat(purchase.order_total) || 0);
    });

    // Monthly Recurring Revenue (approximate based on recent purchases)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const { data: last30DaysPurchases } = await supabase
      .from('testoup_purchase_history')
      .select('order_total')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY')
      .gte('order_date', last30Days.toISOString());

    const mrr = last30DaysPurchases?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;

    // Average Order Value
    const validPurchases = allPurchases?.filter(p => p.order_total && parseFloat(p.order_total) > 0) || [];
    const aov = validPurchases.length > 0
      ? Math.round((totalRevenue / validPurchases.length) * 100) / 100
      : 0;

    // Revenue trend (last 12 months by month)
    const revenueTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const { data: monthPurchases } = await supabase
        .from('testoup_purchase_history')
        .select('order_total, bottles_purchased')
        .not('email', 'ilike', '%test%')
        .not('order_id', 'eq', 'MANUAL_REFILL')
        .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY')
        .gte('order_date', monthStart.toISOString())
        .lt('order_date', monthEnd.toISOString());

      const revenue = monthPurchases?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;
      const count = monthPurchases?.length || 0;

      revenueTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.round(revenue * 100) / 100,
        purchases: count,
      });
    }

    // Refunds - testoup_purchase_history doesn't track refunds, set to 0
    // TODO: Add refund tracking if needed
    const totalRefunds = 0;
    const refundCount = 0;

    // ============= USER RETENTION ANALYTICS =============
    // Data source: quiz_results_v2 (app users) + activity tables from testograph-v2 mobile app
    // Activity tables: meal_completions, workout_sessions, sleep_tracking, testoup_tracking

    // Get all app users from quiz_results_v2 (actual app registrations)
    const { data: allQuizUsers } = await supabase
      .from('quiz_results_v2')
      .select('email, first_name, created_at, category')
      .not('email', 'ilike', '%test%')
      .order('created_at', { ascending: true });

    // Get unique users (some may have multiple quiz results)
    const uniqueUsers = new Map<string, { email: string; first_name: string; created_at: string; category: string }>();
    allQuizUsers?.forEach(user => {
      if (!uniqueUsers.has(user.email)) {
        uniqueUsers.set(user.email, user);
      }
    });

    // Get last activity date for each user from all activity tables
    // This determines when they last used the mobile app
    const userEmails = Array.from(uniqueUsers.keys());

    // Fetch latest activity from each table in parallel
    const [mealActivity, workoutActivity, sleepActivity, supplementActivity] = await Promise.all([
      supabase.from('meal_completions').select('email, date').in('email', userEmails),
      supabase.from('workout_sessions').select('email, date').in('email', userEmails),
      supabase.from('sleep_tracking').select('email, date').in('email', userEmails),
      supabase.from('testoup_tracking').select('email, date').in('email', userEmails),
    ]);

    // Build user activity map: email -> last activity date
    const userLastActivity = new Map<string, Date>();

    // Process all activity data to find the latest date per user
    const processActivity = (data: { email: string; date: string }[] | null) => {
      data?.forEach(record => {
        const activityDate = new Date(record.date);
        const currentLast = userLastActivity.get(record.email);
        if (!currentLast || activityDate > currentLast) {
          userLastActivity.set(record.email, activityDate);
        }
      });
    };

    processActivity(mealActivity.data);
    processActivity(workoutActivity.data);
    processActivity(sleepActivity.data);
    processActivity(supplementActivity.data);

    // Calculate cohorts (users by signup month) with real activity data
    const cohorts: Record<string, {
      users: Set<string>;
      retained: Record<number, Set<string>>; // month offset -> users still active
    }> = {};

    uniqueUsers.forEach((user, email) => {
      const signupDate = new Date(user.created_at);
      const cohortMonth = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;

      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          users: new Set(),
          retained: {},
        };
      }
      cohorts[cohortMonth].users.add(email);

      // Check retention by calculating months since signup
      // Use actual last activity date from tracking tables
      const lastActivityDate = userLastActivity.get(email) || signupDate;
      const monthsDiff = Math.floor(
        (lastActivityDate.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      for (let m = 0; m <= Math.min(monthsDiff, 12); m++) {
        if (!cohorts[cohortMonth].retained[m]) {
          cohorts[cohortMonth].retained[m] = new Set();
        }
        cohorts[cohortMonth].retained[m].add(email);
      }
    });

    // Format cohort data
    const cohortAnalysis = Object.entries(cohorts)
      .slice(-6) // Last 6 months
      .map(([month, data]) => {
        const totalUsers = data.users.size;
        const retentionRates: Record<number, number> = {};

        for (let i = 0; i <= 6; i++) {
          const retained = data.retained[i]?.size || 0;
          retentionRates[i] = totalUsers > 0
            ? Math.round((retained / totalUsers) * 100)
            : 0;
        }

        return {
          month,
          totalUsers,
          retentionRates,
        };
      });

    // Overall churn rate (users who haven't been active in 30+ days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalAppUsers = uniqueUsers.size;
    let activeAppUsers = 0;
    uniqueUsers.forEach((_, email) => {
      const lastActivity = userLastActivity.get(email);
      if (lastActivity && lastActivity >= thirtyDaysAgo) {
        activeAppUsers++;
      }
    });

    const churnRate = totalAppUsers > 0
      ? Math.round(((totalAppUsers - activeAppUsers) / totalAppUsers) * 100)
      : 0;

    // ============= EMAIL CAMPAIGN ANALYTICS =============
    // Note: This requires email tracking data. Placeholder for now.

    const emailMetrics = {
      totalCampaigns: 0,
      totalEmailsSent: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
      note: 'Email tracking not yet implemented. Integrate with SendGrid/Mailgun webhooks.',
    };

    // ============= ADDITIONAL METRICS =============

    // Total bottles and capsules sold
    const totalBottlesSold = allPurchases?.reduce((sum, p) => sum + (p.bottles_purchased || 0), 0) || 0;
    const totalCapsulesSold = allPurchases?.reduce((sum, p) => sum + (p.capsules_added || 0), 0) || 0;
    const periodBottlesSold = recentPurchases?.reduce((sum, p) => sum + (p.bottles_purchased || 0), 0) || 0;

    // Unique customers
    const uniqueCustomers = new Set(allPurchases?.map(p => p.email)).size;
    const periodUniqueCustomers = new Set(recentPurchases?.map(p => p.email)).size;

    // ============= RESPONSE =============

    return NextResponse.json({
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        periodRevenue: Math.round(periodRevenue * 100) / 100,
        mrr: Math.round(mrr * 100) / 100,
        averageOrderValue: aov,
        totalPurchases: validPurchases.length,
        periodPurchases: recentPurchases?.filter(p => p.order_total && parseFloat(p.order_total) > 0).length || 0,
        revenueByProduct,
        revenueTrend,
        refunds: {
          total: Math.round(totalRefunds * 100) / 100,
          count: refundCount,
        },
        // Additional metrics
        totalBottlesSold,
        totalCapsulesSold,
        periodBottlesSold,
        uniqueCustomers,
        periodUniqueCustomers,
      },
      retention: {
        churnRate,
        activeUsers: activeAppUsers,
        totalUsers: totalAppUsers,
        inactiveUsers: totalAppUsers - activeAppUsers,
        cohortAnalysis,
      },
      email: emailMetrics,
      dateRange: {
        days,
        from: dateThreshold.toISOString(),
        to: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching business analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch business analytics' },
      { status: 500 }
    );
  }
}
