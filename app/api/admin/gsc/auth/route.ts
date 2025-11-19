import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  console.log('[GSC Auth] Starting OAuth flow...');

  const supabase = await createClient();

  // Check auth & admin
  let user = null;
  let authError = null;

  const { data: { user: serverUser }, error: serverAuthError } = await supabase.auth.getUser();

  if (serverUser && !serverAuthError) {
    user = serverUser;
  } else {
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
        } else {
          authError = tokenError || serverAuthError;
        }
      }
    } else {
      authError = serverAuthError;
    }
  }

  if (!user || authError) {
    console.error('[GSC Auth] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[GSC Auth] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
      prompt: 'consent', // Force consent screen to get refresh token
    });

    console.log('[GSC Auth] ✅ Authorization URL generated');

    // Return the auth URL as JSON so the client can navigate to it
    // This allows us to use adminFetch with proper authentication
    return NextResponse.json({ authUrl }, { status: 200 });

  } catch (err: any) {
    console.error('[GSC Auth] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }
}
