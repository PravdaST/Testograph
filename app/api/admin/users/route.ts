import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface UserData {
  email: string;
  firstName?: string;
  // Quiz data
  quizDate?: string;
  category?: 'energy' | 'libido' | 'muscle';
  level?: string;
  totalScore?: number;
  workoutLocation?: 'home' | 'gym';
  // Inventory
  capsulesRemaining?: number;
  // Activity counts (TOTAL - all time)
  workoutCount?: number;
  mealCount?: number;
  sleepCount?: number;
  testoupCount?: number;
  coachMessages?: number;
  // New tracking data
  bodyMeasurements?: number;
  progressPhotos?: number;
  // Legacy
  chatSessions: number;
  lastActivity: string;
  purchasesCount: number;
  totalSpent: number;
  latestPurchase?: string;
  // Access
  hasAppAccess?: boolean;
  // Payment status
  paymentStatus?: 'paid' | 'pending' | 'none';
  pendingOrderDate?: string;
  // Reminder tracking
  quizReminderSentAt?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const statusFilter = searchParams.get('statusFilter') || 'all';

    // Fetch all data in parallel for performance
    const [
      quizResultsRes,
      inventoryRes,
      workoutSessionsRes,
      mealCompletionsRes,
      sleepTrackingRes,
      testoupTrackingRes,
      coachMessagesRes,
      chatSessionsRes,
      purchasesRes,
      bodyMeasurementsRes,
      progressPhotosRes,
      quizRemindersRes,
      purchaseHistoryRes,
    ] = await Promise.all([
      // Quiz results (main user data)
      supabase
        .from('quiz_results_v2')
        .select('email, first_name, category, determined_level, total_score, workout_location, created_at')
        .order('created_at', { ascending: false }),

      // TestoUP inventory - capsules remaining
      supabase
        .from('testoup_inventory')
        .select('email, capsules_remaining'),

      // Workout sessions (ALL TIME - not just 7 days)
      supabase
        .from('workout_sessions')
        .select('email, date'),

      // Meal completions (ALL TIME)
      supabase
        .from('meal_completions')
        .select('email, date'),

      // Sleep tracking (ALL TIME)
      supabase
        .from('sleep_tracking')
        .select('email, date'),

      // TestoUP tracking (ALL TIME)
      supabase
        .from('testoup_tracking')
        .select('email, date'),

      // Coach messages (total count)
      supabase
        .from('coach_messages')
        .select('email'),

      // Chat sessions (legacy)
      supabase
        .from('chat_sessions')
        .select('email, created_at, updated_at'),

      // All orders from pending_orders (same source as Shopify Orders page)
      supabase
        .from('pending_orders')
        .select('email, total_price, created_at, paid_at'),

      // Body measurements (NEW)
      supabase
        .from('body_measurements')
        .select('email'),

      // Progress photos (NEW)
      supabase
        .from('progress_photos')
        .select('email'),

      // Quiz reminder emails sent
      supabase
        .from('email_logs')
        .select('recipient_email, sent_at')
        .ilike('subject', '%Quiz%напомняне%')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false }),

      // Purchase history (for capsules fallback when inventory is empty)
      supabase
        .from('testoup_purchase_history')
        .select('email, capsules_added'),
    ]);

    // Check for errors (log but don't fail)
    if (quizResultsRes.error) console.error('Quiz results error:', quizResultsRes.error);
    if (inventoryRes.error) console.error('Inventory error:', inventoryRes.error);
    if (workoutSessionsRes.error) console.error('Workout sessions error:', workoutSessionsRes.error);
    if (mealCompletionsRes.error) console.error('Meal completions error:', mealCompletionsRes.error);
    if (sleepTrackingRes.error) console.error('Sleep tracking error:', sleepTrackingRes.error);
    if (testoupTrackingRes.error) console.error('TestoUP tracking error:', testoupTrackingRes.error);
    if (coachMessagesRes.error) console.error('Coach messages error:', coachMessagesRes.error);
    if (chatSessionsRes.error) console.error('Chat sessions error:', chatSessionsRes.error);
    if (purchasesRes.error) console.error('Purchases error:', purchasesRes.error);
    if (bodyMeasurementsRes.error) console.error('Body measurements error:', bodyMeasurementsRes.error);
    if (progressPhotosRes.error) console.error('Progress photos error:', progressPhotosRes.error);
    if (quizRemindersRes.error) console.error('Quiz reminders error:', quizRemindersRes.error);
    if (purchaseHistoryRes.error) console.error('Purchase history error:', purchaseHistoryRes.error);

    const quizResults = quizResultsRes.data || [];
    const inventory = inventoryRes.data || [];
    const workoutSessions = workoutSessionsRes.data || [];
    const mealCompletions = mealCompletionsRes.data || [];
    const sleepTracking = sleepTrackingRes.data || [];
    const testoupTracking = testoupTrackingRes.data || [];
    const coachMessages = coachMessagesRes.data || [];
    const chatSessions = chatSessionsRes.data || [];
    const allOrders = purchasesRes.data || []; // From pending_orders table
    const bodyMeasurements = bodyMeasurementsRes.data || [];
    const progressPhotos = progressPhotosRes.data || [];
    const quizReminders = quizRemindersRes.data || [];
    const purchaseHistory = purchaseHistoryRes.data || [];

    // Separate paid and pending orders
    const paidOrders = allOrders.filter((o: any) => o.paid_at !== null);
    const pendingOrders = allOrders.filter((o: any) => o.paid_at === null);

    // Create lookup maps for fast access
    const inventoryMap = new Map(inventory.map(i => [i.email, i.capsules_remaining]));

    // Create capsules map from purchase history (for fallback when inventory is empty)
    const purchasedCapsulesMap = new Map<string, number>();
    purchaseHistory.forEach((p: any) => {
      if (p.email && p.capsules_added) {
        purchasedCapsulesMap.set(
          p.email,
          (purchasedCapsulesMap.get(p.email) || 0) + (p.capsules_added || 0)
        );
      }
    });

    // Helper to get capsules with fallback to purchase history
    const getCapsulesForEmail = (email: string): number => {
      const fromInventory = inventoryMap.get(email);
      if (fromInventory !== undefined && fromInventory !== null) {
        return fromInventory;
      }
      // Fallback: use total purchased capsules
      return purchasedCapsulesMap.get(email) || 0;
    };

    // Quiz reminders map (email -> most recent sent_at, since ordered desc)
    const quizRemindersMap = new Map<string, string>();
    quizReminders.forEach((reminder: any) => {
      if (reminder.recipient_email && !quizRemindersMap.has(reminder.recipient_email)) {
        quizRemindersMap.set(reminder.recipient_email, reminder.sent_at);
      }
    });

    // Create pending orders map (email -> earliest pending order date)
    const pendingOrdersMap = new Map<string, string>();
    pendingOrders.forEach((order: any) => {
      if (order.email && !pendingOrdersMap.has(order.email)) {
        pendingOrdersMap.set(order.email, order.created_at);
      }
    });

    // Count activities by email
    const countByEmail = (data: any[], emailField: string = 'email') => {
      const map = new Map<string, number>();
      data.forEach(item => {
        const email = item[emailField];
        if (email) {
          map.set(email, (map.get(email) || 0) + 1);
        }
      });
      return map;
    };

    const workoutCountMap = countByEmail(workoutSessions);
    const mealCountMap = countByEmail(mealCompletions);
    const sleepCountMap = countByEmail(sleepTracking);
    const testoupCountMap = countByEmail(testoupTracking);
    const coachMessagesMap = countByEmail(coachMessages);
    const chatSessionsMap = countByEmail(chatSessions);
    const bodyMeasurementsMap = countByEmail(bodyMeasurements);
    const progressPhotosMap = countByEmail(progressPhotos);

    // Build users map starting from quiz_results_v2 (primary source)
    const usersMap = new Map<string, UserData>();

    // Process quiz results first (most important)
    const processedEmails = new Set<string>();
    quizResults.forEach((quiz) => {
      if (!quiz.email || processedEmails.has(quiz.email)) return;
      processedEmails.add(quiz.email);

      usersMap.set(quiz.email, {
        email: quiz.email,
        firstName: quiz.first_name,
        quizDate: quiz.created_at,
        category: quiz.category,
        level: quiz.determined_level,
        totalScore: quiz.total_score,
        workoutLocation: quiz.workout_location,
        capsulesRemaining: getCapsulesForEmail(quiz.email),
        workoutCount: workoutCountMap.get(quiz.email) || 0,
        mealCount: mealCountMap.get(quiz.email) || 0,
        sleepCount: sleepCountMap.get(quiz.email) || 0,
        testoupCount: testoupCountMap.get(quiz.email) || 0,
        coachMessages: coachMessagesMap.get(quiz.email) || 0,
        bodyMeasurements: bodyMeasurementsMap.get(quiz.email) || 0,
        progressPhotos: progressPhotosMap.get(quiz.email) || 0,
        chatSessions: chatSessionsMap.get(quiz.email) || 0,
        lastActivity: quiz.created_at,
        purchasesCount: 0,
        totalSpent: 0,
        hasAppAccess: true, // Has completed quiz = has app access
        quizReminderSentAt: quizRemindersMap.get(quiz.email),
      });
    });

    // Add users from inventory who might not have quiz results
    inventory.forEach((inv) => {
      if (!inv.email || usersMap.has(inv.email)) return;

      usersMap.set(inv.email, {
        email: inv.email,
        capsulesRemaining: getCapsulesForEmail(inv.email),
        workoutCount: workoutCountMap.get(inv.email) || 0,
        mealCount: mealCountMap.get(inv.email) || 0,
        sleepCount: sleepCountMap.get(inv.email) || 0,
        testoupCount: testoupCountMap.get(inv.email) || 0,
        coachMessages: coachMessagesMap.get(inv.email) || 0,
        bodyMeasurements: bodyMeasurementsMap.get(inv.email) || 0,
        progressPhotos: progressPhotosMap.get(inv.email) || 0,
        chatSessions: chatSessionsMap.get(inv.email) || 0,
        lastActivity: new Date().toISOString(),
        purchasesCount: 0,
        totalSpent: 0,
        hasAppAccess: false,
        quizReminderSentAt: quizRemindersMap.get(inv.email),
      });
    });

    // Process paid orders (from pending_orders where paid_at is not null)
    const purchasesByEmail = new Map<string, { count: number; total: number; latest: string }>();
    paidOrders?.forEach((order: any) => {
      const email = order.email;
      if (!email) return;

      const existing = purchasesByEmail.get(email);
      if (existing) {
        existing.count += 1;
        existing.total += parseFloat(order.total_price) || 0;
        if (new Date(order.paid_at) > new Date(existing.latest)) {
          existing.latest = order.paid_at;
        }
      } else {
        purchasesByEmail.set(email, {
          count: 1,
          total: parseFloat(order.total_price) || 0,
          latest: order.paid_at,
        });
      }
    });

    // Update usersMap with purchase data
    purchasesByEmail.forEach((purchaseData, email) => {
      const existing = usersMap.get(email);
      if (existing) {
        existing.purchasesCount = purchaseData.count;
        existing.totalSpent = Math.round(purchaseData.total * 100) / 100;
        existing.latestPurchase = purchaseData.latest;
      } else {
        usersMap.set(email, {
          email,
          capsulesRemaining: getCapsulesForEmail(email),
          workoutCount: workoutCountMap.get(email) || 0,
          mealCount: mealCountMap.get(email) || 0,
          sleepCount: sleepCountMap.get(email) || 0,
          testoupCount: testoupCountMap.get(email) || 0,
          coachMessages: coachMessagesMap.get(email) || 0,
          bodyMeasurements: bodyMeasurementsMap.get(email) || 0,
          progressPhotos: progressPhotosMap.get(email) || 0,
          chatSessions: chatSessionsMap.get(email) || 0,
          lastActivity: purchaseData.latest,
          purchasesCount: purchaseData.count,
          totalSpent: Math.round(purchaseData.total * 100) / 100,
          latestPurchase: purchaseData.latest,
          hasAppAccess: false,
          quizReminderSentAt: quizRemindersMap.get(email),
        });
      }
    });

    // Add users from pending orders who don't have other data
    pendingOrders.forEach((order: any) => {
      if (!order.email || usersMap.has(order.email)) return;
      usersMap.set(order.email, {
        email: order.email,
        capsulesRemaining: getCapsulesForEmail(order.email),
        workoutCount: workoutCountMap.get(order.email) || 0,
        mealCount: mealCountMap.get(order.email) || 0,
        sleepCount: sleepCountMap.get(order.email) || 0,
        testoupCount: testoupCountMap.get(order.email) || 0,
        coachMessages: coachMessagesMap.get(order.email) || 0,
        bodyMeasurements: bodyMeasurementsMap.get(order.email) || 0,
        progressPhotos: progressPhotosMap.get(order.email) || 0,
        chatSessions: 0,
        lastActivity: order.created_at,
        purchasesCount: 0,
        totalSpent: 0,
        hasAppAccess: false,
        paymentStatus: 'pending',
        pendingOrderDate: order.created_at,
        quizReminderSentAt: quizRemindersMap.get(order.email),
      });
    });

    // Set payment status for all users
    usersMap.forEach((user, email) => {
      if (user.purchasesCount > 0) {
        user.paymentStatus = 'paid';
      } else if (pendingOrdersMap.has(email)) {
        user.paymentStatus = 'pending';
        user.pendingOrderDate = pendingOrdersMap.get(email);
      } else {
        user.paymentStatus = 'none';
      }
    });

    // Convert to array
    let allUsers = Array.from(usersMap.values());

    // Calculate stats on ALL users (before any filtering)
    // Also calculate order-level stats to match Shopify Orders page
    const totalPaidOrders = paidOrders.length;
    const totalPendingOrders = pendingOrders.length;
    const totalPaidRevenue = paidOrders.reduce((sum, o: any) => sum + (parseFloat(o.total_price) || 0), 0);
    const totalPendingRevenue = pendingOrders.reduce((sum, o: any) => sum + (parseFloat(o.total_price) || 0), 0);

    const stats = {
      withQuiz: allUsers.filter(u => u.quizDate).length,
      withoutQuiz: allUsers.filter(u => !u.quizDate).length,
      withPurchases: allUsers.filter(u => u.purchasesCount > 0).length,
      pendingPayments: allUsers.filter(u => u.paymentStatus === 'pending').length,
      withCapsules: allUsers.filter(u => (u.capsulesRemaining || 0) > 0).length,
      activeThisWeek: allUsers.filter(u =>
        (u.workoutCount || 0) > 0 ||
        (u.mealCount || 0) > 0 ||
        (u.sleepCount || 0) > 0 ||
        (u.testoupCount || 0) > 0
      ).length,
      withAppAccess: allUsers.filter(u => u.hasAppAccess).length,
      // User-level revenue (sum of unique user totals)
      totalRevenue: allUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0),
      // Order-level stats (matches Shopify Orders page)
      totalPaidOrders,
      totalPendingOrders,
      totalPaidRevenue: Math.round(totalPaidRevenue * 100) / 100,
      totalPendingRevenue: Math.round(totalPendingRevenue * 100) / 100,
      total: allUsers.length,
    };

    // Apply search filter
    let users = allUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      users = users.filter((user) => {
        switch (statusFilter) {
          case 'withQuiz':
            return !!user.quizDate;
          case 'withoutQuiz':
            return !user.quizDate;
          case 'withPurchases':
            return user.purchasesCount > 0;
          case 'pendingPayment':
            return user.paymentStatus === 'pending';
          case 'active':
            return (user.workoutCount || 0) > 0 ||
              (user.mealCount || 0) > 0 ||
              (user.sleepCount || 0) > 0 ||
              (user.testoupCount || 0) > 0;
          default:
            return true;
        }
      });
    }

    // Sort by quiz date (most recent first), then by last activity
    users.sort((a, b) => {
      // Users with quiz date first
      if (a.quizDate && !b.quizDate) return -1;
      if (!a.quizDate && b.quizDate) return 1;
      if (a.quizDate && b.quizDate) {
        return new Date(b.quizDate).getTime() - new Date(a.quizDate).getTime();
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    // Calculate pagination
    const totalFiltered = users.length;
    const totalPages = Math.ceil(totalFiltered / limit);
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    return NextResponse.json({
      users: paginatedUsers,
      total: totalFiltered,
      stats,
      pagination: {
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      }
    });
  } catch (error: any) {
    console.error('Error fetching users data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users data' },
      { status: 500 }
    );
  }
}
