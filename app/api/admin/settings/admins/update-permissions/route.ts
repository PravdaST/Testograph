import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';
import { isSuperAdmin } from '@/lib/admin/permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,          // Admin user to update
      permissions,     // New permissions array
      adminId,         // Current admin performing action
      adminEmail       // Current admin email
    } = body;

    // Validation
    if (!userId || !permissions || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const isSuper = await isSuperAdmin(adminId);
    if (!isSuper) {
      return NextResponse.json(
        { error: 'Only superadmins can change admin permissions' },
        { status: 403 }
      );
    }

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions must be an array' },
        { status: 400 }
      );
    }

    const validPermissions = [
      'manage_users',
      'manage_purchases',
      'view_analytics',
      'send_emails',
      'manage_pro_access',
      'manage_admins',
      'view_audit_logs',
      'manage_app_data'
    ];

    const invalidPerms = permissions.filter((p: string) => !validPermissions.includes(p));
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { error: `Invalid permissions: ${invalidPerms.join(', ')}` },
        { status: 400 }
      );
    }

    // Get current admin data
    const { data: currentAdmin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !currentAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Prevent self-permissions change
    if (userId === adminId) {
      return NextResponse.json(
        { error: 'Cannot change your own permissions' },
        { status: 400 }
      );
    }

    // Get user email for audit log
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email || 'Unknown';

    // Update permissions
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ permissions })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'update_admin_permissions',
      targetUserId: userId,
      targetUserEmail: userEmail,
      changesBefore: {
        permissions: currentAdmin.permissions
      },
      changesAfter: {
        permissions: permissions
      },
      description: `Променени permissions на ${userEmail}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions променени успешно'
    });

  } catch (error: any) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
