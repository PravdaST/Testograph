// Admin permissions checker
// Determines what actions an admin user can perform

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export type Permission =
  | 'manage_users'
  | 'manage_purchases'
  | 'view_analytics'
  | 'send_emails'
  | 'manage_pro_access'
  | 'manage_admins'
  | 'view_audit_logs'
  | 'manage_app_data';

export type AdminRole = 'superadmin' | 'admin' | 'viewer';

export interface AdminUser {
  id: string;
  role: AdminRole;
  permissions: Permission[];
  created_at: string;
  created_by: string | null;
  last_active_at: string | null;
  notes: string | null;
}

/**
 * Get admin user info
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return data as AdminUser;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

/**
 * Check if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  return adminUser !== null;
}

/**
 * Check if user is a superadmin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  return adminUser?.role === 'superadmin';
}

/**
 * Check if admin has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const adminUser = await getAdminUser(userId);

  if (!adminUser) return false;

  // Superadmins have all permissions
  if (adminUser.role === 'superadmin') return true;

  // Check if permission is in the user's permissions array
  return adminUser.permissions.includes(permission);
}

/**
 * Check multiple permissions (user needs ALL of them)
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(p => hasPermission(userId, p))
  );
  return results.every(r => r === true);
}

/**
 * Check multiple permissions (user needs ANY of them)
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(p => hasPermission(userId, p))
  );
  return results.some(r => r === true);
}

/**
 * Get all admins
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as AdminUser[];
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

/**
 * Update admin last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  try {
    await supabase
      .from('admin_users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last active:', error);
  }
}

/**
 * Add a new admin user
 */
export async function addAdminUser(params: {
  userId: string;
  role: AdminRole;
  permissions: Permission[];
  createdBy: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert({
        id: params.userId,
        role: params.role,
        permissions: params.permissions,
        created_by: params.createdBy,
        notes: params.notes || null
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove admin user
 */
export async function removeAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update admin permissions
 */
export async function updateAdminPermissions(
  userId: string,
  permissions: Permission[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ permissions })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update admin role
 */
export async function updateAdminRole(
  userId: string,
  role: AdminRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
