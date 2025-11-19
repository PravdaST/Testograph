import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const requestUrl = request.url;

  console.log('[GSC Callback] ========================================');
  console.log('[GSC Callback] Callback hit:', {
    hasCode: !!code,
    hasState: !!state,
    error,
    url: requestUrl,
    timestamp: new Date().toISOString()
  });

  // Handle OAuth error
  if (error) {
    console.error('[GSC Callback] ❌ OAuth error from Google:', error);
    return NextResponse.redirect(
      new URL('/admin/keywords?error=oauth_failed', request.url)
    );
  }

  if (!code) {
    console.error('[GSC Callback] ❌ No authorization code received');
    return NextResponse.redirect(
      new URL('/admin/keywords?error=no_code', request.url)
    );
  }

  if (!state) {
    console.error('[GSC Callback] ❌ No state parameter received');
    return NextResponse.redirect(
      new URL('/admin/keywords?error=invalid_state', request.url)
    );
  }

  // Use service role client to bypass RLS for state token lookup
  // This is safe because state tokens are random UUIDs that expire quickly
  console.log('[GSC Callback] Creating service role Supabase client for state lookup...');
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get user ID from state token (instead of session cookies)
  console.log('[GSC Callback] Looking up state token:', state);
  const { data: stateData, error: stateError } = await serviceSupabase
    .from('oauth_state_tokens')
    .select('user_id, expires_at')
    .eq('state_token', state)
    .eq('provider', 'google_search_console')
    .single();

  if (stateError || !stateData) {
    console.error('[GSC Callback] ❌ Invalid or expired state token:', {
      state,
      error: stateError?.message
    });
    return NextResponse.redirect(
      new URL('/admin/keywords?error=invalid_state', request.url)
    );
  }

  // Check if token is expired
  const expiresAt = new Date(stateData.expires_at);
  if (expiresAt < new Date()) {
    console.error('[GSC Callback] ❌ State token expired:', {
      expiresAt: expiresAt.toISOString(),
      now: new Date().toISOString()
    });
    return NextResponse.redirect(
      new URL('/admin/keywords?error=state_expired', request.url)
    );
  }

  const userId = stateData.user_id;

  console.log('[GSC Callback] ✅ State token validated:', {
    userId,
    expiresAt: expiresAt.toISOString()
  });

  // Verify user is still an admin (use service role client)
  console.log('[GSC Callback] Checking admin privileges...');
  const { data: adminUser, error: adminError } = await serviceSupabase
    .from('admin_users')
    .select('role')
    .eq('id', userId)
    .single();

  if (!adminUser) {
    console.error('[GSC Callback] ❌ Not an admin user:', {
      userId,
      adminError: adminError?.message
    });
    return NextResponse.redirect(
      new URL('/admin/keywords?error=forbidden', request.url)
    );
  }

  console.log('[GSC Callback] ✅ Admin verified:', {
    userId,
    role: adminUser.role
  });

  try {
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const redirectUri = `${baseUrl}/api/admin/gsc/callback`;

    console.log('[GSC Callback] OAuth2 config:', {
      baseUrl,
      redirectUri,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
    });

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    console.log('[GSC Callback] Exchanging authorization code for tokens...');

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('[GSC Callback] ❌ Incomplete tokens from Google:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token
      });
      throw new Error('Failed to obtain tokens from Google');
    }

    console.log('[GSC Callback] ✅ Tokens received from Google:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      accessTokenLength: tokens.access_token?.length,
      refreshTokenLength: tokens.refresh_token?.length,
      expiresIn: tokens.expires_in,
      expiryDate: tokens.expiry_date
    });

    // Calculate expiry date
    const expiresAt = new Date(
      Date.now() + (tokens.expires_in || 3600) * 1000
    );

    const tokenData = {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt.toISOString(),
      property_url: process.env.GSC_PROPERTY_URL || 'https://testograph.eu',
      updated_at: new Date().toISOString()
    };

    console.log('[GSC Callback] Storing tokens in database:', {
      user_id: userId,
      property_url: tokenData.property_url,
      expires_at: tokenData.expires_at,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token
    });

    // Store tokens in database (use service role client)
    const { data: upsertData, error: upsertError } = await serviceSupabase
      .from('gsc_auth_tokens')
      .upsert(tokenData, {
        onConflict: 'user_id'
      })
      .select();

    if (upsertError) {
      console.error('[GSC Callback] ❌ Database upsert failed:', {
        error: upsertError,
        errorMessage: upsertError.message,
        errorDetails: upsertError.details,
        errorHint: upsertError.hint,
        errorCode: upsertError.code
      });
      throw upsertError;
    }

    console.log('[GSC Callback] ✅ Tokens stored successfully in database:', {
      upsertedData: upsertData,
      recordCount: upsertData?.length || 0
    });

    // Clean up used state token (use service role client)
    console.log('[GSC Callback] Cleaning up used state token...');
    const { error: deleteError } = await serviceSupabase
      .from('oauth_state_tokens')
      .delete()
      .eq('state_token', state);

    if (deleteError) {
      console.warn('[GSC Callback] ⚠️ Failed to delete state token (non-critical):', deleteError.message);
    } else {
      console.log('[GSC Callback] ✅ State token cleaned up');
    }

    console.log('[GSC Callback] ========================================');
    console.log('[GSC Callback] 🎉 OAuth flow completed successfully!');
    console.log('[GSC Callback] ========================================');

    // Redirect back to keywords page with success
    return NextResponse.redirect(
      new URL('/admin/keywords?success=connected', request.url)
    );

  } catch (err: any) {
    console.error('[GSC Callback] ========================================');
    console.error('[GSC Callback] ❌ FATAL ERROR:', {
      error: err,
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    console.error('[GSC Callback] ========================================');
    return NextResponse.redirect(
      new URL('/admin/keywords?error=token_exchange_failed', request.url)
    );
  }
}
