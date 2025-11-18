/**
 * Admin API Helper
 * Automatically adds Supabase auth token to API requests
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch API with automatic Supabase auth token
 * Use this instead of regular fetch() for admin API calls
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Get current session token
  const { data: { session }, error } = await supabase.auth.getSession();

  console.log('[adminFetch] Session check:', {
    hasSession: !!session,
    hasToken: !!session?.access_token,
    error,
    url
  });

  // Add Authorization header if we have a session
  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
    console.log('[adminFetch] Added Authorization header');
  } else {
    console.warn('[adminFetch] No session token available!', { session, error });
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
