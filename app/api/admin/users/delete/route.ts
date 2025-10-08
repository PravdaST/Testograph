import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, confirmEmail, adminId, adminEmail } = body;

    // Validation
    if (!userId || !confirmEmail || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify email confirmation
    if (user.email?.toLowerCase() !== confirmEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email confirmation does not match' },
        { status: 400 }
      );
    }

    // Get profile data before deletion for audit log
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Create audit log BEFORE deletion
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'delete_user',
      targetUserId: userId,
      targetUserEmail: user.email || '',
      changesBefore: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile
      },
      changesAfter: null,
      description: `Изтрит потребител ${user.email}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    // Delete user from auth.users (this will cascade delete related data if foreign keys are set up)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    // Manually delete related data that might not cascade
    // Note: Supabase should handle cascading deletes if foreign keys are set up properly
    // But we'll do it manually to be safe
    await Promise.all([
      supabase.from('profiles').delete().eq('id', userId),
      supabase.from('chat_sessions').delete().eq('email', user.email || ''),
      supabase.from('purchases').delete().eq('user_id', userId),
      supabase.from('daily_entries_pro').delete().eq('user_id', userId),
      supabase.from('weekly_measurements_pro').delete().eq('user_id', userId),
      supabase.from('user_settings').delete().eq('user_id', userId),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Потребителят е изтрит успешно'
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
