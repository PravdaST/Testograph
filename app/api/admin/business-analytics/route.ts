import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/business-analytics
 * Returns comprehensive business metrics: Revenue, Retention, Email performance
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // ============= REVENUE ANALYTICS =============

    // Total revenue and purchases
    const { data: allPurchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'completed');

    if (purchasesError) throw purchasesError;

    // Recent purchases (for period)
    const { data: recentPurchases } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'completed')
      .gte('purchased_at', dateThreshold.toISOString());

    // Calculate revenue metrics
    const totalRevenue = allPurchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const periodRevenue = recentPurchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Revenue by product type
    const revenueByProduct: Record<string, number> = {};
    allPurchases?.forEach((purchase) => {
      const productType = purchase.product_type || 'unknown';
      revenueByProduct[productType] = (revenueByProduct[productType] || 0) + (purchase.amount || 0);
    });

    // Monthly Recurring Revenue (approximate based on recent purchases)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const { data: last30DaysPurchases } = await supabase
      .from('purchases')
      .select('amount')
      .eq('status', 'completed')
      .gte('purchased_at', last30Days.toISOString());

    const mrr = last30DaysPurchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Average Order Value
    const aov = allPurchases && allPurchases.length > 0
      ? Math.round((totalRevenue / allPurchases.length) * 100) / 100
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
        .from('purchases')
        .select('amount')
        .eq('status', 'completed')
        .gte('purchased_at', monthStart.toISOString())
        .lt('purchased_at', monthEnd.toISOString());

      const revenue = monthPurchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const count = monthPurchases?.length || 0;

      revenueTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.round(revenue * 100) / 100,
        purchases: count,
      });
    }

    // Refunds (purchases with status = 'refunded')
    const { data: refunds } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'refunded');

    const totalRefunds = refunds?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const refundCount = refunds?.length || 0;

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

    // ============= RESPONSE =============

    return NextResponse.json({
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        periodRevenue: Math.round(periodRevenue * 100) / 100,
        mrr: Math.round(mrr * 100) / 100,
        averageOrderValue: aov,
        totalPurchases: allPurchases?.length || 0,
        periodPurchases: recentPurchases?.length || 0,
        revenueByProduct,
        revenueTrend,
        refunds: {
          total: Math.round(totalRefunds * 100) / 100,
          count: refundCount,
        },
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
