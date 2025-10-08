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
      userId,          // Admin user to remove
      adminId,         // Current admin performing action
      adminEmail       // Current admin email
    } = body;

    // Validation
    if (!userId || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const isSuper = await isSuperAdmin(adminId);
    if (!isSuper) {
      return NextResponse.json(
        { error: 'Only superadmins can remove admins' },
        { status: 403 }
      );
    }

    // Prevent self-removal
    if (userId === adminId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400 }
      );
    }

    // Get admin to remove
    const { data: adminToRemove, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !adminToRemove) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // If removing a superadmin, check that there's at least one other superadmin
    if (adminToRemove.role === 'superadmin') {
      const { data: superadmins, error: countError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('role', 'superadmin');

      if (countError) throw countError;

      if (superadmins && superadmins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last superadmin' },
          { status: 400 }
        );
      }
    }

    // Get user email for audit log
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email || 'Unknown';

    // Remove admin
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'remove_admin',
      targetUserId: userId,
      targetUserEmail: userEmail,
      changesBefore: {
        role: adminToRemove.role,
        permissions: adminToRemove.permissions
      },
      changesAfter: null,
      description: `Премахнат админ ${userEmail} (роля: ${adminToRemove.role})`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Админ премахнат успешно'
    });

  } catch (error: any) {
    console.error('Error removing admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove admin' },
      { status: 500 }
    );
  }
}
