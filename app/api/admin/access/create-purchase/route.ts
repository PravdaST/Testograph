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
    const {
      userId,
      productName,
      productType,
      appsIncluded,
      amount,
      currency,
      status,
      adminId,
      adminEmail
    } = body;

    // Validation
    if (!userId || !productName || !productType || !appsIncluded || !amount || !adminId || !adminEmail) {
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

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        shopify_order_id: `MANUAL-${Date.now()}`, // Manual purchase ID
        product_name: productName,
        product_type: productType,
        apps_included: appsIncluded,
        amount: parseFloat(amount),
        currency: currency || 'BGN',
        status: status || 'completed',
        purchased_at: new Date().toISOString()
      })
      .select()
      .single();

    if (purchaseError) {
      throw purchaseError;
    }

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'create_purchase',
      targetUserId: userId,
      targetUserEmail: user.email || '',
      changesBefore: null,
      changesAfter: purchase,
      description: `Създадена ръчна покупка: ${productName} (${amount} ${currency || 'BGN'})`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Покупката е създадена успешно',
      purchase
    });

  } catch (error: any) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase' },
      { status: 500 }
    );
  }
}
