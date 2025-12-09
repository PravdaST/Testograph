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
  // Activity counts (last 7 days)
  workoutCount?: number;
  mealCount?: number;
  sleepCount?: number;
  testoupCount?: number;
  coachMessages?: number;
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

    // Get last 7 days date for activity filtering
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

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
      pendingOrdersRes,
      quizRemindersRes,
    ] = await Promise.all([
      // Quiz results (main user data)
      supabase
        .from('quiz_results_v2')
        .select('email, first_name, category, determined_level, total_score, workout_location, created_at')
        .order('created_at', { ascending: false }),

      // TestoUP inventory - table may not exist, skip
      Promise.resolve({ data: [], error: null }),

      // Workout sessions (last 7 days)
      supabase
        .from('workout_sessions')
        .select('email, date')
        .gte('date', sevenDaysAgoStr),

      // Meal completions (last 7 days)
      supabase
        .from('meal_completions')
        .select('email, date')
        .gte('date', sevenDaysAgoStr),

      // Sleep tracking (last 7 days)
      supabase
        .from('sleep_tracking')
        .select('email, date')
        .gte('date', sevenDaysAgoStr),

      // TestoUP tracking (last 7 days)
      supabase
        .from('testoup_tracking')
        .select('email, date')
        .gte('date', sevenDaysAgoStr),

      // Coach messages (total count)
      supabase
        .from('coach_messages')
        .select('email'),

      // Chat sessions (legacy)
      supabase
        .from('chat_sessions')
        .select('email, created_at, updated_at'),

      // Purchases (paid orders)
      supabase
        .from('testoup_purchase_history')
        .select('email, order_total, order_date')
        .not('email', 'ilike', '%test%')
        .not('order_id', 'eq', 'MANUAL_REFILL')
        .not('order_id', 'eq', 'MANUAL_ADD_SHOPIFY'),

      // Pending orders (not yet paid)
      supabase
        .from('pending_orders')
        .select('email, created_at, status')
        .eq('status', 'pending'),

      // Quiz reminder emails sent
      supabase
        .from('email_logs')
        .select('recipient_email, sent_at')
        .ilike('subject', '%Quiz%напомняне%')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false }),
    ]);

    // Check for errors
    if (quizResultsRes.error) console.error('Quiz results error:', quizResultsRes.error);
    if (inventoryRes.error) console.error('Inventory error:', inventoryRes.error);
    if (workoutSessionsRes.error) console.error('Workout sessions error:', workoutSessionsRes.error);
    if (mealCompletionsRes.error) console.error('Meal completions error:', mealCompletionsRes.error);
    if (sleepTrackingRes.error) console.error('Sleep tracking error:', sleepTrackingRes.error);
    if (testoupTrackingRes.error) console.error('TestoUP tracking error:', testoupTrackingRes.error);
    if (coachMessagesRes.error) console.error('Coach messages error:', coachMessagesRes.error);
    if (chatSessionsRes.error) console.error('Chat sessions error:', chatSessionsRes.error);
    if (purchasesRes.error) console.error('Purchases error:', purchasesRes.error);
    if (pendingOrdersRes.error) console.error('Pending orders error:', pendingOrdersRes.error);
    if (quizRemindersRes.error) console.error('Quiz reminders error:', quizRemindersRes.error);

    const quizResults = quizResultsRes.data || [];
    const inventory = inventoryRes.data || [];
    const workoutSessions = workoutSessionsRes.data || [];
    const mealCompletions = mealCompletionsRes.data || [];
    const sleepTracking = sleepTrackingRes.data || [];
    const testoupTracking = testoupTrackingRes.data || [];
    const coachMessages = coachMessagesRes.data || [];
    const chatSessions = chatSessionsRes.data || [];
    const purchases = purchasesRes.data || [];
    const pendingOrders = pendingOrdersRes.data || [];
    const quizReminders = quizRemindersRes.data || [];

    // Create lookup maps for fast access
    const inventoryMap = new Map(inventory.map(i => [i.email, i.capsules_remaining]));

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
        capsulesRemaining: inventoryMap.get(quiz.email) || 0,
        workoutCount: workoutCountMap.get(quiz.email) || 0,
        mealCount: mealCountMap.get(quiz.email) || 0,
        sleepCount: sleepCountMap.get(quiz.email) || 0,
        testoupCount: testoupCountMap.get(quiz.email) || 0,
        coachMessages: coachMessagesMap.get(quiz.email) || 0,
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
        capsulesRemaining: inv.capsules_remaining,
        workoutCount: workoutCountMap.get(inv.email) || 0,
        mealCount: mealCountMap.get(inv.email) || 0,
        sleepCount: sleepCountMap.get(inv.email) || 0,
        testoupCount: testoupCountMap.get(inv.email) || 0,
        coachMessages: coachMessagesMap.get(inv.email) || 0,
        chatSessions: chatSessionsMap.get(inv.email) || 0,
        lastActivity: new Date().toISOString(),
        purchasesCount: 0,
        totalSpent: 0,
        hasAppAccess: false,
        quizReminderSentAt: quizRemindersMap.get(inv.email),
      });
    });

    // Process purchases
    const purchasesByEmail = new Map<string, { count: number; total: number; latest: string }>();
    purchases?.forEach((purchase: any) => {
      const email = purchase.email;
      if (!email) return;

      const existing = purchasesByEmail.get(email);
      if (existing) {
        existing.count += 1;
        existing.total += parseFloat(purchase.order_total) || 0;
        if (new Date(purchase.order_date) > new Date(existing.latest)) {
          existing.latest = purchase.order_date;
        }
      } else {
        purchasesByEmail.set(email, {
          count: 1,
          total: parseFloat(purchase.order_total) || 0,
          latest: purchase.order_date,
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

    // Convert to array and filter by search
    let users = Array.from(usersMap.values());

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.category?.toLowerCase().includes(searchLower)
      );
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

    return NextResponse.json({
      users,
      total: users.length,
      stats: {
        withQuiz: users.filter(u => u.quizDate).length,
        withoutQuiz: users.filter(u => !u.quizDate).length,
        withPurchases: users.filter(u => u.purchasesCount > 0).length,
        pendingPayments: users.filter(u => u.paymentStatus === 'pending').length,
        withCapsules: users.filter(u => (u.capsulesRemaining || 0) > 0).length,
        activeThisWeek: users.filter(u =>
          (u.workoutCount || 0) > 0 ||
          (u.mealCount || 0) > 0 ||
          (u.sleepCount || 0) > 0 ||
          (u.testoupCount || 0) > 0
        ).length,
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
