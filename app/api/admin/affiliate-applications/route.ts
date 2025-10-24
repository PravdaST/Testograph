import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filters
    const searchQuery = searchParams.get('search') || '';
    const status = searchParams.get('status'); // pending, approved, rejected
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
    let query = supabase
      .from('affiliate_applications')
      .select('*', { count: 'exact' });

    // Apply filters
    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching affiliate applications:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const { data: statsData } = await supabase
      .from('affiliate_applications')
      .select('status');

    const stats = {
      total: count || 0,
      pending: statsData?.filter(r => r.status === 'pending').length || 0,
      approved: statsData?.filter(r => r.status === 'approved').length || 0,
      rejected: statsData?.filter(r => r.status === 'rejected').length || 0,
    };

    return NextResponse.json({
      success: true,
      applications: data || [],
      count: count || 0,
      limit,
      offset,
      stats
    });

  } catch (error: any) {
    console.error('Error in affiliate applications API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
