/**
 * AI Coach Chat API Route
 *
 * POST /api/coach/chat
 * Handles chat messages with streaming response
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/validate-session'
import { createServiceClient } from '@/lib/supabase/server'
import {
  buildSystemPrompt,
  streamCoachResponse,
  checkRateLimit,
  UserContext,
  ChatMessage,
  getProgramContext,
  TodayTasksStatus,
} from '@/lib/openrouter/coach-client'

export async function POST(request: NextRequest) {
  console.log('Coach chat API called')
  try {
    // 1. Validate session
    console.log('Validating session...')
    const { isValid, email, error: authError } = await validateSession()
    if (!isValid || !email) {
      console.log('Session validation failed')
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('Session valid for:', email)

    // 2. Check rate limit
    const rateLimit = checkRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Tvarde mnogo zayavki. Molya, izchakay malko.',
          resetIn: Math.ceil(rateLimit.resetIn / 1000),
        },
        { status: 429 }
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const { message } = body as { message: string }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Saobshtenieto ne mozhe da bade prazno' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    console.log('Supabase client created')

    // 4. Fetch user context (parallel for performance)
    console.log('Fetching user context and chat history...')
    const [userContext, chatHistory] = await Promise.all([
      fetchUserContext(email, supabase),
      fetchChatHistory(email, supabase, 10),
    ])
    console.log('User context fetched:', userContext.firstName, 'Day', userContext.programDay)

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(userContext)

    // 6. Save user message to database
    console.log('Saving user message to database...')
    const { error: insertError } = await (supabase.from('coach_messages') as any).insert({
      email,
      role: 'user',
      content: message,
    })
    if (insertError) {
      console.error('Failed to save user message:', insertError)
    } else {
      console.log('User message saved')
    }

    // 7. Prepare messages for AI
    const aiMessages: ChatMessage[] = [
      ...chatHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // 8. Stream response from OpenRouter
    console.log('Calling OpenRouter API...')
    const openRouterStream = await streamCoachResponse(aiMessages, systemPrompt)
    console.log('OpenRouter stream received')

    // 9. Create transform stream to capture full response and save to DB
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let fullResponse = ''

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Save complete response to database
              if (fullResponse) {
                await (supabase.from('coach_messages') as any).insert({
                  email,
                  role: 'assistant',
                  content: fullResponse,
                  model_used: 'google/gemini-2.0-flash-exp:free',
                })
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              continue
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                )
              }
            } catch {
              // Ignore parse errors (comments, etc.)
            }
          }
        }
      },
    })

    // Pipe the OpenRouter stream through our transform
    const responseStream = openRouterStream.pipeThrough(transformStream)

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Coach chat error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Vaznikna greshka. Molya, opitay otnovo.' },
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

  // Calculate program day
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

/**
 * Fetch recent chat history
 */
async function fetchChatHistory(
  email: string,
  supabase: ReturnType<typeof createServiceClient>,
  limit: number
): Promise<{ role: string; content: string }[]> {
  const { data } = await (supabase.from('coach_messages') as any)
    .select('role, content')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Reverse to get chronological order
  return (data || []).reverse()
}
