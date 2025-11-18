/**
 * Admin Authentication Utilities (Client-Side)
 * Helpers for getting current admin user from Supabase session
 */

'use client'

import { supabase } from '@/integrations/supabase/client'
import type { AdminUser } from './permissions'

/**
 * Get current admin user from Supabase session
 * Returns null if user is not logged in or not an admin
 */
export async function getCurrentAdminUser(): Promise<{
  adminUser: AdminUser | null
  userId: string | null
  email: string | null
}> {
  try {
    // Get current session (doesn't throw errors, works reliably in Next.js 16)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return { adminUser: null, userId: null, email: null }
    }

    const userId = session.user.id
    const email = session.user.email || null

    // Check if user is in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (adminError || !adminData) {
      return { adminUser: null, userId, email }
    }

    return {
      adminUser: adminData as AdminUser,
      userId,
      email
    }
  } catch (error) {
    console.error('Error getting current admin user:', error)
    return { adminUser: null, userId: null, email: null }
  }
}

/**
 * Verify current user is an admin
 * Redirects to login if not authenticated or not an admin
 */
export async function verifyAdminAccess(redirectPath = '/admin'): Promise<{
  isAdmin: boolean
  adminUser: AdminUser | null
  userId: string | null
  email: string | null
}> {
  const { adminUser, userId, email } = await getCurrentAdminUser()

  if (!adminUser) {
    // Not an admin - redirect
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath
    }
    return { isAdmin: false, adminUser: null, userId, email }
  }

  return { isAdmin: true, adminUser, userId, email }
}

/**
 * Check if current user has specific permission
 */
export async function currentUserHasPermission(permission: string): Promise<boolean> {
  const { adminUser } = await getCurrentAdminUser()

  if (!adminUser) return false

  // Superadmins have all permissions
  if (adminUser.role === 'superadmin') return true

  return adminUser.permissions.includes(permission as any)
}

/**
 * Get admin user ID and email for audit logging
 * Returns null values if not authenticated
 */
export async function getAdminIdentity(): Promise<{
  id: string | null
  email: string | null
}> {
  const { userId, email } = await getCurrentAdminUser()
  return { id: userId, email }
}
