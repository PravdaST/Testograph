import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { purchaseId, updates, adminId, adminEmail } = body;

    // Validation
    if (!purchaseId || !updates || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current purchase state
    const { data: currentPurchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (fetchError || !currentPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Update purchase
    const { data: updatedPurchase, error: updateError } = await supabase
      .from('purchases')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Get user email for audit log
    const { data: { user } } = await supabase.auth.admin.getUserById(currentPurchase.user_id);

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'edit_purchase',
      targetUserId: currentPurchase.user_id,
      targetUserEmail: user?.email || '',
      changesBefore: currentPurchase,
      changesAfter: updatedPurchase,
      description: `Редактирана покупка ${currentPurchase.product_name}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Покупката е редактирана успешно',
      purchase: updatedPurchase
    });

  } catch (error: any) {
    console.error('Error editing purchase:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to edit purchase' },
      { status: 500 }
    );
  }
}
