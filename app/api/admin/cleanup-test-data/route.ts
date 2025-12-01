import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Protected emails - NEVER DELETE
const PROTECTED_EMAILS = ['caspere63@gmail.com', 'admin@testograph.eu'];

/**
 * Check if an email is a test email based on patterns
 */
function isTestEmail(email: string): boolean {
  const e = email.toLowerCase();

  // Never delete protected emails
  if (PROTECTED_EMAILS.includes(e)) return false;

  // Test patterns
  if (e.includes('test')) return true;
  if (e.endsWith('@example.com')) return true;
  if (e.endsWith('@testmail.com')) return true;
  if (e.endsWith('@testak.bg')) return true;
  if (e.endsWith('@testab.bg')) return true;
  if (e.endsWith('@abvtest.bg')) return true;

  return false;
}

interface CleanupStats {
  testEmailsFound: number;
  deletedQuizResults: number;
  deletedInventory: number;
  deletedPurchaseHistory: number;
  deletedChatSessions: number;
  deletedFunnelEvents: number;
  deletedFunnelSessions: number;
  deletedAuthUsers: number;
  deletedProfiles: number;
}

/**
 * GET /api/admin/cleanup-test-data
 * Preview what will be deleted (dry run)
 */
export async function GET() {
  try {
    // Get all quiz results
    const { data: quizResults } = await supabase
      .from('quiz_results_v2')
      .select('email');

    // Get all inventory
    const { data: inventory } = await supabase
      .from('testoup_inventory')
      .select('email');

    // Get all chat sessions
    const { data: chatSessions } = await supabase
      .from('chat_sessions')
      .select('email');

    // Get all funnel sessions
    const { data: funnelSessions } = await supabase
      .from('funnel_sessions')
      .select('user_email');

    // Collect all unique emails
    const allEmails = new Set<string>();
    quizResults?.forEach(r => r.email && allEmails.add(r.email));
    inventory?.forEach(i => i.email && allEmails.add(i.email));
    chatSessions?.forEach(c => c.email && allEmails.add(c.email));
    funnelSessions?.forEach(f => f.user_email && allEmails.add(f.user_email));

    // Separate test from real
    const testEmails: string[] = [];
    const realEmails: string[] = [];

    allEmails.forEach(email => {
      if (isTestEmail(email)) {
        testEmails.push(email);
      } else {
        realEmails.push(email);
      }
    });

    return NextResponse.json({
      success: true,
      preview: true,
      testEmailsToDelete: testEmails.sort(),
      realEmailsToKeep: realEmails.sort(),
      summary: {
        testCount: testEmails.length,
        realCount: realEmails.length,
        totalEmails: allEmails.size,
      },
      message: 'Use DELETE method with confirmText="DELETE TEST DATA" to execute cleanup',
    });
  } catch (error: any) {
    console.error('Error previewing test data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to preview test data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cleanup-test-data
 * Delete ONLY test data, preserve all real customers
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
    if (confirmText !== 'DELETE TEST DATA') {
      return NextResponse.json(
        { error: 'Confirmation text must be "DELETE TEST DATA"' },
        { status: 400 }
      );
    }

    console.log('Starting targeted test data cleanup...');

    const stats: CleanupStats = {
      testEmailsFound: 0,
      deletedQuizResults: 0,
      deletedInventory: 0,
      deletedPurchaseHistory: 0,
      deletedChatSessions: 0,
      deletedFunnelEvents: 0,
      deletedFunnelSessions: 0,
      deletedAuthUsers: 0,
      deletedProfiles: 0,
    };

    // Step 1: Get ALL quiz results and filter test emails
    const { data: quizResults } = await supabase
      .from('quiz_results_v2')
      .select('email');

    const { data: inventory } = await supabase
      .from('testoup_inventory')
      .select('email');

    const { data: chatSessions } = await supabase
      .from('chat_sessions')
      .select('email');

    const { data: funnelSessions } = await supabase
      .from('funnel_sessions')
      .select('user_email, session_id');

    // Collect test emails
    const testEmails = new Set<string>();
    quizResults?.forEach(r => r.email && isTestEmail(r.email) && testEmails.add(r.email));
    inventory?.forEach(i => i.email && isTestEmail(i.email) && testEmails.add(i.email));
    chatSessions?.forEach(c => c.email && isTestEmail(c.email) && testEmails.add(c.email));
    funnelSessions?.forEach(f => f.user_email && isTestEmail(f.user_email) && testEmails.add(f.user_email));

    const testEmailArray = Array.from(testEmails);
    stats.testEmailsFound = testEmailArray.length;

    console.log(`Found ${testEmailArray.length} test emails to clean up`);

    if (testEmailArray.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No test data to delete',
        stats,
      });
    }

    // Step 2: Get funnel session IDs for test emails (for deleting funnel_events)
    const testSessionIds = funnelSessions
      ?.filter(f => f.user_email && isTestEmail(f.user_email))
      .map(f => f.session_id) || [];

    // Step 3: Delete funnel_events first (foreign key constraint)
    if (testSessionIds.length > 0) {
      const { error, count } = await supabase
        .from('funnel_events')
        .delete()
        .in('session_id', testSessionIds)
        .select('*', { count: 'exact' });

      if (error) console.error('Error deleting funnel_events:', error);
      else stats.deletedFunnelEvents = count || 0;
    }

    // Step 4: Delete funnel_sessions
    const { error: funnelError, count: funnelCount } = await supabase
      .from('funnel_sessions')
      .delete()
      .in('user_email', testEmailArray)
      .select('*', { count: 'exact' });

    if (funnelError) console.error('Error deleting funnel_sessions:', funnelError);
    else stats.deletedFunnelSessions = funnelCount || 0;

    // Step 5: Delete chat_sessions
    const { error: chatError, count: chatCount } = await supabase
      .from('chat_sessions')
      .delete()
      .in('email', testEmailArray)
      .select('*', { count: 'exact' });

    if (chatError) console.error('Error deleting chat_sessions:', chatError);
    else stats.deletedChatSessions = chatCount || 0;

    // Step 6: Delete quiz_results_v2
    const { error: quizError, count: quizCount } = await supabase
      .from('quiz_results_v2')
      .delete()
      .in('email', testEmailArray)
      .select('*', { count: 'exact' });

    if (quizError) console.error('Error deleting quiz_results_v2:', quizError);
    else stats.deletedQuizResults = quizCount || 0;

    // Step 7: Delete testoup_inventory
    const { error: invError, count: invCount } = await supabase
      .from('testoup_inventory')
      .delete()
      .in('email', testEmailArray)
      .select('*', { count: 'exact' });

    if (invError) console.error('Error deleting testoup_inventory:', invError);
    else stats.deletedInventory = invCount || 0;

    // Step 8: Delete testoup_purchase_history
    const { error: purchaseError, count: purchaseCount } = await supabase
      .from('testoup_purchase_history')
      .delete()
      .in('email', testEmailArray)
      .select('*', { count: 'exact' });

    if (purchaseError) console.error('Error deleting testoup_purchase_history:', purchaseError);
    else stats.deletedPurchaseHistory = purchaseCount || 0;

    // Step 9: Delete auth users that match test patterns
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const testAuthUsers = authUsers?.users.filter(u => u.email && isTestEmail(u.email)) || [];

    // Get test user IDs for related table cleanup
    const testUserIds = testAuthUsers.map(u => u.id);

    // Step 10: Delete profiles for test users
    if (testUserIds.length > 0) {
      const { error: profileError, count: profileCount } = await supabase
        .from('profiles')
        .delete()
        .in('id', testUserIds)
        .select('*', { count: 'exact' });

      if (profileError) console.error('Error deleting profiles:', profileError);
      else stats.deletedProfiles = profileCount || 0;
    }

    // Step 13: Delete auth users
    for (const user of testAuthUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (!error) stats.deletedAuthUsers++;
      else console.error(`Failed to delete auth user ${user.email}:`, error);
    }

    console.log('Test data cleanup completed:', stats);

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'cleanup_test_data',
      targetUserId: null,
      targetUserEmail: null,
      changesBefore: { testEmailsFound: testEmailArray },
      changesAfter: stats,
      description: `Cleaned up ${stats.testEmailsFound} test email records`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${stats.testEmailsFound} test accounts`,
      stats,
      deletedEmails: testEmailArray,
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup test data' },
      { status: 500 }
    );
  }
}
