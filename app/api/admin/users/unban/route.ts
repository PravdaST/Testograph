import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, adminId, adminEmail } = body;

    // Validation
    if (!userId || !adminId || !adminEmail) {
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

    // Check if user is actually banned
    if (!user.banned_until) {
      return NextResponse.json(
        { error: 'User is not banned' },
        { status: 400 }
      );
    }

    // Unban user by setting ban_duration to 'none'
    const { error: unbanError } = await supabase.auth.admin.updateUserById(
      userId,
      { ban_duration: 'none' }
    );

    if (unbanError) {
      throw unbanError;
    }

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'unban_user',
      targetUserId: userId,
      targetUserEmail: user.email || '',
      changesBefore: { banned: true, banned_until: user.banned_until },
      changesAfter: { banned: false, banned_until: null },
      description: `Разблокиран потребител ${user.email}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Потребителят е разблокиран успешно',
      user: {
        id: userId,
        email: user.email,
        banned: false
      }
    });

  } catch (error: any) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unban user' },
      { status: 500 }
    );
  }
}
