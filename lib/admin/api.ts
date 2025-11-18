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
  const { data: { session } } = await supabase.auth.getSession();

  // Add Authorization header if we have a session
  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
