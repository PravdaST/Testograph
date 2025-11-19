import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
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
      const token = authHeader.replace('Bearer ', '');

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Check if user has GSC tokens
    const { data: authTokens } = await supabase
      .from('gsc_auth_tokens')
      .select('property_url, expires_at, refresh_token')
      .eq('user_id', user.id)
      .single();

    if (!authTokens) {
      return NextResponse.json({
        connected: false
      });
    }

    // Connection is valid if we have a refresh token
    // Access token can be refreshed automatically, so expiry doesn't matter
    const isConnected = !!authTokens.refresh_token;

    return NextResponse.json({
      connected: isConnected,
      propertyUrl: authTokens.property_url,
      expiresAt: authTokens.expires_at
    });

  } catch (err: any) {
    console.error('[GSC Status] Error:', err);
    return NextResponse.json({ connected: false });
  }
}
