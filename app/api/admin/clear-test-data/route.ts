import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Protected admin user - NEVER DELETE
const PROTECTED_ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';
const PROTECTED_EMAILS = ['caspere63@gmail.com', 'admin@testograph.eu'];

interface DeleteStats {
  deletedUsers: number;
  deletedPurchases: number;
  deletedChatSessions: number;
  deletedFunnelSessions: number;
  deletedFunnelEvents: number;
  deletedProEntries: number;
  deletedProMeasurements: number;
  deletedUserSettings: number;
  deletedProfiles: number;
}

/**
 * Bulk Delete All Test Data
 * DELETE /api/admin/clear-test-data
 *
 * Deletes ALL users and their data EXCEPT the protected admin user.
 * Use with EXTREME CAUTION - this action is irreversible!
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, adminEmail, confirmText } = body;

    // Validation
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing admin credentials' },
        { status: 400 }
      );
    }

    // Require explicit confirmation
    if (confirmText !== 'DELETE ALL') {
      return NextResponse.json(
        { error: 'Confirmation text must be "DELETE ALL"' },
        { status: 400 }
      );
    }

    // Verify admin has permission
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('id', adminId)
      .single();

    if (!adminUser || adminUser.role === 'viewer') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.log('🗑️ Starting bulk delete operation...');

    // Initialize stats
    const stats: DeleteStats = {
      deletedUsers: 0,
      deletedPurchases: 0,
      deletedChatSessions: 0,
      deletedFunnelSessions: 0,
      deletedFunnelEvents: 0,
      deletedProEntries: 0,
      deletedProMeasurements: 0,
      deletedUserSettings: 0,
      deletedProfiles: 0,
    };

    // Get all users EXCEPT protected admin
    const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    // Filter out protected admin
    const usersToDelete = allUsers.users.filter(
      (user) =>
        user.id !== PROTECTED_ADMIN_ID &&
        !PROTECTED_EMAILS.includes(user.email || '')
    );

    console.log(`Found ${usersToDelete.length} users to delete (excluding admin)`);

    // Extract user IDs and emails for batch operations
    const userIds = usersToDelete.map((u) => u.id);
    const userEmails = usersToDelete.map((u) => u.email).filter(Boolean);

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to delete',
        stats,
      });
    }

    // Delete in correct order (respecting foreign key constraints)

    // 1. Delete funnel_events (depends on funnel_sessions)
    const { error: eventsError } = await supabase
      .from('funnel_events')
      .delete()
      .in('session_id',
        supabase.from('funnel_sessions').select('session_id')
      );

    if (!eventsError) {
      const { count } = await supabase
        .from('funnel_events')
        .select('*', { count: 'exact', head: true });
      stats.deletedFunnelEvents = count || 0;
    }

    // 2. Delete funnel_sessions
    const { error: funnelError, count: funnelCount } = await supabase
      .from('funnel_sessions')
      .delete()
      .in('user_email', userEmails)
      .select('*', { count: 'exact' });

    if (!funnelError) {
      stats.deletedFunnelSessions = funnelCount || 0;
    }

    // 3. Delete chat_sessions
    const { error: chatError, count: chatCount } = await supabase
      .from('chat_sessions')
      .delete()
      .in('email', userEmails)
      .select('*', { count: 'exact' });

    if (!chatError) {
      stats.deletedChatSessions = chatCount || 0;
    }

    // 4. Delete purchases
    const { error: purchasesError, count: purchasesCount } = await supabase
      .from('purchases')
      .delete()
      .in('user_id', userIds)
      .select('*', { count: 'exact' });

    if (!purchasesError) {
      stats.deletedPurchases = purchasesCount || 0;
    }

    // 5. Delete daily_entries_pro
    const { error: entriesError, count: entriesCount } = await supabase
      .from('daily_entries_pro')
      .delete()
      .in('user_id', userIds)
      .select('*', { count: 'exact' });

    if (!entriesError) {
      stats.deletedProEntries = entriesCount || 0;
    }

    // 6. Delete weekly_measurements_pro
    const { error: measurementsError, count: measurementsCount } = await supabase
      .from('weekly_measurements_pro')
      .delete()
      .in('user_id', userIds)
      .select('*', { count: 'exact' });

    if (!measurementsError) {
      stats.deletedProMeasurements = measurementsCount || 0;
    }

    // 7. Delete user_settings
    const { error: settingsError, count: settingsCount } = await supabase
      .from('user_settings')
      .delete()
      .in('user_id', userIds)
      .select('*', { count: 'exact' });

    if (!settingsError) {
      stats.deletedUserSettings = settingsCount || 0;
    }

    // 8. Delete profiles
    const { error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds)
      .select('*', { count: 'exact' });

    if (!profilesError) {
      stats.deletedProfiles = profilesCount || 0;
    }

    // 9. Delete auth.users (CASCADE will handle remaining related data)
    for (const user of usersToDelete) {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
      if (!deleteUserError) {
        stats.deletedUsers++;
      } else {
        console.error(`Failed to delete user ${user.email}:`, deleteUserError);
      }
    }

    console.log('✅ Bulk delete completed:', stats);

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'bulk_delete',
      targetUserId: null,
      targetUserEmail: null,
      changesBefore: {
        userCount: usersToDelete.length,
        protectedAdmin: PROTECTED_ADMIN_ID,
      },
      changesAfter: stats,
      description: `Bulk deleted all test data - ${stats.deletedUsers} users and all related records`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${stats.deletedUsers} users and all their data`,
      stats,
      protectedAdmin: {
        id: PROTECTED_ADMIN_ID,
        emails: PROTECTED_EMAILS,
        status: 'preserved',
      },
    });

  } catch (error: any) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete test data' },
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns endpoint info
 */
export async function GET() {
  return NextResponse.json({
    message: 'Bulk delete endpoint',
    method: 'DELETE',
    warning: 'This endpoint deletes ALL users except admin. Use with extreme caution!',
    protectedAdmin: {
      id: PROTECTED_ADMIN_ID,
      emails: PROTECTED_EMAILS,
    },
  });
}
