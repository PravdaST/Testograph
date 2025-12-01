import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/stats/trends
 *
 * Calculates month-over-month trends for key metrics
 * Returns percentage changes comparing current month vs. previous month
 */
export async function GET() {
  try {
    // Calculate date ranges for current and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ===== REVENUE TREND (from testoup_purchase_history) =====
    // Current month revenue
    const { data: currentRevenue } = await supabase
      .from('testoup_purchase_history')
      .select('order_total')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .gte('order_date', currentMonthStart.toISOString());

    const currentMonthRevenue = currentRevenue?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;

    // Previous month revenue
    const { data: previousRevenue } = await supabase
      .from('testoup_purchase_history')
      .select('order_total')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .gte('order_date', previousMonthStart.toISOString())
      .lte('order_date', previousMonthEnd.toISOString());

    const previousMonthRevenue = previousRevenue?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;

    // Calculate revenue trend
    const revenueTrend = previousMonthRevenue === 0
      ? 0
      : Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);

    // ===== USERS TREND =====
    // Current month users
    const { data: currentUsers, count: currentUserCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', currentMonthStart.toISOString());

    // Previous month users
    const { data: previousUsers, count: previousUserCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousMonthStart.toISOString())
      .lte('created_at', previousMonthEnd.toISOString());

    // Calculate users trend
    const usersTrend = (previousUserCount || 0) === 0
      ? 0
      : Math.round((((currentUserCount || 0) - (previousUserCount || 0)) / (previousUserCount || 0)) * 100);

    // ===== CONVERSION TREND =====
    // Current month funnel sessions and conversions
    const { data: currentFunnelSessions, count: currentSessionsCount } = await supabase
      .from('funnel_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', currentMonthStart.toISOString());

    const { data: currentConversions, count: currentConversionsCount } = await supabase
      .from('testoup_purchase_history')
      .select('*', { count: 'exact', head: true })
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .gte('order_date', currentMonthStart.toISOString());

    const currentConversionRate = (currentSessionsCount || 0) === 0
      ? 0
      : ((currentConversionsCount || 0) / (currentSessionsCount || 0)) * 100;

    // Previous month funnel sessions and conversions
    const { data: previousFunnelSessions, count: previousSessionsCount } = await supabase
      .from('funnel_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousMonthStart.toISOString())
      .lte('created_at', previousMonthEnd.toISOString());

    const { data: previousConversions, count: previousConversionsCount } = await supabase
      .from('testoup_purchase_history')
      .select('*', { count: 'exact', head: true })
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .gte('order_date', previousMonthStart.toISOString())
      .lte('order_date', previousMonthEnd.toISOString());

    const previousConversionRate = (previousSessionsCount || 0) === 0
      ? 0
      : ((previousConversionsCount || 0) / (previousSessionsCount || 0)) * 100;

    // Calculate conversion trend (percentage point change)
    const conversionTrend = previousConversionRate === 0
      ? 0
      : Math.round(((currentConversionRate - previousConversionRate) / previousConversionRate) * 100);

    return NextResponse.json({
      success: true,
      trends: {
        revenue: {
          value: revenueTrend,
          label: 'спрямо миналия месец',
          current: currentMonthRevenue,
          previous: previousMonthRevenue
        },
        users: {
          value: usersTrend,
          label: 'спрямо миналия месец',
          current: currentUserCount || 0,
          previous: previousUserCount || 0
        },
        conversion: {
          value: conversionTrend,
          label: 'спрямо миналия месец',
          current: currentConversionRate,
          previous: previousConversionRate
        }
      },
      metadata: {
        currentMonthStart: currentMonthStart.toISOString(),
        previousMonthStart: previousMonthStart.toISOString(),
        previousMonthEnd: previousMonthEnd.toISOString()
      }
    });

  } catch (error) {
    console.error('Error calculating trends:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate trends',
      trends: {
        revenue: { value: 0, label: 'спрямо миналия месец' },
        users: { value: 0, label: 'спрямо миналия месец' },
        conversion: { value: 0, label: 'спрямо миналия месец' }
      }
    }, { status: 500 });
  }
}
