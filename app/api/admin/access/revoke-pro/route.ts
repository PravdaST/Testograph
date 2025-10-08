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
    const { userId, adminId, adminEmail, reason } = body;

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

    // Get current profile state
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('protocol_start_date_pro')
      .eq('id', userId)
      .single();

    if (!currentProfile?.protocol_start_date_pro) {
      return NextResponse.json(
        { error: 'User does not have PRO access' },
        { status: 400 }
      );
    }

    // Nullify PRO start date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ protocol_start_date_pro: null })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'revoke_pro_access',
      targetUserId: userId,
      targetUserEmail: user.email || '',
      changesBefore: { protocol_start_date_pro: currentProfile.protocol_start_date_pro },
      changesAfter: { protocol_start_date_pro: null },
      description: `Премахнато PRO достъп${reason ? ` - Причина: ${reason}` : ''}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'PRO достъп премахнат успешно',
      user: {
        id: userId,
        email: user.email,
        protocol_start_date_pro: null
      }
    });

  } catch (error: any) {
    console.error('Error revoking PRO access:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revoke PRO access' },
      { status: 500 }
    );
  }
}
