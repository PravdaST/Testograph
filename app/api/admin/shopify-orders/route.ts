import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/shopify-orders
 * Returns all Shopify orders from the pending_orders table
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status'); // pending, paid, all
    const search = searchParams.get('search')?.trim(); // search by email, name, order number

    let query = supabase
      .from('pending_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search && search.length > 0) {
      query = query.or(`email.ilike.%${search}%,customer_name.ilike.%${search}%,order_number.ilike.%${search}%`);
    }

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'paid') {
        query = query.not('paid_at', 'is', null);
      } else if (status === 'pending') {
        query = query.is('paid_at', null);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get summary stats
    const { data: allOrders } = await supabase
      .from('pending_orders')
      .select('status, total_price, paid_at');

    const paidOrders = allOrders?.filter(o => o.paid_at !== null) || [];
    const pendingOrders = allOrders?.filter(o => o.paid_at === null) || [];

    const summary = {
      total: count || 0,
      paid: paidOrders.length,
      pending: pendingOrders.length,
      totalRevenue: paidOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0),
      pendingRevenue: pendingOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0),
    };

    // Transform orders to match expected format
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      shopify_order_id: order.order_id,
      shopify_order_number: order.order_number,
      customer_email: order.email,
      customer_name: order.customer_name,
      customer_phone: order.phone,
      shipping_address: order.shipping_address,
      products: order.products,
      total_price: order.total_price,
      currency: order.currency,
      status: order.status,
      is_paid: order.paid_at !== null,
      paid_at: order.paid_at,
      created_at: order.created_at,
      updated_at: order.updated_at,
    })) || [];

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count,
      summary,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in shopify-orders API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
