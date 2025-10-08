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
      userId,          // User to make admin
      role,            // 'superadmin' | 'admin' | 'viewer'
      permissions,     // Array of permission strings
      notes,           // Optional notes
      adminId,         // Current admin performing action
      adminEmail       // Current admin email
    } = body;

    // Validation
    if (!userId || !role || !permissions || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const isSuper = await isSuperAdmin(adminId);
    if (!isSuper) {
      return NextResponse.json(
        { error: 'Only superadmins can add new admins' },
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

    // Check if user exists in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already an admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      );
    }

    // Add admin user
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        role: role,
        permissions: permissions,
        created_by: adminId,
        notes: notes || null
      });

    if (insertError) throw insertError;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'add_admin',
      targetUserId: userId,
      targetUserEmail: authUser.user.email || 'Unknown',
      changesBefore: null,
      changesAfter: {
        role,
        permissions,
        notes
      },
      description: `Добавен нов админ ${authUser.user.email} с роля ${role}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: `Админ добавен успешно`
    });

  } catch (error: any) {
    console.error('Error adding admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add admin' },
      { status: 500 }
    );
  }
}
