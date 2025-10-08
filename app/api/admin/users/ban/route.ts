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
    const { userId, reason, duration, adminId, adminEmail } = body;

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

    // Check if user is already banned
    if (user.banned_until) {
      return NextResponse.json(
        { error: 'User is already banned' },
        { status: 400 }
      );
    }

    // Ban user
    const banDuration = duration || '876000h'; // ~100 years (indefinite)
    const { error: banError } = await supabase.auth.admin.updateUserById(
      userId,
      { ban_duration: banDuration }
    );

    if (banError) {
      throw banError;
    }

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'ban_user',
      targetUserId: userId,
      targetUserEmail: user.email || '',
      changesBefore: { banned: false, banned_until: null },
      changesAfter: { banned: true, ban_duration: banDuration },
      description: `Блокиран потребител ${user.email}${reason ? ` - Причина: ${reason}` : ''}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Потребителят е блокиран успешно',
      user: {
        id: userId,
        email: user.email,
        banned: true
      }
    });

  } catch (error: any) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ban user' },
      { status: 500 }
    );
  }
}
