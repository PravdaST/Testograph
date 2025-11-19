import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('[GSC Callback] Received:', { hasCode: !!code, error });

  // Handle OAuth error
  if (error) {
    console.error('[GSC Callback] OAuth error:', error);
    return NextResponse.redirect(
      new URL('/admin/keywords?error=oauth_failed', request.url)
    );
  }

  if (!code) {
    console.error('[GSC Callback] No authorization code received');
    return NextResponse.redirect(
      new URL('/admin/keywords?error=no_code', request.url)
    );
  }

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[GSC Callback] Unauthorized:', authError);
    return NextResponse.redirect(
      new URL('/admin/login?redirect=/admin/keywords', request.url)
    );
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Callback] Not an admin user');
    return NextResponse.redirect(
      new URL('/admin/keywords?error=forbidden', request.url)
    );
  }

  try {
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/admin/gsc/callback`
    );

    console.log('[GSC Callback] Exchanging code for tokens...');

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain tokens from Google');
    }

    console.log('[GSC Callback] Tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date
    });

    // Calculate expiry date
    const expiresAt = new Date(
      Date.now() + (tokens.expires_in || 3600) * 1000
    );

    // Store tokens in database
    const { error: upsertError } = await supabase
      .from('gsc_auth_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        property_url: process.env.GSC_PROPERTY_URL || 'https://testograph.eu',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('[GSC Callback] Failed to store tokens:', upsertError);
      throw upsertError;
    }

    console.log('[GSC Callback] ✅ Tokens stored successfully');

    // Redirect back to keywords page with success
    return NextResponse.redirect(
      new URL('/admin/keywords?success=connected', request.url)
    );

  } catch (err: any) {
    console.error('[GSC Callback] Error:', err);
    return NextResponse.redirect(
      new URL('/admin/keywords?error=token_exchange_failed', request.url)
    );
  }
}
