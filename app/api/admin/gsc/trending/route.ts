import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/admin/gsc/trending - Get trending search queries
export async function GET(request: Request) {
  console.log('[GSC Trending] Fetching trending queries...');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[GSC Trending] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Trending] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get last 7 days
    const currentEnd = new Date();
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - 7);

    // Get previous 7 days for comparison
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    console.log('[GSC Trending] Current period:', formatDate(currentStart), 'to', formatDate(currentEnd));
    console.log('[GSC Trending] Previous period:', formatDate(previousStart), 'to', formatDate(previousEnd));

    // Fetch current period data
    const { data: currentData, error: currentError } = await supabase
      .from('gsc_keyword_performance')
      .select('keyword, clicks, impressions')
      .gte('date', formatDate(currentStart))
      .lte('date', formatDate(currentEnd));

    if (currentError) throw currentError;

    // Fetch previous period data
    const { data: previousData, error: previousError } = await supabase
      .from('gsc_keyword_performance')
      .select('keyword, clicks, impressions')
      .gte('date', formatDate(previousStart))
      .lte('date', formatDate(previousEnd));

    if (previousError) throw previousError;

    // Aggregate by keyword
    const currentStats = new Map();
    const previousStats = new Map();

    currentData?.forEach(row => {
      if (!currentStats.has(row.keyword)) {
        currentStats.set(row.keyword, { clicks: 0, impressions: 0 });
      }
      const stats = currentStats.get(row.keyword);
      stats.clicks += row.clicks;
      stats.impressions += row.impressions;
    });

    previousData?.forEach(row => {
      if (!previousStats.has(row.keyword)) {
        previousStats.set(row.keyword, { clicks: 0, impressions: 0 });
      }
      const stats = previousStats.get(row.keyword);
      stats.clicks += row.clicks;
      stats.impressions += row.impressions;
    });

    // Calculate trends
    const trending = [];

    for (const [keyword, current] of currentStats.entries()) {
      const previous = previousStats.get(keyword) || { clicks: 0, impressions: 0 };

      // Calculate percentage change
      const clicksChange = previous.clicks > 0
        ? ((current.clicks - previous.clicks) / previous.clicks) * 100
        : current.clicks > 0 ? 100 : 0;

      const impressionsChange = previous.impressions > 0
        ? ((current.impressions - previous.impressions) / previous.impressions) * 100
        : current.impressions > 0 ? 100 : 0;

      // Calculate trend score (weighted: impressions 60%, clicks 40%)
      const trendScore = (impressionsChange * 0.6) + (clicksChange * 0.4);

      // Only include keywords with significant positive trend
      if (trendScore > 20 && current.impressions > 10) {
        trending.push({
          keyword,
          current_clicks: current.clicks,
          current_impressions: current.impressions,
          previous_clicks: previous.clicks,
          previous_impressions: previous.impressions,
          clicks_change: parseFloat(clicksChange.toFixed(2)),
          impressions_change: parseFloat(impressionsChange.toFixed(2)),
          trend_score: parseFloat(trendScore.toFixed(2)),
          is_new: previous.impressions === 0
        });
      }
    }

    // Sort by trend score
    trending.sort((a, b) => b.trend_score - a.trend_score);

    console.log('[GSC Trending] ✅ Found', trending.length, 'trending queries');

    return NextResponse.json({
      trending: trending.slice(0, limit),
      total: trending.length,
      date_ranges: {
        current: {
          start: formatDate(currentStart),
          end: formatDate(currentEnd)
        },
        previous: {
          start: formatDate(previousStart),
          end: formatDate(previousEnd)
        }
      }
    });

  } catch (err: any) {
    console.error('[GSC Trending] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch trending queries' },
      { status: 500 }
    );
  }
}
