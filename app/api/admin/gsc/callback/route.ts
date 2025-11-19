import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const requestUrl = request.url;

  console.log('[GSC Callback] ========================================');
  console.log('[GSC Callback] Callback hit:', {
    hasCode: !!code,
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

  console.log('[GSC Callback] Creating Supabase client...');
  const supabase = await createClient();

  // Check auth & admin
  console.log('[GSC Callback] Checking user authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[GSC Callback] ❌ Session lost or unauthorized:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
      authErrorDetails: authError
    });
    console.error('[GSC Callback] ⚠️ User session was lost during OAuth redirect - this is the main issue!');
    return NextResponse.redirect(
      new URL('/admin?redirect=/admin/keywords', request.url)
    );
  }

  console.log('[GSC Callback] ✅ User authenticated:', {
    userId: user.id,
    email: user.email
  });

  console.log('[GSC Callback] Checking admin privileges...');
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Callback] ❌ Not an admin user:', {
      userId: user.id,
      adminError: adminError?.message
    });
    return NextResponse.redirect(
      new URL('/admin/keywords?error=forbidden', request.url)
    );
  }

  console.log('[GSC Callback] ✅ Admin verified:', {
    userId: user.id,
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
      user_id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt.toISOString(),
      property_url: process.env.GSC_PROPERTY_URL || 'https://testograph.eu',
      updated_at: new Date().toISOString()
    };

    console.log('[GSC Callback] Storing tokens in database:', {
      user_id: user.id,
      property_url: tokenData.property_url,
      expires_at: tokenData.expires_at,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token
    });

    // Store tokens in database
    const { data: upsertData, error: upsertError } = await supabase
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
