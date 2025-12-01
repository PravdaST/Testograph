/**
 * API Route Session Validation Helper
 *
 * Use this in API routes to validate that the user has a valid session
 * and that they can only access their own data.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface SessionValidationResult {
  isValid: boolean
  email: string | null
  error: NextResponse | null
}

/**
 * Validate session and get authenticated user's email
 *
 * Usage:
 * ```typescript
 * const { isValid, email, error } = await validateSession()
 * if (!isValid) return error
 * // Use email (guaranteed to be non-null here)
 * ```
 */
export async function validateSession(): Promise<SessionValidationResult> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        isValid: false,
        email: null,
        error: NextResponse.json(
          { error: 'Unauthorized - No valid session' },
          { status: 401 }
        )
      }
    }

    const email = session.user.email

    if (!email) {
      return {
        isValid: false,
        email: null,
        error: NextResponse.json(
          { error: 'Unauthorized - No email in session' },
          { status: 401 }
        )
      }
    }

    return {
      isValid: true,
      email,
      error: null
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return {
      isValid: false,
      email: null,
      error: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      )
    }
  }
}

/**
 * Validate that the requested email matches the session email
 * Use this when API receives email as parameter but should only allow
 * users to access their own data.
 *
 * @param requestedEmail - Email from query params or body
 * @param sessionEmail - Email from validated session
 * @returns true if emails match or requestedEmail is not provided
 */
export function validateEmailOwnership(
  requestedEmail: string | null | undefined,
  sessionEmail: string
): boolean {
  // If no email requested, use session email (OK)
  if (!requestedEmail) return true

  // If email requested, must match session
  return requestedEmail === sessionEmail
}

/**
 * Combined validation: Check session and email ownership
 * Returns error response if validation fails, null if OK
 */
export async function validateSessionAndEmail(
  requestedEmail: string | null | undefined
): Promise<{ email: string; error: null } | { email: null; error: NextResponse }> {
  const { isValid, email: sessionEmail, error } = await validateSession()

  if (!isValid || !sessionEmail) {
    return { email: null, error: error! }
  }

  // If email is provided in request, it must match session
  if (requestedEmail && requestedEmail !== sessionEmail) {
    console.warn(`Email mismatch attempt: requested=${requestedEmail}, session=${sessionEmail}`)
    return {
      email: null,
      error: NextResponse.json(
        { error: 'Unauthorized - Cannot access other user data' },
        { status: 403 }
      )
    }
  }

  // Always return session email (trusted source)
  return { email: sessionEmail, error: null }
}
