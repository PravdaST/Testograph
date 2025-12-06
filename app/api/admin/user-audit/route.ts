import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/user-audit
 * Returns comprehensive user audit data for a given email
 *
 * Query params:
 * - email: User's email address (required)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const emailLower = email.toLowerCase()

    // Parallel fetch all user data
    const [
      quizResultsRes,
      ordersRes,
      authUsersRes,
      dailyCompletionRes,
      testoUpInventoryRes,
    ] = await Promise.all([
      // Quiz results
      supabase
        .from('quiz_results_v2')
        .select('*')
        .ilike('email', emailLower)
        .order('created_at', { ascending: false })
        .limit(1),

      // Orders from Shopify
      supabase
        .from('pending_orders')
        .select('*')
        .ilike('email', emailLower)
        .order('created_at', { ascending: false }),

      // App user data from auth.users (not the empty 'users' table!)
      supabase.auth.admin.listUsers(),

      // Daily completion data (last 30 days)
      supabase
        .from('user_daily_completion')
        .select('*')
        .ilike('email', emailLower)
        .order('date', { ascending: false })
        .limit(30),

      // TestoUp inventory
      supabase
        .from('testoup_inventory')
        .select('*')
        .ilike('email', emailLower)
        .limit(1),
    ])

    // Extract data
    const quizResult = quizResultsRes.data?.[0] || null
    const orders = ordersRes.data || []
    // Find auth user by email (case-insensitive)
    const authUser = authUsersRes.data?.users?.find(
      u => u.email?.toLowerCase() === emailLower
    ) || null
    const dailyCompletion = dailyCompletionRes.data || []
    const testoUpInventory = testoUpInventoryRes.data?.[0] || null

    // Calculate stats
    const paidOrders = orders.filter(o => o.status === 'paid')
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0)
    const totalCapsules = orders.reduce((sum, o) => {
      const products = o.products || []
      return sum + products.reduce((pSum: number, p: any) => pSum + (p.totalCapsules || 0), 0)
    }, 0)

    // App usage stats
    const completedDays = dailyCompletion.filter(d =>
      d.workout_completed || d.nutrition_completed || d.sleep_completed || d.testoup_completed
    ).length
    const avgComplianceRate = dailyCompletion.length > 0
      ? Math.round(dailyCompletion.reduce((sum, d) => {
          const completed = [d.workout_completed, d.nutrition_completed, d.sleep_completed, d.testoup_completed].filter(Boolean).length
          return sum + (completed / 4) * 100
        }, 0) / dailyCompletion.length)
      : 0

    // Build response
    const auditData = {
      email: emailLower,

      // Quiz Data
      quiz: quizResult ? {
        completed: true,
        completedAt: quizResult.created_at,
        category: quizResult.category,
        totalScore: quizResult.total_score,
        level: quizResult.determined_level,
        workoutLocation: quizResult.workout_location,
        firstName: quizResult.first_name,
        breakdown: {
          symptoms: quizResult.breakdown_symptoms,
          nutrition: quizResult.breakdown_nutrition,
          training: quizResult.breakdown_training,
          sleepRecovery: quizResult.breakdown_sleep_recovery,
          context: quizResult.breakdown_context,
        }
      } : {
        completed: false,
        completedAt: null,
        category: null,
        totalScore: null,
        level: null,
      },

      // Orders Data
      orders: {
        total: orders.length,
        paid: paidOrders.length,
        pending: orders.length - paidOrders.length,
        totalSpent,
        totalCapsules,
        list: orders.map(o => ({
          orderNumber: o.order_number,
          status: o.status,
          totalPrice: o.total_price,
          currency: o.currency,
          products: (o.products || []).map((p: any) => ({
            title: p.title,
            quantity: p.quantity,
            capsules: p.totalCapsules || 0
          })),
          createdAt: o.created_at,
          paidAt: o.paid_at,
        }))
      },

      // App Access Data (from auth.users)
      appAccess: authUser ? {
        isRegistered: true,
        registeredAt: authUser.created_at,
        // Quiz data synced to auth.users
        quizCategory: authUser.user_metadata?.quiz_category || null,
        quizLevel: authUser.user_metadata?.quiz_level || null,
        quizScore: authUser.user_metadata?.quiz_score || null,
        workoutLocation: authUser.user_metadata?.workout_location || null,
        lastUpdated: authUser.updated_at,
        // Additional auth user info
        emailConfirmed: !!authUser.email_confirmed_at,
        lastSignIn: authUser.last_sign_in_at,
      } : {
        isRegistered: false,
        registeredAt: null,
        quizCategory: null,
        quizLevel: null,
        quizScore: null,
        workoutLocation: null,
      },

      // App Usage Stats
      appUsage: {
        daysTracked: dailyCompletion.length,
        daysWithActivity: completedDays,
        avgComplianceRate,
        recentActivity: dailyCompletion.slice(0, 7).map(d => ({
          date: d.date,
          workout: d.workout_completed,
          nutrition: d.nutrition_completed,
          sleep: d.sleep_completed,
          testoup: d.testoup_completed,
        }))
      },

      // TestoUp Inventory
      inventory: testoUpInventory ? {
        capsulesRemaining: testoUpInventory.capsules_remaining,
        daysSupply: Math.floor((testoUpInventory.capsules_remaining || 0) / 2),
        lastUpdated: testoUpInventory.updated_at,
      } : {
        capsulesRemaining: 0,
        daysSupply: 0,
        lastUpdated: null,
      },

      // Summary Status
      status: {
        hasQuiz: !!quizResult,
        hasOrder: orders.length > 0,
        hasPaidOrder: paidOrders.length > 0,
        isAppUser: !!authUser,
        isActive: completedDays > 0,
        // Journey stage
        stage: !quizResult ? 'no_quiz' :
               orders.length === 0 ? 'quiz_no_order' :
               paidOrders.length === 0 ? 'order_pending' :
               !authUser ? 'paid_no_app' :
               completedDays === 0 ? 'app_no_activity' :
               'active_user'
      }
    }

    return NextResponse.json(auditData)

  } catch (error: any) {
    console.error('[User Audit API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user audit data' },
      { status: 500 }
    )
  }
}
