import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/access-control
 *
 * Manual access management for testograph-v2 app
 * Actions: grant, revoke, extend
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, capsules, additional_days, reason, admin_email } = body;

    // Validate required fields
    if (!action || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: action, email' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user } = await supabase
      .from('quiz_results_v2')
      .select('email')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case 'grant':
        result = await grantAccess(email, capsules, reason, admin_email);
        break;

      case 'revoke':
        result = await revokeAccess(email, reason, admin_email);
        break;

      case 'extend':
        result = await extendAccess(email, additional_days, reason, admin_email);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: grant, revoke, or extend' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in access control:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform action' },
      { status: 500 }
    );
  }
}

// ===== GRANT ACCESS =====
async function grantAccess(
  email: string,
  capsules: number,
  reason: string,
  admin_email: string
) {
  if (!capsules || capsules <= 0) {
    throw new Error('Capsules must be a positive number');
  }

  // Get current inventory
  const { data: currentInventory } = await supabase
    .from('testoup_inventory')
    .select('*')
    .eq('email', email)
    .single();

  const currentCapsules = currentInventory?.capsules_remaining || 0;
  const currentBottles = currentInventory?.bottles_purchased || 0;

  // Update inventory (trigger will auto-update access)
  const { error: inventoryError } = await supabase
    .from('testoup_inventory')
    .upsert({
      email,
      capsules_remaining: currentCapsules + capsules,
      bottles_purchased: currentBottles + Math.floor(capsules / 60),
      total_capsules: (currentInventory?.total_capsules || 0) + capsules,
      last_refill_date: new Date().toISOString(),
      order_id: `ADMIN-GRANT-${Date.now()}`
    }, {
      onConflict: 'email'
    });

  if (inventoryError) throw inventoryError;

  // Log admin action
  await logAdminAction({
    admin_email: admin_email || 'unknown@testograph.eu',
    action: 'grant_access',
    target_email: email,
    metadata: {
      capsules_added: capsules,
      reason: reason || 'Manual grant by admin',
      new_total: currentCapsules + capsules
    }
  });

  // TODO: Send notification email
  // await sendAccessGrantedEmail(email, capsules);

  return {
    success: true,
    message: `Successfully granted ${capsules} capsules to ${email}`,
    new_total: currentCapsules + capsules
  };
}

// ===== REVOKE ACCESS =====
async function revokeAccess(
  email: string,
  reason: string,
  admin_email: string
) {
  // Set capsules to 0 (trigger will revoke access)
  const { error: inventoryError } = await supabase
    .from('testoup_inventory')
    .update({
      capsules_remaining: 0,
      last_refill_date: new Date().toISOString()
    })
    .eq('email', email);

  if (inventoryError) throw inventoryError;

  // Log admin action
  await logAdminAction({
    admin_email: admin_email || 'unknown@testograph.eu',
    action: 'revoke_access',
    target_email: email,
    metadata: {
      reason: reason || 'Manual revoke by admin'
    }
  });

  // TODO: Send notification email
  // await sendAccessRevokedEmail(email, reason);

  return {
    success: true,
    message: `Successfully revoked access for ${email}`
  };
}

// ===== EXTEND ACCESS =====
async function extendAccess(
  email: string,
  additional_days: number,
  reason: string,
  admin_email: string
) {
  if (!additional_days || additional_days <= 0) {
    throw new Error('Additional days must be a positive number');
  }

  // Calculate capsules needed (2 per day)
  const capsulesToAdd = additional_days * 2;

  // Get current inventory
  const { data: currentInventory } = await supabase
    .from('testoup_inventory')
    .select('*')
    .eq('email', email)
    .single();

  const currentCapsules = currentInventory?.capsules_remaining || 0;

  // Update inventory
  const { error: inventoryError } = await supabase
    .from('testoup_inventory')
    .update({
      capsules_remaining: currentCapsules + capsulesToAdd,
      total_capsules: (currentInventory?.total_capsules || 0) + capsulesToAdd,
      last_refill_date: new Date().toISOString()
    })
    .eq('email', email);

  if (inventoryError) throw inventoryError;

  // Log admin action
  await logAdminAction({
    admin_email: admin_email || 'unknown@testograph.eu',
    action: 'extend_access',
    target_email: email,
    metadata: {
      days_added: additional_days,
      capsules_added: capsulesToAdd,
      reason: reason || 'Manual extension by admin',
      new_total: currentCapsules + capsulesToAdd
    }
  });

  return {
    success: true,
    message: `Successfully extended access by ${additional_days} days (${capsulesToAdd} capsules) for ${email}`,
    new_total: currentCapsules + capsulesToAdd
  };
}

// ===== AUDIT LOG =====
async function logAdminAction(log: {
  admin_email: string;
  action: string;
  target_email: string;
  metadata: any;
}) {
  try {
    const { error } = await supabase
      .from('admin_audit_logs')
      .insert({
        admin_email: log.admin_email,
        action: log.action,
        target_resource: 'access_control',
        target_identifier: log.target_email,
        changes: log.metadata,
        timestamp: new Date().toISOString(),
        ip_address: null, // Can be added if needed
        user_agent: null
      });

    if (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - logging failure shouldn't break the main action
    }
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
