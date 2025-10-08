// Audit logging utility for admin panel
// Tracks all administrative actions for accountability

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuditLogParams {
  adminId: string;
  adminEmail: string;
  actionType:
    | 'grant_pro_access'
    | 'revoke_pro_access'
    | 'create_purchase'
    | 'edit_purchase'
    | 'delete_purchase'
    | 'reset_password'
    | 'ban_user'
    | 'unban_user'
    | 'edit_profile'
    | 'delete_user'
    | 'send_email'
    | 'bulk_email'
    | 'add_admin'
    | 'remove_admin';
  targetUserId?: string;
  targetUserEmail?: string;
  changesBefore?: any;
  changesAfter?: any;
  description: string;
  ipAddress?: string;
}

/**
 * Create an audit log entry
 *
 * @example
 * await createAuditLog({
 *   adminId: 'admin-uuid',
 *   adminEmail: 'admin@testograph.eu',
 *   actionType: 'grant_pro_access',
 *   targetUserId: 'user-uuid',
 *   targetUserEmail: 'user@example.com',
 *   changesBefore: { protocol_start_date_pro: null },
 *   changesAfter: { protocol_start_date_pro: '2025-10-08' },
 *   description: 'Дадено PRO достъп от 2025-10-08',
 *   ipAddress: req.headers.get('x-forwarded-for')
 * });
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: params.adminId,
        admin_email: params.adminEmail,
        action_type: params.actionType,
        target_user_id: params.targetUserId || null,
        target_user_email: params.targetUserEmail || null,
        changes_before: params.changesBefore || null,
        changes_after: params.changesAfter || null,
        description: params.description,
        ip_address: params.ipAddress || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit log failure shouldn't break the action
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit log failure shouldn't break the action
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(params: {
  adminId?: string;
  targetUserId?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.adminId) {
      query = query.eq('admin_id', params.adminId);
    }

    if (params.targetUserId) {
      query = query.eq('target_user_id', params.targetUserId);
    }

    if (params.actionType) {
      query = query.eq('action_type', params.actionType);
    }

    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }

    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      logs: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditHistory(userId: string, limit = 50) {
  return getAuditLogs({
    targetUserId: userId,
    limit
  });
}
