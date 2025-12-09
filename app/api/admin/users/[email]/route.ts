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
      // NEW: Additional data for enhanced user profile
      emailLogsRes,
      progressPhotosRes,
      bodyMeasurementsRes,
      adminNotesRes,
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
        .select('capsules_remaining, bottles_purchased, last_purchase_date')
        .eq('email', email)
        .single(),

      // Workout sessions (last 90 days) - use * to avoid column errors
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // Meal completions (last 90 days)
      supabase
        .from('meal_completions')
        .select('*')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // Sleep tracking (last 90 days)
      supabase
        .from('sleep_tracking')
        .select('*')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // TestoUP tracking (last 90 days)
      supabase
        .from('testoup_tracking')
        .select('*')
        .eq('email', email)
        .gte('date', ninetyDaysAgoStr)
        .order('date', { ascending: false }),

      // Pending orders (for funnel tracking)
      supabase
        .from('pending_orders')
        .select('id, order_id, order_number, status, total_price, currency, created_at, paid_at, products, customer_name, shipping_address, phone')
        .eq('email', email)
        .order('created_at', { ascending: false }),

      // NEW: Email logs (all emails sent to this user)
      supabase
        .from('email_logs')
        .select('id, subject, status, sent_at, template_name, metadata')
        .eq('recipient_email', email)
        .order('sent_at', { ascending: false })
        .limit(50),

      // NEW: Progress photos
      supabase
        .from('progress_photos')
        .select('id, photo_url, photo_type, notes, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false }),

      // NEW: Body measurements (all time for trend)
      supabase
        .from('body_measurements')
        .select('id, weight, waist, chest, arms, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false }),

      // NEW: Admin notes for this user
      supabase
        .from('admin_user_notes')
        .select('id, note, admin_email, created_at')
        .eq('user_email', email)
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

    // NEW: Extract additional data
    const emailLogs = emailLogsRes.data || [];
    const progressPhotos = progressPhotosRes.data || [];
    const bodyMeasurements = bodyMeasurementsRes.data || [];
    const adminNotes = adminNotesRes.data || [];

    // Extract contact info from pending orders or purchases (get most complete info)
    let contactInfo: any = null;
    const orderWithContact = pendingOrders.find((o: any) =>
      o.phone || o.shipping_address || o.customer_name
    );
    if (orderWithContact) {
      contactInfo = {
        phone: orderWithContact.phone || null,
        customerName: orderWithContact.customer_name || null,
        shippingAddress: orderWithContact.shipping_address || null,
      };
    }

    // Calculate streak/consistency data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get unique active days for each tracking type
    const workoutDays = new Set(workoutSessions.filter((w: any) => w.finished_at).map((w: any) => w.date?.split('T')[0]));
    const mealDays = new Set(mealCompletions.map((m: any) => m.date?.split('T')[0]));
    const sleepDays = new Set(sleepTracking.map((s: any) => s.date?.split('T')[0]));
    const testoupDays = new Set(testoupTracking.filter((t: any) => t.morning_taken || t.evening_taken).map((t: any) => t.date?.split('T')[0]));

    // Calculate current streak (consecutive days with any activity)
    const allActivityDays = new Set([
      ...Array.from(workoutDays),
      ...Array.from(mealDays),
      ...Array.from(sleepDays),
      ...Array.from(testoupDays),
    ]);

    // Sort days descending to calculate current streak
    const sortedDays = Array.from(allActivityDays)
      .filter(Boolean)
      .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime());

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDays.length > 0) {
      // Check if last activity was today or yesterday
      if (sortedDays[0] === today || sortedDays[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const prevDay = new Date(sortedDays[i - 1] as string);
          const currDay = new Date(sortedDays[i] as string);
          const diffDays = (prevDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    const streakData = {
      currentStreak,
      activeDaysLast30: allActivityDays.size,
      workoutDaysLast30: workoutDays.size,
      mealDaysLast30: mealDays.size,
      sleepDaysLast30: sleepDays.size,
      testoupDaysLast30: testoupDays.size,
      consistencyPercentage: Math.round((allActivityDays.size / 30) * 100),
    };

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
      // Pending orders (placed but not paid) - filter to only show actually pending orders
      pendingOrders: pendingOrders
        .filter((o: any) => o.status === 'pending')
        .map((o: any) => ({
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

    // Calculate total capsules from purchase history (always accurate)
    const totalCapsulesFromPurchases = purchasesData?.reduce((sum, p) => sum + (p.capsules_added || 0), 0) || 0;

    // Process inventory - use purchase history as fallback if inventory is missing/empty
    let inventory: any = null;
    if (inventoryData && inventoryData.capsules_remaining !== null) {
      inventory = {
        capsulesRemaining: inventoryData.capsules_remaining,
        totalBottles: inventoryData.bottles_purchased,
        lastPurchaseDate: inventoryData.last_purchase_date,
      };
    } else if (totalCapsulesFromPurchases > 0) {
      // Fallback: if no inventory record but has purchases, show purchased capsules
      inventory = {
        capsulesRemaining: totalCapsulesFromPurchases,
        totalBottles: purchasesData?.reduce((sum, p) => sum + (p.bottles_purchased || 0), 0) || 0,
        lastPurchaseDate: purchasesData?.[0]?.order_date || null,
        isEstimated: true, // Flag to indicate this is from purchases, not actual inventory
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
      // Fetch profile data from app_users table instead of profiles
      const { data: profileData } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .single();

      if (profileData) {
        profile = {
          name: profileData.name || profileData.first_name,
          avatar: profileData.avatar_url,
        };
      }

      // Fetch ban info from admin_audit_logs table
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
    workoutSessions.forEach((workout: any) => {
      if (workout.finished_at) {
        timeline.push({
          id: workout.id,
          type: 'workout',
          timestamp: workout.finished_at,
          data: {
            workout_name: workout.workout_name,
            duration_minutes: workout.actual_duration_minutes,
            exercises_completed: workout.exercises_completed,
          },
        });
      }
    });

    // Add meals to timeline
    mealCompletions.forEach((meal: any) => {
      timeline.push({
        id: meal.id,
        type: 'meal',
        timestamp: meal.completed_at,
        data: {
          meal_number: meal.meal_number,
          date: meal.date,
        },
      });
    });

    // Add sleep logs to timeline
    sleepTracking.forEach((sleep: any) => {
      timeline.push({
        id: sleep.id,
        type: 'sleep',
        timestamp: sleep.date,
        data: {
          hours_slept: sleep.hours_slept,
          quality_rating: sleep.quality_rating,
          feeling: sleep.feeling,
        },
      });
    });

    // Add TestoUp tracking to timeline
    testoupTracking.forEach((testoup: any) => {
      if (testoup.morning_taken || testoup.evening_taken) {
        timeline.push({
          id: testoup.id,
          type: 'testoup',
          timestamp: testoup.date,
          data: {
            morning_taken: testoup.morning_taken,
            evening_taken: testoup.evening_taken,
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
      // NEW: Contact info from Shopify
      contactInfo,
      // NEW: Email history
      emailHistory: emailLogs.map((log: any) => ({
        id: log.id,
        subject: log.subject,
        status: log.status,
        sentAt: log.sent_at,
        templateName: log.template_name,
        metadata: log.metadata,
      })),
      // NEW: Progress photos
      progressPhotos: progressPhotos.map((photo: any) => ({
        id: photo.id,
        url: photo.photo_url,
        type: photo.photo_type,
        notes: photo.notes,
        createdAt: photo.created_at,
      })),
      // NEW: Body measurements
      bodyMeasurements: bodyMeasurements.map((m: any) => ({
        id: m.id,
        weight: m.weight,
        waist: m.waist,
        chest: m.chest,
        arms: m.arms,
        createdAt: m.created_at,
      })),
      // NEW: Admin notes
      adminNotes: adminNotes.map((note: any) => ({
        id: note.id,
        note: note.note,
        adminEmail: note.admin_email,
        createdAt: note.created_at,
      })),
      // NEW: Streak/consistency data
      streakData,
    });
  } catch (error: any) {
    console.error('Error fetching user timeline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user timeline' },
      { status: 500 }
    );
  }
}
