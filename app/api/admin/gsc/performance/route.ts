import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/admin/gsc/performance - Get keyword performance stats
export async function GET(request: Request) {
  console.log('[GSC Performance] Fetching performance data...');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[GSC Performance] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Performance] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '28');
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortBy = searchParams.get('sortBy') || 'clicks'; // clicks, impressions, ctr, position

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    console.log('[GSC Performance] Date range:', formatDate(startDate), 'to', formatDate(endDate));

    // Fetch aggregated performance data
    const { data: performanceData, error: perfError } = await supabase
      .rpc('get_keyword_performance_summary', {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        result_limit: limit
      });

    // If the RPC function doesn't exist, fall back to manual query
    if (perfError?.code === '42883') {
      console.log('[GSC Performance] Using fallback query...');

      const { data: rawData, error: queryError } = await supabase
        .from('gsc_keyword_performance')
        .select('*')
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate))
        .order(sortBy, { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;

      // Aggregate data by keyword
      const aggregated = new Map();

      rawData?.forEach(row => {
        if (!aggregated.has(row.keyword)) {
          aggregated.set(row.keyword, {
            keyword: row.keyword,
            total_clicks: 0,
            total_impressions: 0,
            avg_ctr: 0,
            avg_position: 0,
            days_count: 0
          });
        }

        const stats = aggregated.get(row.keyword);
        stats.total_clicks += row.clicks;
        stats.total_impressions += row.impressions;
        stats.avg_ctr += row.ctr;
        stats.avg_position += row.position;
        stats.days_count++;
      });

      // Calculate averages
      const results = Array.from(aggregated.values()).map(stats => ({
        ...stats,
        avg_ctr: parseFloat((stats.avg_ctr / stats.days_count).toFixed(2)),
        avg_position: parseFloat((stats.avg_position / stats.days_count).toFixed(2))
      }));

      // Sort by requested field
      results.sort((a, b) => {
        if (sortBy === 'clicks') return b.total_clicks - a.total_clicks;
        if (sortBy === 'impressions') return b.total_impressions - a.total_impressions;
        if (sortBy === 'ctr') return b.avg_ctr - a.avg_ctr;
        if (sortBy === 'position') return a.avg_position - b.avg_position;
        return 0;
      });

      console.log('[GSC Performance] ✅ Returning', results.length, 'aggregated results');

      return NextResponse.json({
        keywords: results.slice(0, limit),
        total: results.length,
        date_range: {
          start: formatDate(startDate),
          end: formatDate(endDate)
        }
      });
    }

    if (perfError) throw perfError;

    console.log('[GSC Performance] ✅ Returning', performanceData?.length || 0, 'results');

    return NextResponse.json({
      keywords: performanceData || [],
      total: performanceData?.length || 0,
      date_range: {
        start: formatDate(startDate),
        end: formatDate(endDate)
      }
    });

  } catch (err: any) {
    console.error('[GSC Performance] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
