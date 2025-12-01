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

    // Get all chat sessions to measure user retention
    const { data: allSessions } = await supabase
      .from('chat_sessions')
      .select('email, created_at, updated_at')
      .order('created_at', { ascending: true });

    // Calculate cohorts (users by signup month)
    const cohorts: Record<string, {
      users: Set<string>;
      retained: Record<number, Set<string>>; // month offset -> users still active
    }> = {};

    allSessions?.forEach((session) => {
      const signupDate = new Date(session.created_at);
      const cohortMonth = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;

      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          users: new Set(),
          retained: {},
        };
      }
      cohorts[cohortMonth].users.add(session.email);

      // Check retention by calculating months since signup
      const lastActivityDate = new Date(session.updated_at);
      const monthsDiff = Math.floor(
        (lastActivityDate.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      for (let m = 0; m <= monthsDiff; m++) {
        if (!cohorts[cohortMonth].retained[m]) {
          cohorts[cohortMonth].retained[m] = new Set();
        }
        cohorts[cohortMonth].retained[m].add(session.email);
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

    const uniqueUsers = new Set(allSessions?.map(s => s.email));
    const activeUsers = new Set(
      allSessions
        ?.filter(s => new Date(s.updated_at) >= thirtyDaysAgo)
        .map(s => s.email)
    );

    const churnRate = uniqueUsers.size > 0
      ? Math.round(((uniqueUsers.size - activeUsers.size) / uniqueUsers.size) * 100)
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
        activeUsers: activeUsers.size,
        totalUsers: uniqueUsers.size,
        inactiveUsers: uniqueUsers.size - activeUsers.size,
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
