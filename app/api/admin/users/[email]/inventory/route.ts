import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH - Update capsules for a user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);
    const body = await request.json();
    const { capsules, reason } = body;

    if (typeof capsules !== 'number' || capsules < 0) {
      return NextResponse.json(
        { error: 'Invalid capsules value' },
        { status: 400 }
      );
    }

    // Check if inventory record exists
    const { data: existing, error: fetchError } = await supabase
      .from('testoup_inventory')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const previousCapsules = existing?.capsules_remaining || 0;

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('testoup_inventory')
        .update({
          capsules_remaining: capsules,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('testoup_inventory')
        .insert({
          email,
          capsules_remaining: capsules,
          bottles_purchased: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }

    // Log the action in admin_audit_logs
    await supabase.from('admin_audit_logs').insert({
      action_type: 'update_inventory',
      target_user_email: email,
      admin_email: 'admin', // TODO: Get from session
      metadata: {
        previousCapsules,
        newCapsules: capsules,
        reason: reason || 'Manual adjustment',
      },
    });

    return NextResponse.json({
      success: true,
      previousCapsules,
      newCapsules: capsules,
    });
  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
