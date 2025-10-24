import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, commission_rate, admin_notes } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // First, get the application details
    const { data: application, error: fetchError } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update the application
    const { data: updatedApp, error: updateError } = await supabase
      .from('affiliate_applications')
      .update({
        status,
        commission_rate: status === 'approved' ? commission_rate : null,
        admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // If approved, create affiliate record and send email
    if (status === 'approved') {
      // Generate unique promo code
      const promoCode = generatePromoCode(application.full_name);

      // Create affiliate record
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .insert({
          user_id: null, // Will be set when they log in
          full_name: application.full_name,
          email: application.email,
          phone: application.phone,
          promo_code: promoCode,
          commission_rate: commission_rate || 5,
          status: 'active',
          application_id: params.id,
        })
        .select()
        .single();

      if (affiliateError) {
        console.error('Error creating affiliate:', affiliateError);
        // Rollback application status
        await supabase
          .from('affiliate_applications')
          .update({ status: 'pending' })
          .eq('id', params.id);

        return NextResponse.json(
          { error: 'Failed to create affiliate account' },
          { status: 500 }
        );
      }

      // TODO: Send approval email with promo code and login details
      console.log('TODO: Send approval email to', application.email);
    } else if (status === 'rejected') {
      // TODO: Send rejection email (optional)
      console.log('TODO: Send rejection email to', application.email);
    }

    return NextResponse.json({
      success: true,
      application: updatedApp,
    });

  } catch (error: any) {
    console.error('Error in application approval API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique promo code
function generatePromoCode(fullName: string): string {
  const namePart = fullName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 6)
    .toUpperCase();

  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${namePart}${randomPart}`;
}
