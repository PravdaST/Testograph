/**
 * AI Coach History API Route
 *
 * GET /api/coach/history
 * Returns chat history and proactive greeting
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/validate-session'
import { createServiceClient } from '@/lib/supabase/server'
import {
  getProactiveGreeting,
  UserContext,
  getProgramContext,
  TodayTasksStatus,
} from '@/lib/openrouter/coach-client'

export interface ChatMessageResponse {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  is_proactive: boolean
}

export async function GET(request: NextRequest) {
  try {
    // 1. Validate session
    const { isValid, email, error: authError } = await validateSession()
    if (!isValid || !email) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // 2. Get limit from query params (default 50)
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // 3. Fetch chat history and user context in parallel
    const [historyResult, userContext] = await Promise.all([
      (supabase.from('coach_messages') as any)
        .select('id, role, content, created_at, is_proactive')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(limit),
      fetchUserContext(email, supabase),
    ])

    // Reverse to get chronological order
    const messages: ChatMessageResponse[] = (historyResult.data || []).reverse()

    // 4. Check if we need to generate proactive greeting
    let proactiveGreeting: string | null = null
    const today = new Date().toISOString().split('T')[0]

    // Check if there are any messages today
    const todayMessages = messages.filter((msg) =>
      msg.created_at.startsWith(today)
    )

    // If no messages today, generate proactive greeting
    if (todayMessages.length === 0) {
      proactiveGreeting = getProactiveGreeting(userContext)

      // Save proactive message to database
      const { data: savedProactive } = await (supabase.from('coach_messages') as any)
        .insert({
          email,
          role: 'assistant',
          content: proactiveGreeting,
          is_proactive: true,
        })
        .select('id, role, content, created_at, is_proactive')
        .single()

      // Add to messages array
      if (savedProactive) {
        messages.push(savedProactive)
      }
    }

    return NextResponse.json({
      messages,
      userContext: {
        firstName: userContext.firstName,
        programDay: userContext.programDay,
        progressScore: userContext.progressScore,
        completedTasks: userContext.completedTasks,
        totalTasks: userContext.totalTasks,
      },
    })
  } catch (error) {
    console.error('Coach history error:', error)
    return NextResponse.json(
      { error: 'Vaznikna greshka pri zarezhdane na istoriyata.' },
      { status: 500 }
    )
  }
}

/**
 * Fetch user context from database
 */
async function fetchUserContext(
  email: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<UserContext> {
  const today = new Date().toISOString().split('T')[0]

  // Parallel queries for performance - including detailed task data
  const [quizResult, todayCompletion, progressScore, inventory, meals, workout, sleep, testoup] =
    await Promise.all([
      (supabase.from('quiz_results_v2') as any)
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      (supabase.from('user_daily_completion') as any)
        .select('*')
        .eq('email', email)
        .eq('date', today)
        .maybeSingle(),
      (supabase.from('daily_progress_scores') as any)
        .select('score')
        .eq('email', email)
        .eq('date', today)
        .maybeSingle(),
      (supabase.from('testoup_inventory') as any)
        .select('capsules_remaining')
        .eq('email', email)
        .maybeSingle(),
      // Detailed task data
      (supabase.from('meal_completions') as any)
        .select('meal_number')
        .eq('email', email)
        .eq('date', today)
        .order('meal_number'),
      (supabase.from('workout_sessions') as any)
        .select('id, workout_name, finished_at, actual_duration_minutes')
        .eq('email', email)
        .eq('date', today)
        .not('finished_at', 'is', null)
        .maybeSingle(),
      (supabase.from('sleep_tracking') as any)
        .select('hours_slept, quality_rating, feeling')
        .eq('email', email)
        .eq('date', today)
        .maybeSingle(),
      (supabase.from('testoup_tracking') as any)
        .select('morning_taken, evening_taken')
        .eq('email', email)
        .eq('date', today)
        .maybeSingle(),
    ])

  const programStart = quizResult.data?.created_at
    ? new Date(quizResult.data.created_at)
    : new Date()
  const programDay =
    Math.floor(
      (Date.now() - programStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

  // Get category and level for program context
  const category = quizResult.data?.category || 'energy'
  const level = quizResult.data?.determined_level || 'normal'
  const workoutLocation = quizResult.data?.workout_location || 'gym'

  // Get full program context (today's meals and workout)
  const programContext = getProgramContext(category, level, workoutLocation)

  // Build detailed task status
  const mealsCompleted = meals.data?.length || 0
  const mealsStatus = mealsCompleted >= 3
  const workoutStatus = !!workout.data
  const sleepStatus = !!sleep.data
  const testoUpStatus = !!(testoup.data?.morning_taken && testoup.data?.evening_taken)

  const todayTasks: TodayTasksStatus = {
    meals: {
      completed: mealsStatus,
      count: mealsCompleted,
      completedMealNumbers: meals.data?.map((m: any) => m.meal_number) || [],
    },
    workout: {
      completed: workoutStatus,
      name: workout.data?.workout_name || null,
      durationMinutes: workout.data?.actual_duration_minutes || null,
    },
    sleep: {
      completed: sleepStatus,
      hours: sleep.data?.hours_slept || null,
      quality: sleep.data?.quality_rating || null,
      feeling: sleep.data?.feeling || null,
    },
    testoup: {
      completed: testoUpStatus,
      morningTaken: testoup.data?.morning_taken || false,
      eveningTaken: testoup.data?.evening_taken || false,
    },
  }

  return {
    firstName: quizResult.data?.first_name || email.split('@')[0],
    email,
    category,
    level,
    programDay: Math.min(programDay, 30),
    progressScore: progressScore.data?.score || 50,
    completedTasks: todayCompletion.data?.completed || 0,
    totalTasks: 4,
    workoutLocation,
    dietaryPreference: quizResult.data?.dietary_preference || 'omnivor',
    capsulesRemaining: inventory.data?.capsules_remaining || 0,
    programContext, // Full program context for AI
    currentHour: new Date().getHours(), // Current hour for time-aware responses
    todayTasks, // Detailed task status for AI
  }
}
