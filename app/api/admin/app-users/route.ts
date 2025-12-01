import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface AppUserData {
  id: string;
  email: string;
  name: string | null;
  // Shopify Order info (from pending_orders - source of truth)
  shopifyOrderId: string | null;
  orderTotal: number | null;
  orderDate: string | null;
  paymentStatus: 'paid' | 'pending' | 'cancelled' | null;
  productType: string | null;
  orderedBottles: number;
  orderedCapsules: number;
  estimatedPrice: boolean; // true if orderTotal is estimated (not from Shopify)
  // Quiz info
  quizCompletedAt: string | null;
  quizCategory: string | null;
  quizScore: number | null;
  quizLevel: string | null;
  quizWorkoutLocation: string | null;
  // App registration
  isRegistered: boolean;
  registeredAt: string | null;
  hasActiveSubscription: boolean;
  subscriptionExpiresAt: string | null;
  currentDay: number | null;
  dietaryPreference: string | null;
  // Inventory & Access
  capsulesRemaining: number;
  totalCapsules: number;
  bottlesPurchased: number;
  lastPurchaseDate: string | null;
  hasAccess: boolean; // Quiz completed + capsules > 0
  accessStatus: 'full_access' | 'no_capsules' | 'no_quiz' | 'pending_payment' | 'none';
  // Engagement metrics (only for registered users)
  workoutsCount: number;
  mealsCount: number;
  sleepCount: number;
  testoUpDays: number;
  testoUpCompliance: number;
  coachMessages: number;
  measurementsCount: number;
  photosCount: number;
  // Activity
  lastWorkout: string | null;
  lastMeal: string | null;
  lastSleep: string | null;
  lastActivity: string | null;
}

