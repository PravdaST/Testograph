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
    const { userId, startDate, adminId, adminEmail } = body;

    // Validation
    if (!userId || !startDate || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
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

    // Update profile with PRO start date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ protocol_start_date_pro: startDate })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'grant_pro_access',
      targetUserId: userId,
      targetUserEmail: user.email || '',
      changesBefore: { protocol_start_date_pro: currentProfile?.protocol_start_date_pro || null },
      changesAfter: { protocol_start_date_pro: startDate },
      description: `Дадено PRO достъп от ${startDate}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'PRO достъп даден успешно',
      user: {
        id: userId,
        email: user.email,
        protocol_start_date_pro: startDate
      }
    });

  } catch (error: any) {
    console.error('Error granting PRO access:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grant PRO access' },
      { status: 500 }
    );
  }
}
