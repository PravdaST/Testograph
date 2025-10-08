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
      role,            // New role
      adminId,         // Current admin performing action
      adminEmail       // Current admin email
    } = body;

    // Validation
    if (!userId || !role || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const isSuper = await isSuperAdmin(adminId);
    if (!isSuper) {
      return NextResponse.json(
        { error: 'Only superadmins can change admin roles' },
        { status: 403 }
      );
    }

    // Validate role
    const validRoles = ['superadmin', 'admin', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
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

    // If downgrading a superadmin, check that there's at least one other superadmin
    if (currentAdmin.role === 'superadmin' && role !== 'superadmin') {
      const { data: superadmins, error: countError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('role', 'superadmin');

      if (countError) throw countError;

      if (superadmins && superadmins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot downgrade the last superadmin' },
          { status: 400 }
        );
      }
    }

    // Prevent self-role change
    if (userId === adminId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Get user email for audit log
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email || 'Unknown';

    // Update role
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'add_admin', // Using add_admin as placeholder for role change
      targetUserId: userId,
      targetUserEmail: userEmail,
      changesBefore: {
        role: currentAdmin.role
      },
      changesAfter: {
        role: role
      },
      description: `Променена роля на ${userEmail} от ${currentAdmin.role} на ${role}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Роля променена успешно'
    });

  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    );
  }
}
