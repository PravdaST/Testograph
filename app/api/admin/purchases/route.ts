import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/purchases
 * Returns all Shopify purchases from testoup_purchase_history
 * This is the main source of truth for paid orders
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'paid', 'pending' (from pending_orders)
    const source = searchParams.get('source'); // 'paid' (default), 'all'

    // Determine which table to query based on source
    if (source === 'all') {
      // Query pending_orders for ALL orders (pending + paid)
      let query = supabase
        .from('pending_orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: orders, error, count } = await query;
      if (error) throw error;

      const enrichedOrders = orders?.map(order => ({
        id: order.id,
        orderId: order.shopify_order_id,
        userEmail: order.email,
        userName: order.customer_name,
        productName: order.product_name || 'TestoUP',
        amount: parseFloat(order.order_total) || 0,
        purchasedAt: order.created_at,
        status: order.status,
        currency: 'BGN',
        bottles: order.bottles_purchased,
        capsules: order.capsules_to_add,
        productType: order.product_type,
      })) || [];

      // Stats for all orders
      const { data: allOrders } = await supabase
        .from('pending_orders')
        .select('order_total, status');

      const paidOrders = allOrders?.filter(o => o.status === 'paid') || [];
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (parseFloat(o.order_total) || 0), 0);
      const pendingCount = allOrders?.filter(o => o.status === 'pending').length || 0;

      return NextResponse.json({
        purchases: enrichedOrders,
        total: count || 0,
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalPurchases: paidOrders.length,
          pendingOrders: pendingCount,
          averageOrderValue: paidOrders.length > 0
            ? Math.round((totalRevenue / paidOrders.length) * 100) / 100
            : 0,
          currency: 'BGN',
        },
      });
    }

    // Default: Query testoup_purchase_history for PAID orders only
    let query = supabase
      .from('testoup_purchase_history')
      .select('*', { count: 'exact' })
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY')
      .order('order_date', { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data: purchases, error, count } = await query;
    if (error) throw error;

    const enrichedPurchases = purchases?.map(purchase => ({
      id: purchase.id,
      orderId: purchase.order_id,
      userEmail: purchase.email,
      userName: null, // Not stored in testoup_purchase_history
      productName: purchase.product_type === 'full' ? 'TestoUP (60 капсули)' : 'TestoUP Проба (10 капсули)',
      amount: parseFloat(purchase.order_total) || 0,
      purchasedAt: purchase.order_date,
      status: 'paid', // All entries in this table are paid
      currency: 'BGN',
      bottles: purchase.bottles_purchased,
      capsules: purchase.capsules_added,
      productType: purchase.product_type,
    })) || [];

    // Calculate revenue stats from all paid orders
    const { data: stats } = await supabase
      .from('testoup_purchase_history')
      .select('order_total, product_type')
      .not('email', 'ilike', '%test%')
      .not('order_id', 'eq', 'MANUAL_REFILL')
      .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY');

    const totalRevenue = stats?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;
    const totalPurchases = stats?.length || 0;
    const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

    // Revenue by product type
    const revenueByType: Record<string, { count: number; revenue: number }> = {};
    stats?.forEach(p => {
      const type = p.product_type || 'unknown';
      if (!revenueByType[type]) {
        revenueByType[type] = { count: 0, revenue: 0 };
      }
      revenueByType[type].count++;
      revenueByType[type].revenue += parseFloat(p.order_total) || 0;
    });

    return NextResponse.json({
      purchases: enrichedPurchases,
      total: count || 0,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalPurchases,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        currency: 'BGN',
        revenueByType,
      },
    });
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}
