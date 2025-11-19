import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// POST /api/admin/gsc/sync - Sync performance data from Google Search Console
export async function POST(request: Request) {
  console.log('[GSC Sync] Starting data sync...');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[GSC Sync] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Sync] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get stored OAuth tokens
    const { data: authTokens, error: tokenError } = await supabase
      .from('gsc_auth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !authTokens) {
      console.error('[GSC Sync] No auth tokens found');
      return NextResponse.json(
        { error: 'Not connected to Google Search Console. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(authTokens.expires_at);
    const now = new Date();

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/gsc/callback`
    );

    // Set credentials
    oauth2Client.setCredentials({
      access_token: authTokens.access_token,
      refresh_token: authTokens.refresh_token,
      expiry_date: expiresAt.getTime()
    });

    // Refresh token if expired
    if (now >= expiresAt) {
      console.log('[GSC Sync] Token expired, refreshing...');
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update tokens in database
      await supabase
        .from('gsc_auth_tokens')
        .update({
          access_token: credentials.access_token!,
          expires_at: new Date(credentials.expiry_date!).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      console.log('[GSC Sync] ✅ Token refreshed');
    }

    // Initialize Search Console API
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

    // Get date range (last 28 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    console.log('[GSC Sync] Fetching data from', formatDate(startDate), 'to', formatDate(endDate));

    // Fetch performance data
    const response = await searchconsole.searchanalytics.query({
      siteUrl: authTokens.property_url,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query', 'date'],
        rowLimit: 1000,
        dataState: 'final'
      }
    });

    const rows = response.data.rows || [];
    console.log('[GSC Sync] Received', rows.length, 'rows');

    if (rows.length === 0) {
      return NextResponse.json({
        message: 'No data available from Google Search Console',
        synced: 0
      });
    }

    // Prepare data for database
    const performanceData = rows.map(row => ({
      keyword: row.keys![0],
      date: row.keys![1],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr ? parseFloat((row.ctr * 100).toFixed(2)) : 0,
      position: row.position ? parseFloat(row.position.toFixed(2)) : 0,
      page_url: authTokens.property_url,
      country: 'bgr',
      device: 'DESKTOP',
      synced_at: new Date().toISOString()
    }));

    // Insert/update data in database (upsert)
    const { error: upsertError } = await supabase
      .from('gsc_keyword_performance')
      .upsert(performanceData, {
        onConflict: 'keyword,date,page_url,country,device'
      });

    if (upsertError) {
      console.error('[GSC Sync] Upsert error:', upsertError);
      throw upsertError;
    }

    console.log('[GSC Sync] ✅ Synced', performanceData.length, 'records');

    return NextResponse.json({
      message: 'Data synced successfully',
      synced: performanceData.length,
      date_range: {
        start: formatDate(startDate),
        end: formatDate(endDate)
      }
    });

  } catch (err: any) {
    console.error('[GSC Sync] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to sync data from Google Search Console' },
      { status: 500 }
    );
  }
}
