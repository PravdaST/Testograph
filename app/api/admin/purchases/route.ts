import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'completed', 'refunded', 'expired'

    // Build query
    let query = supabase
      .from('purchases')
      .select('*', { count: 'exact' })
      .order('purchased_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: purchases, error, count } = await query;

    if (error) throw error;

    // Enrich purchases with user email/name from auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userMap = new Map(authUsers?.users.map(u => [u.id, { email: u.email, name: u.user_metadata?.full_name }]));

    const enrichedPurchases = purchases?.map(purchase => ({
      id: purchase.id,
      userEmail: userMap.get(purchase.user_id)?.email || 'Unknown',
      userName: userMap.get(purchase.user_id)?.name || null,
      productName: purchase.product_name || 'Unknown Product',
      amount: purchase.amount,
      purchasedAt: purchase.purchased_at,
      status: purchase.status,
      currency: purchase.currency,
    })) || [];

    // Calculate revenue stats
    const { data: stats } = await supabase
      .from('purchases')
      .select('amount, currency, status');

    const totalRevenue = stats
      ?.filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

    const totalPurchases = stats?.filter((p) => p.status === 'completed').length || 0;
    const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

    return NextResponse.json({
      purchases: enrichedPurchases,
      total: count || 0,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalPurchases,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        currency: 'BGN',
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
