import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Shopify API configuration
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

interface ShopifyLineItem {
  title: string;
  quantity: number;
  sku: string;
  price: string;
}

interface ShopifyOrder {
  id: string;
  order_number: number;
  email: string;
  created_at: string;
  financial_status: string;
  total_price: string;
  currency: string;
  line_items: ShopifyLineItem[];
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
  shipping_address: any | null;
  billing_address: any | null;
  phone: string | null;
}

// Fetch a single order from Shopify by order ID
async function fetchShopifyOrder(orderId: string): Promise<ShopifyOrder | null> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    console.log('Shopify API not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/orders/${orderId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Shopify API error for order ${orderId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error(`Error fetching Shopify order ${orderId}:`, error);
    return null;
  }
}

// Check if product is a trial/sample pack
function isTrialProduct(sku: string, title: string): boolean {
  const skuLower = (sku || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  // Check SKU patterns for trial
  if (skuLower.includes('trial')) return true;
  if (skuLower.includes('s14')) return true; // TUP-S14 is trial
  if (skuLower.includes('7d')) return true;

  // Check title patterns for trial
  if (titleLower.includes('7-дневен')) return true;
  if (titleLower.includes('7 дневен')) return true;
  if (titleLower.includes('проба')) return true;
  if (titleLower.includes('пробен')) return true;

  return false;
}

// Convert Shopify line items to our products format
function convertToProducts(lineItems: ShopifyLineItem[]) {
  return lineItems.map(li => {
    const isTrial = isTrialProduct(li.sku, li.title);
    return {
      title: li.title,
      quantity: li.quantity,
      sku: li.sku,
      price: li.price,
      type: isTrial ? 'trial' : 'full',
      capsules: isTrial ? 10 : 60,
      totalCapsules: (isTrial ? 10 : 60) * li.quantity
    };
  });
}

interface TimelineEvent {
  id: string;
  type: 'chat_session' | 'purchase' | 'coach_message' | 'workout' | 'meal' | 'sleep' | 'testoup';
  timestamp: string;
  data: any;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);

    // Get date range for activity (last 90 days for calendar view)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

    // Fetch all data in parallel for performance
    const [
      chatSessionsRes,
      coachMessagesRes,
      quizResultRes,
      purchasesRes,
      inventoryRes,
      workoutSessionsRes,
      mealCompletionsRes,
      sleepTrackingRes,
      testoupTrackingRes,
      pendingOrdersRes,
    ] = await Promise.all([
      // Chat sessions (legacy)
      supabase
        .from('chat_sessions')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false }),

      // AI Coach messages
      supabase
        .from('coach_messages')
        .select('id, role, content, created_at, is_proactive')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(100),

      // Quiz results
      supabase
        .from('quiz_results_v2')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Purchases
      supabase
        .from('testoup_purchase_history')
        .select('*')
        .eq('email', email)
        .order('order_date', { ascending: false }),

      // Inventory
      supabase
        .from('testoup_inventory')
        .select('*')
        .eq('email', email)
        .single(),

      // Workout sessions (last 90 days)
      supabase
        .from('workout_sessions')
        .select('id, date, workout_name, finished_at, actual_duration_minutes, exercises_completed')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // Meal completions (last 90 days)
      supabase
        .from('meal_completions')
        .select('id, date, meal_number, completed_at')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // Sleep tracking (last 90 days)
      supabase
        .from('sleep_tracking')
        .select('id, date, hours_slept, quality_rating, feeling')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // TestoUP tracking (last 90 days)
      supabase
        .from('testoup_tracking')
        .select('id, date, morning_taken, evening_taken')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // Pending orders (for funnel tracking)
      supabase
        .from('pending_orders')
        .select('id, order_id, order_number, status, total_price, currency, created_at, paid_at, products, customer_name, shipping_address, phone')
        .eq('email', email)
        .order('created_at', { ascending: false }),
    ]);

    const chatSessions = chatSessionsRes.data || [];
    const coachMessages = coachMessagesRes.data || [];
    const quizResult = quizResultRes.data;
    const purchasesData = purchasesRes.data || [];
    const inventoryData = inventoryRes.data;
    const workoutSessions = workoutSessionsRes.data || [];
    const mealCompletions = mealCompletionsRes.data || [];
    const sleepTracking = sleepTrackingRes.data || [];
    const testoupTracking = testoupTrackingRes.data || [];
    let pendingOrders = pendingOrdersRes.data || [];

    // Helper to check if products need re-enrichment (missing title or wrong capsule count)
    const needsReEnrichment = (products: any[]): boolean => {
      if (!products || products.length === 0) return true;
      return products.some((p: any) => {
        // Missing title
        if (!p.title) return true;
        // Trial product with wrong capsule count (should be 10, not 60)
        if (p.title && isTrialProduct(p.sku || '', p.title) && p.capsules === 60) return true;
        return false;
      });
    };

    // Enrich pending orders with Shopify data if products are missing or incomplete
    const ordersNeedingEnrichment = pendingOrders.filter(
      (o: any) => needsReEnrichment(o.products)
    );

    if (ordersNeedingEnrichment.length > 0 && SHOPIFY_STORE_DOMAIN && SHOPIFY_ACCESS_TOKEN) {
      // Fetch missing data from Shopify and update database
      const enrichedOrders = await Promise.all(
        ordersNeedingEnrichment.map(async (dbOrder: any) => {
          const shopifyOrder = await fetchShopifyOrder(dbOrder.order_id);
          if (shopifyOrder && shopifyOrder.line_items) {
            const products = convertToProducts(shopifyOrder.line_items);
            const phone = shopifyOrder.shipping_address?.phone
              || shopifyOrder.billing_address?.phone
              || shopifyOrder.customer?.phone
              || shopifyOrder.phone
              || null;
            const customerName = shopifyOrder.customer
              ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim()
              : null;

            // Update database with enriched data
            await supabase
              .from('pending_orders')
              .update({
                products,
                phone: phone || dbOrder.phone,
                customer_name: customerName || dbOrder.customer_name,
                shipping_address: shopifyOrder.shipping_address || dbOrder.shipping_address,
              })
              .eq('id', dbOrder.id);

            return {
              ...dbOrder,
              products,
              phone: phone || dbOrder.phone,
              customer_name: customerName || dbOrder.customer_name,
              shipping_address: shopifyOrder.shipping_address || dbOrder.shipping_address,
            };
          }
          return dbOrder;
        })
      );

      // Update pendingOrders with enriched data
      pendingOrders = pendingOrders.map((o: any) => {
        const enriched = enrichedOrders.find((e: any) => e.id === o.id);
        return enriched || o;
      });
    }

    // Fetch quiz responses if we have a quiz result
    let quizResponses: any[] = [];
    if (quizResult?.id) {
      const { data: responsesData } = await supabase
        .from('quiz_responses')
        .select('question_id, answer, points')
        .eq('result_id', quizResult.id)
        .order('question_id');
      quizResponses = responsesData || [];
    }

    // Process quiz data
    let quizData = null;
    if (quizResult) {
      quizData = {
        id: quizResult.id,
        category: quizResult.category,
        level: quizResult.determined_level,
        totalScore: quizResult.total_score,
        workoutLocation: quizResult.workout_location,
        dietaryPreference: quizResult.dietary_preference,
        quizDate: quizResult.created_at,
        firstName: quizResult.first_name,
        // Breakdown scores
        breakdown: {
          symptoms: quizResult.breakdown_symptoms,
          nutrition: quizResult.breakdown_nutrition,
          training: quizResult.breakdown_training,
          sleepRecovery: quizResult.breakdown_sleep_recovery,
          context: quizResult.breakdown_context,
        },
        // Individual quiz responses (what user selected)
        responses: quizResponses,
      };
    }

    // Build funnel journey (Quiz → Order → Payment)
    const funnelJourney = {
      // Step 1: Quiz completion
      quizCompleted: !!quizResult,
      quizCompletedAt: quizResult?.created_at || null,
      // Step 2: Order placed (pending_orders or testoup_purchase_history)
      orderPlaced: pendingOrders.length > 0 || purchasesData.length > 0,
      firstOrderAt: pendingOrders[pendingOrders.length - 1]?.created_at ||
                    purchasesData[purchasesData.length - 1]?.order_date || null,
      // Step 3: Payment completed
      paymentCompleted: purchasesData.length > 0,
      firstPaymentAt: purchasesData[purchasesData.length - 1]?.order_date || null,
      // Pending orders (placed but not paid)
      pendingOrders: pendingOrders.map((o: any) => ({
        id: o.id,
        orderId: o.order_id,
        orderNumber: o.order_number,
        status: o.status,
        totalPrice: o.total_price,
        currency: o.currency,
        createdAt: o.created_at,
        paidAt: o.paid_at,
        products: o.products,
        customerName: o.customer_name,
        shippingAddress: o.shipping_address,
        phone: o.phone,
      })),
      // Current status
      currentStep: purchasesData.length > 0 ? 'paid' :
                   pendingOrders.some((o: any) => o.status === 'pending') ? 'pending_payment' :
                   quizResult ? 'quiz_completed' : 'not_started',
    };

    // Get user's auth profile data
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === email);
    let profile: any = null;
    let banInfo: any = null;

    // Process inventory
    let inventory: any = null;
    if (inventoryData) {
      inventory = {
        capsulesRemaining: inventoryData.capsules_remaining,
        totalBottles: inventoryData.bottles_purchased,
        lastPurchaseDate: inventoryData.last_purchase_date,
      };
    }

    // Map purchases to frontend format
    const purchases = purchasesData?.map(p => ({
      id: p.id,
      orderId: p.order_id,
      productName: p.product_type === 'full' ? 'TestoUP (60 капсули)' : 'TestoUP Проба (10 капсули)',
      productType: p.product_type,
      amount: parseFloat(p.order_total) || 0,
      currency: 'BGN',
      status: 'paid', // All entries in testoup_purchase_history are paid
      bottles: p.bottles_purchased,
      capsules: p.capsules_added,
      purchasedAt: p.order_date,
    })) || [];

    if (authUser) {

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profileError && profileData) {
        profile = {
          name: profileData.name,
          avatar: profileData.avatar,
          protocolStartDatePro: profileData.protocol_start_date_pro,
        };
      }

      // Fetch ban info from audit logs
      const { data: banLog, error: banError } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('target_user_id', authUser.id)
        .eq('action_type', 'ban_user')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!banError && banLog) {
        // Check if user is still banned (no unban after this ban)
        const { data: unbanLog } = await supabase
          .from('admin_audit_logs')
          .select('created_at')
          .eq('target_user_id', authUser.id)
          .eq('action_type', 'unban_user')
          .gt('created_at', banLog.created_at)
          .single();

        if (!unbanLog) {
          banInfo = {
            reason: banLog.metadata?.reason || 'No reason provided',
            bannedAt: banLog.created_at,
            bannedBy: banLog.admin_email,
          };
        }
      }
    }

    // Create timeline by merging all events
    const timeline: TimelineEvent[] = [];

    // Add chat sessions
    chatSessions?.forEach((session) => {
      timeline.push({
        id: session.id,
        type: 'chat_session',
        timestamp: session.created_at,
        data: session,
      });
    });

    // Add purchases to timeline
    purchases.forEach((purchase) => {
      timeline.push({
        id: purchase.id,
        type: 'purchase',
        timestamp: purchase.purchasedAt,
        data: purchase,
      });
    });

    // Add workouts to timeline
    workoutSessions.forEach((workout) => {
      if (workout.finished_at) {
        timeline.push({
          id: workout.id,
          type: 'workout',
          timestamp: workout.finished_at,
          data: {
            workout_name: workout.workout_name,
            category: workout.category,
            duration_minutes: workout.duration_minutes,
            exercises_completed: workout.exercises_completed,
            total_exercises: workout.total_exercises,
            calories_burned: workout.calories_burned,
          },
        });
      }
    });

    // Add meals to timeline
    mealCompletions.forEach((meal) => {
      timeline.push({
        id: meal.id,
        type: 'meal',
        timestamp: meal.completed_at,
        data: {
          meal_type: meal.meal_type,
          meal_name: meal.meal_name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
        },
      });
    });

    // Add sleep logs to timeline
    sleepTracking.forEach((sleep) => {
      timeline.push({
        id: sleep.id,
        type: 'sleep',
        timestamp: sleep.created_at,
        data: {
          sleep_duration: sleep.sleep_duration,
          sleep_quality: sleep.sleep_quality,
          bed_time: sleep.bed_time,
          wake_time: sleep.wake_time,
          notes: sleep.notes,
        },
      });
    });

    // Add TestoUp tracking to timeline
    testoupTracking.forEach((testoup) => {
      if (testoup.morning_taken || testoup.evening_taken) {
        timeline.push({
          id: testoup.id,
          type: 'testoup',
          timestamp: testoup.created_at,
          data: {
            morning_taken: testoup.morning_taken,
            evening_taken: testoup.evening_taken,
            morning_time: testoup.morning_time,
            evening_time: testoup.evening_time,
            notes: testoup.notes,
          },
        });
      }
    });

    // Add coach messages to timeline (limit to last 20 for performance)
    coachMessages?.slice(0, 20).forEach((message) => {
      timeline.push({
        id: message.id,
        type: 'coach_message',
        timestamp: message.created_at,
        data: {
          role: message.role,
          content: message.content?.substring(0, 200) + (message.content?.length > 200 ? '...' : ''),
          is_proactive: message.is_proactive,
        },
      });
    });

    // Sort timeline by timestamp (most recent first)
    timeline.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Limit timeline to last 100 events for performance
    const limitedTimeline = timeline.slice(0, 100);

    // Calculate stats
    const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCapsules = purchases.reduce((sum, p) => sum + (p.capsules || 0), 0);

    // Calculate activity stats (last 90 days)
    const completedWorkouts = workoutSessions.filter(w => w.finished_at).length;
    const completedMeals = mealCompletions.length;
    const trackedSleepDays = sleepTracking.length;
    const trackedTestoupDays = testoupTracking.filter(t => t.morning_taken || t.evening_taken).length;

    const stats = {
      totalChatSessions: chatSessions?.length || 0,
      totalCoachMessages: coachMessages?.length || 0,
      totalPurchases: purchases.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalCapsules,
      // Activity stats (last 90 days)
      completedWorkouts,
      completedMeals,
      trackedSleepDays,
      trackedTestoupDays,
    };

    // Determine if user received credentials email
    // User has auth account = received credentials email after quiz completion
    const hasReceivedCredentials = authUser ? true : false;
    const credentialsEmailDate = authUser?.created_at || null;

    // Calculate program day
    let programDay = null;
    if (quizData?.quizDate) {
      const quizDate = new Date(quizData.quizDate);
      const today = new Date();
      programDay = Math.floor((today.getTime() - quizDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    return NextResponse.json({
      email,
      userId: authUser?.id || null,
      userCreatedAt: authUser?.created_at || null,
      emailVerified: authUser?.email_confirmed_at ? true : false,
      hasReceivedCredentials,
      credentialsEmailDate,
      programDay,
      profile: profile,
      banned: banInfo !== null,
      banInfo: banInfo,
      stats,
      timeline: limitedTimeline,
      chatSessions: chatSessions || [],
      purchases: purchases || [],
      inventory: inventory,
      quizData: quizData,
      // Funnel journey (Quiz → Order → Payment)
      funnelJourney: funnelJourney,
      // Coach messages and activity data
      coachMessages: coachMessages || [],
      activity: {
        workouts: workoutSessions,
        meals: mealCompletions,
        sleep: sleepTracking,
        testoup: testoupTracking,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user timeline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user timeline' },
      { status: 500 }
    );
  }
}