/**
 * GET /api/admin/app-users
 *
 * UNIFIED Operations Management API - fetches ALL users from:
 * 1. Shopify Orders (pending_orders) - all paid + pending orders
 * 2. Quiz completions (quiz_results_v2) - potential app users
 * 3. Inventory (testoup_inventory) - capsule balance
 *
 * This provides a complete view of all customers for easy operations management.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'orderDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const filter = searchParams.get('filter') || 'all'; // all, paid, pending, needs_quiz, needs_activation, active

    // Step 1: Get ALL Shopify orders from BOTH tables
    // pending_orders has pending + some paid orders (but may lack order_total)
    // testoup_purchase_history has all PAID orders with correct amounts
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('pending_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (pendingError) throw pendingError;

    const { data: paidPurchases, error: paidError } = await supabase
      .from('testoup_purchase_history')
      .select('*')
      .order('order_date', { ascending: false });

    if (paidError) throw paidError;

    // Step 2: Get ALL quiz completions
    const { data: allQuizResults, error: quizError } = await supabase
      .from('quiz_results_v2')
      .select('*')
      .order('created_at', { ascending: false });

    if (quizError) throw quizError;

    // Step 3: Get ALL inventory records
    const { data: allInventory, error: inventoryError } = await supabase
      .from('testoup_inventory')
      .select('*');

    if (inventoryError) throw inventoryError;

    // Build orders map from BOTH tables
    // Priority: testoup_purchase_history (PAID with amounts) > pending_orders (PENDING)
    const ordersByEmail = new Map<string, any>();

    // First, add PAID purchases from testoup_purchase_history (has correct amounts)
    paidPurchases?.forEach(p => {
      if (p.email) {
        const existing = ordersByEmail.get(p.email);
        if (!existing || new Date(p.order_date) > new Date(existing.orderDate)) {
          ordersByEmail.set(p.email, {
            id: p.id,
            email: p.email,
            customer_name: null, // Not stored in this table
            shopify_order_id: p.order_id,
            order_total: p.order_total,
            created_at: p.order_date,
            status: 'paid',
            product_type: p.product_type,
            bottles_purchased: p.bottles_purchased,
            capsules_to_add: p.capsules_added,
          });
        }
      }
    });

    // Then, add PENDING orders from pending_orders (only if not already paid)
    // Calculate average order value for estimating pending order amounts
    const avgOrderValue = paidPurchases && paidPurchases.length > 0
      ? paidPurchases.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) / paidPurchases.length
      : 82; // Default fallback ~82 BGN

    pendingOrders?.forEach(o => {
      if (o.email && o.status === 'pending') {
        // Only add if no paid order exists for this email
        if (!ordersByEmail.has(o.email)) {
          // Use total_price (the actual column name in pending_orders table)
          const orderPrice = parseFloat(o.total_price) || 0;
          const estimatedTotal = orderPrice > 0 ? orderPrice : Math.round(avgOrderValue);
          ordersByEmail.set(o.email, {
            ...o,
            order_total: estimatedTotal,
            estimated_price: orderPrice === 0, // Only flag as estimated if no price
          });
        }
      }
    });

    // Get unique emails from quiz results (most recent quiz per email)
    const quizByEmail = new Map<string, any>();
    allQuizResults?.forEach(q => {
      if (!quizByEmail.has(q.email) || new Date(q.created_at) > new Date(quizByEmail.get(q.email).created_at)) {
        quizByEmail.set(q.email, q);
      }
    });

    // Get inventory by email
    const inventoryByEmail = new Map(allInventory?.map(i => [i.email, i]) || []);

    // Merge all unique emails from ALL THREE sources (orders + quiz + inventory)
    const allEmailsSet = new Set<string>([
      ...ordersByEmail.keys(),
      ...quizByEmail.keys(),
      ...inventoryByEmail.keys()
    ]);
    const allEmails = Array.from(allEmailsSet);

    if (allEmails.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        stats: {
          totalUsers: 0,
          // Order stats
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          pendingRevenue: 0,
          // Quiz & Access stats
          totalQuizUsers: 0,
          registeredUsers: 0,
          activeSubscriptions: 0,
          registrationRate: 0,
          usersWithCapsules: 0,
          usersWithAccess: 0,
          usersNoCapsules: 0,
          usersNoQuiz: 0,
          needsActivation: 0,
          totalCapsulesInSystem: 0,
          // Engagement stats
          avgWorkouts: 0,
          avgTestoUpCompliance: 0,
        }
      });
    }

    // Step 4: Get registered users from users table
    const { data: registeredUsers } = await supabase
      .from('users')
      .select('*')
      .in('email', allEmails);

    const usersByEmail = new Map(registeredUsers?.map(u => [u.email, u]) || []);

    // Step 5: Batch fetch engagement data for registered users
    const registeredEmails = registeredUsers?.map(u => u.email) || [];

    const [
      { data: workouts },
      { data: meals },
      { data: sleep },
      { data: testoUp },
      { data: coachMessages },
      { data: measurements },
      { data: photos }
    ] = await Promise.all([
      registeredEmails.length > 0 ? supabase.from('workout_sessions').select('email, date').in('email', registeredEmails) : { data: [] },
      registeredEmails.length > 0 ? supabase.from('meal_completions').select('email, date').in('email', registeredEmails) : { data: [] },
      registeredEmails.length > 0 ? supabase.from('sleep_tracking').select('email, date').in('email', registeredEmails) : { data: [] },
      registeredEmails.length > 0 ? supabase.from('testoup_tracking').select('email, date, morning_taken, evening_taken').in('email', registeredEmails) : { data: [] },
      registeredEmails.length > 0 ? supabase.from('coach_messages').select('email, created_at').in('email', registeredEmails) : { data: [] },
      registeredEmails.length > 0 ? supabase.from('body_measurements').select('email, date').in('email', registeredEmails) : { data: [] },
      registeredEmails.length > 0 ? supabase.from('progress_photos').select('email, date').in('email', registeredEmails) : { data: [] }
    ]);

    // Create lookup maps for engagement data
    const workoutsByEmail = new Map<string, any[]>();
    const mealsByEmail = new Map<string, any[]>();
    const sleepByEmail = new Map<string, any[]>();
    const testoUpByEmail = new Map<string, any[]>();
    const coachByEmail = new Map<string, any[]>();
    const measurementsByEmail = new Map<string, any[]>();
    const photosByEmail = new Map<string, any[]>();

    workouts?.forEach(w => {
      if (!workoutsByEmail.has(w.email)) workoutsByEmail.set(w.email, []);
      workoutsByEmail.get(w.email)!.push(w);
    });

    meals?.forEach(m => {
      if (!mealsByEmail.has(m.email)) mealsByEmail.set(m.email, []);
      mealsByEmail.get(m.email)!.push(m);
    });

    sleep?.forEach(s => {
      if (!sleepByEmail.has(s.email)) sleepByEmail.set(s.email, []);
      sleepByEmail.get(s.email)!.push(s);
    });

    testoUp?.forEach(t => {
      if (!testoUpByEmail.has(t.email)) testoUpByEmail.set(t.email, []);
      testoUpByEmail.get(t.email)!.push(t);
    });

    coachMessages?.forEach(c => {
      if (!coachByEmail.has(c.email)) coachByEmail.set(c.email, []);
      coachByEmail.get(c.email)!.push(c);
    });

    measurements?.forEach(m => {
      if (!measurementsByEmail.has(m.email)) measurementsByEmail.set(m.email, []);
      measurementsByEmail.get(m.email)!.push(m);
    });

    photos?.forEach(p => {
      if (!photosByEmail.has(p.email)) photosByEmail.set(p.email, []);
      photosByEmail.get(p.email)!.push(p);
    });

    // Build enriched user data - starting from ALL emails (orders + quiz + inventory)
    const enrichedUsers: AppUserData[] = allEmails.map((email, index) => {
      const order = ordersByEmail.get(email);
      const quiz = quizByEmail.get(email);
      const user = usersByEmail.get(email);
      const inventory = inventoryByEmail.get(email);
      const isRegistered = !!user;

      // Order data
      const isPaid = order?.status === 'paid';
      const isPending = order?.status === 'pending';

      // Inventory data
      const capsulesRemaining = inventory?.capsules_remaining || 0;
      const totalCapsules = inventory?.total_capsules || 0;
      const bottlesPurchased = inventory?.bottles_purchased || 0;
      const lastPurchaseDate = inventory?.last_purchase_date || inventory?.last_refill_date || null;

      // Calculate access status (now includes pending_payment)
      const hasQuiz = !!quiz;
      const hasCapsules = capsulesRemaining > 0;
      const hasAccess = hasQuiz && hasCapsules;

      let accessStatus: 'full_access' | 'no_capsules' | 'no_quiz' | 'pending_payment' | 'none' = 'none';
      if (isPending) {
        accessStatus = 'pending_payment';
      } else if (hasQuiz && hasCapsules) {
        accessStatus = 'full_access';
      } else if (hasQuiz && !hasCapsules) {
        accessStatus = 'no_capsules';
      } else if (!hasQuiz && (hasCapsules || isPaid)) {
        accessStatus = 'no_quiz';
      }

      // Engagement data (only for registered users)
      const userWorkouts = workoutsByEmail.get(email) || [];
      const userMeals = mealsByEmail.get(email) || [];
      const userSleep = sleepByEmail.get(email) || [];
      const userTestoUp = testoUpByEmail.get(email) || [];
      const userCoach = coachByEmail.get(email) || [];
      const userMeasurements = measurementsByEmail.get(email) || [];
      const userPhotos = photosByEmail.get(email) || [];

      // Calculate TestoUP compliance
      let testoUpCompliance = 0;
      if (userTestoUp.length > 0) {
        const totalDoses = userTestoUp.reduce((sum, t) => {
          return sum + (t.morning_taken ? 1 : 0) + (t.evening_taken ? 1 : 0);
        }, 0);
        testoUpCompliance = Math.round((totalDoses / (userTestoUp.length * 2)) * 100);
      }

      // Find last activity dates
      const lastWorkout = userWorkouts.length > 0
        ? userWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
        : null;
      const lastMeal = userMeals.length > 0
        ? userMeals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
        : null;
      const lastSleep = userSleep.length > 0
        ? userSleep.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
        : null;

      // Overall last activity (include quiz date or inventory date for non-registered users)
      const activities = [lastWorkout, lastMeal, lastSleep].filter(Boolean) as string[];
      let lastActivity = activities.length > 0
        ? activities.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : null;

      // For non-registered users, use quiz date or inventory date as last activity
      if (!lastActivity) {
        if (quiz?.created_at) {
          lastActivity = quiz.created_at;
        } else if (inventory?.last_purchase_date || inventory?.created_at) {
          lastActivity = inventory.last_purchase_date || inventory.created_at;
        }
      }

      return {
        id: user?.id || order?.id || `user-${index}`,
        email: email,
        name: user?.name || order?.customer_name || quiz?.first_name || null,
        // Shopify Order info
        shopifyOrderId: order?.shopify_order_id || null,
        orderTotal: order ? parseFloat(order.order_total) || 0 : null,
        orderDate: order?.created_at || null,
        paymentStatus: order?.status || null,
        productType: order?.product_type || null,
        orderedBottles: order?.bottles_purchased || 0,
        estimatedPrice: order?.estimated_price || false,
        orderedCapsules: order?.capsules_to_add || 0,
        // Quiz info
        quizCompletedAt: quiz?.created_at || null,
        quizCategory: quiz?.category || null,
        quizScore: quiz?.total_score || null,
        quizLevel: quiz?.determined_level || null,
        quizWorkoutLocation: quiz?.workout_location || null,
        // App registration
        isRegistered,
        registeredAt: user?.created_at || null,
        hasActiveSubscription: user?.has_active_subscription || false,
        subscriptionExpiresAt: user?.subscription_expires_at || null,
        currentDay: user?.current_day || null,
        dietaryPreference: user?.dietary_preference || null,
        // Inventory & Access
        capsulesRemaining,
        totalCapsules,
        bottlesPurchased,
        lastPurchaseDate,
        hasAccess,
        accessStatus,
        // Engagement
        workoutsCount: userWorkouts.length,
        mealsCount: userMeals.length,
        sleepCount: userSleep.length,
        testoUpDays: userTestoUp.length,
        testoUpCompliance,
        coachMessages: userCoach.length,
        measurementsCount: userMeasurements.length,
        photosCount: userPhotos.length,
        // Activity
        lastWorkout,
        lastMeal,
        lastSleep,
        lastActivity,
      };
    });

    // Sort based on sortBy parameter
    const sortedUsers = [...enrichedUsers].sort((a, b) => {
      let aVal: any = a[sortBy as keyof AppUserData];
      let bVal: any = b[sortBy as keyof AppUserData];

      // Handle nulls
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // Handle dates
      if (sortBy === 'registeredAt' || sortBy === 'lastActivity' || sortBy === 'orderDate' || sortBy === 'quizCompletedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply status filter
    let statusFilteredUsers = sortedUsers;
    if (filter === 'paid') {
      statusFilteredUsers = sortedUsers.filter(u => u.paymentStatus === 'paid');
    } else if (filter === 'pending') {
      statusFilteredUsers = sortedUsers.filter(u => u.paymentStatus === 'pending');
    } else if (filter === 'needs_quiz') {
      statusFilteredUsers = sortedUsers.filter(u => u.paymentStatus === 'paid' && !u.quizCompletedAt);
    } else if (filter === 'needs_activation') {
      statusFilteredUsers = sortedUsers.filter(u => u.paymentStatus === 'paid' && !u.hasAccess);
    } else if (filter === 'active') {
      statusFilteredUsers = sortedUsers.filter(u => u.accessStatus === 'full_access');
    }

    // Apply search filter if provided
    const filteredUsers = search
      ? statusFilteredUsers.filter(u =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.shopifyOrderId?.toLowerCase().includes(search.toLowerCase())
        )
      : statusFilteredUsers;

    // Calculate overall stats (on ALL users, not filtered)
    const totalWorkouts = enrichedUsers.reduce((sum, u) => sum + u.workoutsCount, 0);
    const totalTestoUpCompliance = enrichedUsers.filter(u => u.testoUpDays > 0);
    const avgTestoUpCompliance = totalTestoUpCompliance.length > 0
      ? Math.round(totalTestoUpCompliance.reduce((sum, u) => sum + u.testoUpCompliance, 0) / totalTestoUpCompliance.length)
      : 0;

    // Calculate stats
    const registeredCount = enrichedUsers.filter(u => u.isRegistered).length;
    const activeSubsCount = enrichedUsers.filter(u => u.hasActiveSubscription).length;
    const registrationRate = enrichedUsers.length > 0
      ? Math.round((registeredCount / enrichedUsers.length) * 100)
      : 0;

    // Order stats - use raw data from tables for accurate counts
    const paidOrdersCount = paidPurchases?.length || 0;
    const pendingOrdersCount = pendingOrders?.filter(o => o.status === 'pending').length || 0;

    // Calculate revenue from testoup_purchase_history (accurate source)
    const totalRevenue = paidPurchases?.reduce((sum, p) => sum + (parseFloat(p.order_total) || 0), 0) || 0;

    // Pending revenue - calculate from actual pending order prices
    const pendingRevenue = pendingOrders?.filter(o => o.status === 'pending')
      .reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0) || 0;

    // Inventory stats
    const usersWithCapsules = enrichedUsers.filter(u => u.capsulesRemaining > 0).length;
    const usersWithAccess = enrichedUsers.filter(u => u.hasAccess).length;
    const usersNoCapsules = enrichedUsers.filter(u => u.accessStatus === 'no_capsules').length;
    const usersNoQuiz = enrichedUsers.filter(u => u.accessStatus === 'no_quiz').length;
    const needsActivation = enrichedUsers.filter(u => u.paymentStatus === 'paid' && !u.hasAccess).length;
    const totalQuizUsers = enrichedUsers.filter(u => u.quizCompletedAt !== null).length;
    const totalCapsulesInSystem = enrichedUsers.reduce((sum, u) => sum + u.capsulesRemaining, 0);

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      stats: {
        totalUsers: enrichedUsers.length,
        // Order stats
        totalOrders: paidOrdersCount + pendingOrdersCount,
        paidOrders: paidOrdersCount,
        pendingOrders: pendingOrdersCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingRevenue: Math.round(pendingRevenue * 100) / 100,
        // Quiz & Access stats
        totalQuizUsers,
        registeredUsers: registeredCount,
        activeSubscriptions: activeSubsCount,
        registrationRate,
        // Inventory stats
        usersWithCapsules,
        usersWithAccess,
        usersNoCapsules,
        usersNoQuiz,
        needsActivation,
        totalCapsulesInSystem,
        // Engagement stats
        avgWorkouts: registeredCount > 0 ? Math.round((totalWorkouts / registeredCount) * 10) / 10 : 0,
        avgTestoUpCompliance,
        totalWorkouts,
        totalMeals: enrichedUsers.reduce((sum, u) => sum + u.mealsCount, 0),
        totalSleep: enrichedUsers.reduce((sum, u) => sum + u.sleepCount, 0),
        totalCoachMessages: enrichedUsers.reduce((sum, u) => sum + u.coachMessages, 0),
      }
    });

  } catch (error: any) {
    console.error('Error fetching app users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch app users' },
      { status: 500 }
    );
  }
}
