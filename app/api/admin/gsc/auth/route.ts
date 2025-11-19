import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  console.log('[GSC Auth] ========================================');
  console.log('[GSC Auth] Starting OAuth flow...', {
    url: request.url,
    timestamp: new Date().toISOString()
  });

  const supabase = await createClient();

  // Check auth & admin
  let user = null;
  let authError = null;

  console.log('[GSC Auth] Checking server-side session...');
  const { data: { user: serverUser }, error: serverAuthError } = await supabase.auth.getUser();

  if (serverUser && !serverAuthError) {
    user = serverUser;
    console.log('[GSC Auth] ✅ Server session valid:', {
      userId: user.id,
      email: user.email
    });
  } else {
    console.log('[GSC Auth] ⚠️ No server session, trying Authorization header...');
    // Fallback: Try to get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      console.log('[GSC Auth] Using Bearer token from header');
      const token = authHeader.replace('Bearer ', '');

      // Create a new client with the token to verify it
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const tokenClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        });

        const { data: { user: tokenUser }, error: tokenError } = await tokenClient.auth.getUser();
        if (tokenUser && !tokenError) {
          user = tokenUser;
          console.log('[GSC Auth] ✅ Token authentication successful:', {
            userId: user.id,
            email: user.email
          });
        } else {
          authError = tokenError || serverAuthError;
          console.error('[GSC Auth] ❌ Token authentication failed:', tokenError);
        }
      }
    } else {
      authError = serverAuthError;
      console.error('[GSC Auth] ❌ No Authorization header found');
    }
  }

  if (!user || authError) {
    console.error('[GSC Auth] ❌ Unauthorized:', {
      hasUser: !!user,
      authError: authError?.message
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[GSC Auth] Checking admin privileges...');
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Auth] ❌ Not an admin user:', {
      userId: user.id,
      adminError: adminError?.message
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  console.log('[GSC Auth] ✅ Admin verified:', {
    userId: user.id,
    role: adminUser.role
  });

  try {
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const redirectUri = `${baseUrl}/api/admin/gsc/callback`;

    console.log('[GSC Auth] OAuth2 config:', {
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

    console.log('[GSC Auth] Generating authorization URL...');

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
      prompt: 'consent', // Force consent screen to get refresh token
    });

    console.log('[GSC Auth] ✅ Authorization URL generated:', {
      authUrlLength: authUrl.length,
      authUrlDomain: new URL(authUrl).hostname
    });

    console.log('[GSC Auth] ========================================');
    console.log('[GSC Auth] ⚠️ IMPORTANT: Session must persist during OAuth redirect!');
    console.log('[GSC Auth] User will be redirected to Google, then back to callback endpoint');
    console.log('[GSC Auth] ========================================');

    // Return the auth URL as JSON so the client can navigate to it
    // This allows us to use adminFetch with proper authentication
    return NextResponse.json({ authUrl }, { status: 200 });

  } catch (err: any) {
    console.error('[GSC Auth] ========================================');
    console.error('[GSC Auth] ❌ Error generating auth URL:', {
      error: err,
      message: err?.message,
      stack: err?.stack
    });
    console.error('[GSC Auth] ========================================');
    return NextResponse.json(
      { error: err.message || 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }
}
