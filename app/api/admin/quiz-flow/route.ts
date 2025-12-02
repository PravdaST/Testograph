import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/quiz-flow
 * Returns quiz flow analytics data for funnel visualization
 *
 * Query params:
 * - category: 'libido' | 'energy' | 'muscle' | 'all' (default: 'all')
 * - days: number of days to look back (default: 7)
 * - view: 'funnel' | 'sessions' | 'dropoffs' | 'stats' | 'session-detail' (default: 'funnel')
 * - session_id: required for session-detail view
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  const days = parseInt(searchParams.get('days') || '7')
  const view = searchParams.get('view') || 'funnel'
  const sessionIdParam = searchParams.get('session_id')

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()

    // ============ STATS VIEW ============
    if (view === 'stats') {
      // Get all events with metadata for comprehensive stats
      let query = supabase
        .from('quiz_step_events')
        .select('session_id, category, step_number, event_type, time_spent_seconds, metadata, created_at')
        .gte('created_at', startDateStr)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data: events, error } = await query

      if (error) throw error

      // Calculate device breakdown from first step_entered events (they have metadata)
      const deviceCounts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0, unknown: 0 }
      const trafficSources: Record<string, number> = {}
      const seenSessions = new Set<string>()

      events?.forEach(event => {
        if (event.event_type === 'step_entered' && event.step_number === 0 && !seenSessions.has(event.session_id)) {
          seenSessions.add(event.session_id)
          const metadata = event.metadata as Record<string, any> || {}

          // Device
          const device = metadata.device || 'unknown'
          deviceCounts[device] = (deviceCounts[device] || 0) + 1

          // Traffic source
          const source = metadata.utm_source || metadata.referrer || 'direct'
          const sourceKey = source.substring(0, 50) // Truncate long referrers
          trafficSources[sourceKey] = (trafficSources[sourceKey] || 0) + 1
        }
      })

      // Calculate average time per step
      const stepTimes: Record<number, number[]> = {}
      events?.forEach(event => {
        if (event.event_type === 'step_exited' && event.time_spent_seconds) {
          if (!stepTimes[event.step_number]) {
            stepTimes[event.step_number] = []
          }
          stepTimes[event.step_number].push(event.time_spent_seconds)
        }
      })

      const avgTimePerStep: Record<number, number> = {}
      Object.entries(stepTimes).forEach(([step, times]) => {
        avgTimePerStep[parseInt(step)] = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      })

      // Count abandoned sessions
      const sessionMaxSteps: Record<string, number> = {}
      events?.forEach(event => {
        if (event.event_type === 'step_entered') {
          if (!sessionMaxSteps[event.session_id] || event.step_number > sessionMaxSteps[event.session_id]) {
            sessionMaxSteps[event.session_id] = event.step_number
          }
        }
      })

      const abandonedSessions = Object.values(sessionMaxSteps).filter(s => s < 24).length
      const completedSessions = Object.values(sessionMaxSteps).filter(s => s >= 24).length

      // Count page_hidden and quiz_abandoned events
      const abandonmentEvents = events?.filter(e =>
        e.event_type === 'quiz_abandoned' || e.event_type === 'page_hidden'
      ).length || 0

      // Sort traffic sources by count
      const sortedTrafficSources = Object.entries(trafficSources)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return NextResponse.json({
        view: 'stats',
        period: { days, startDate: startDateStr },
        category,
        overview: {
          totalSessions: Object.keys(sessionMaxSteps).length,
          completedSessions,
          abandonedSessions,
          completionRate: Object.keys(sessionMaxSteps).length > 0
            ? Math.round((completedSessions / Object.keys(sessionMaxSteps).length) * 100)
            : 0,
          abandonmentEvents,
        },
        deviceBreakdown: deviceCounts,
        trafficSources: sortedTrafficSources,
        avgTimePerStep,
      })
    }

    // ============ SESSION DETAIL VIEW ============
    if (view === 'session-detail') {
      if (!sessionIdParam) {
        return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
      }

      const { data: events, error } = await supabase
        .from('quiz_step_events')
        .select('*')
        .eq('session_id', sessionIdParam)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (!events || events.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      // Extract device info from first event
      const firstEvent = events.find(e => e.event_type === 'step_entered' && e.step_number === 0)
      const deviceInfo = firstEvent?.metadata || {}

      // Build timeline
      const timeline = events.map(event => ({
        timestamp: event.created_at,
        step: event.step_number,
        question_id: event.question_id,
        event_type: event.event_type,
        time_spent: event.time_spent_seconds,
        answer: event.answer_value,
      }))

      // Calculate session stats
      const totalTime = events
        .filter(e => e.time_spent_seconds)
        .reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0)

      const maxStep = Math.max(...events.map(e => e.step_number))
      const completed = maxStep >= 24
      const abandoned = events.some(e => e.event_type === 'quiz_abandoned')

      return NextResponse.json({
        view: 'session-detail',
        session_id: sessionIdParam,
        category: events[0].category,
        started_at: events[0].created_at,
        deviceInfo: {
          device: deviceInfo.device,
          screen: deviceInfo.screen_width ? `${deviceInfo.screen_width}x${deviceInfo.screen_height}` : null,
          referrer: deviceInfo.referrer,
          utm_source: deviceInfo.utm_source,
          utm_medium: deviceInfo.utm_medium,
          utm_campaign: deviceInfo.utm_campaign,
          language: deviceInfo.language,
          timezone: deviceInfo.timezone,
        },
        stats: {
          totalTime,
          maxStep,
          completed,
          abandoned,
          totalEvents: events.length,
          backClicks: events.filter(e => e.event_type === 'back_clicked').length,
          pageHiddenCount: events.filter(e => e.event_type === 'page_hidden').length,
        },
        timeline,
      })
    }

    // ============ FUNNEL VIEW ============
    if (view === 'funnel') {
      let sessionQuery = supabase
        .from('quiz_step_events')
        .select('session_id, step_number, category')
        .eq('event_type', 'step_entered')
        .gte('created_at', startDateStr)

      if (category !== 'all') {
        sessionQuery = sessionQuery.eq('category', category)
      }

      const { data: sessionEvents, error: sessionError } = await sessionQuery

      if (sessionError) throw sessionError

      // Group by category and count sessions per step
      const funnelData: Record<string, { step: number; sessions: number; dropRate: number }[]> = {}
      const categories = category === 'all' ? ['libido', 'energy', 'muscle'] : [category]

      for (const cat of categories) {
        const catEvents = sessionEvents?.filter(e => e.category === cat) || []
        const sessionsByStep: Record<number, Set<string>> = {}

        catEvents.forEach(event => {
          if (!sessionsByStep[event.step_number]) {
            sessionsByStep[event.step_number] = new Set()
          }
          sessionsByStep[event.step_number].add(event.session_id)
        })

        const funnel: { step: number; sessions: number; dropRate: number }[] = []
        let prevCount = 0

        for (let step = 0; step <= 24; step++) {
          const count = sessionsByStep[step]?.size || 0
          const dropRate = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0

          funnel.push({
            step,
            sessions: count,
            dropRate: step === 0 ? 0 : dropRate
          })

          if (count > 0) prevCount = count
        }

        funnelData[cat] = funnel
      }

      const totalSessions = new Set(sessionEvents?.map(e => e.session_id) || []).size
      const completedSessions = sessionEvents?.filter(e => e.step_number === 24)
        ? new Set(sessionEvents.filter(e => e.step_number === 24).map(e => e.session_id)).size
        : 0

      return NextResponse.json({
        view: 'funnel',
        period: { days, startDate: startDateStr },
        category,
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        funnel: funnelData
      })
    }

    // ============ SESSIONS VIEW ============
    if (view === 'sessions') {
      let query = supabase
        .from('quiz_step_events')
        .select('session_id, category, step_number, event_type, time_spent_seconds, metadata, answer_value, created_at')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data: events, error } = await query.limit(5000)

      if (error) throw error

      // Group events by session
      const sessionMap: Record<string, {
        session_id: string
        category: string
        started_at: string
        last_step: number
        total_time: number
        completed: boolean
        abandoned: boolean
        device: string | null
        utm_source: string | null
        back_clicks: number
        email: string | null
        offer_selected: string | null
      }> = {}

      events?.forEach(event => {
        if (!sessionMap[event.session_id]) {
          sessionMap[event.session_id] = {
            session_id: event.session_id,
            category: event.category,
            started_at: event.created_at,
            last_step: 0,
            total_time: 0,
            completed: false,
            abandoned: false,
            device: null,
            utm_source: null,
            back_clicks: 0,
            email: null,
            offer_selected: null,
          }
        }

        const session = sessionMap[event.session_id]

        // Extract device info from first step
        if (event.event_type === 'step_entered' && event.step_number === 0 && event.metadata) {
          const meta = event.metadata as Record<string, any>
          session.device = meta.device || null
          session.utm_source = meta.utm_source || null
        }

        if (event.step_number > session.last_step) {
          session.last_step = event.step_number
        }

        if (event.time_spent_seconds) {
          session.total_time += event.time_spent_seconds
        }

        if (event.step_number === 24 && event.event_type === 'step_entered') {
          session.completed = true
        }

        if (event.event_type === 'quiz_abandoned') {
          session.abandoned = true
        }

        if (event.event_type === 'back_clicked') {
          session.back_clicks++
        }

        // Track offer selection
        if (event.event_type === 'offer_clicked' && event.answer_value) {
          session.offer_selected = event.answer_value
        }
      })

      // Fetch emails from quiz_results_v2 for all session_ids
      const sessionIds = Object.keys(sessionMap)
      if (sessionIds.length > 0) {
        const { data: quizResults } = await supabase
          .from('quiz_results_v2')
          .select('session_id, email')
          .in('session_id', sessionIds)

        // Map emails to sessions
        quizResults?.forEach(result => {
          if (result.session_id && sessionMap[result.session_id]) {
            sessionMap[result.session_id].email = result.email
          }
        })
      }

      const sessions = Object.values(sessionMap)
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
        .slice(0, 100)

      return NextResponse.json({
        view: 'sessions',
        period: { days, startDate: startDateStr },
        category,
        totalSessions: Object.keys(sessionMap).length,
        sessions
      })
    }

    // ============ DROPOFFS VIEW ============
    if (view === 'dropoffs') {
      let query = supabase
        .from('quiz_step_events')
        .select('session_id, category, step_number, question_id, event_type, time_spent_seconds')
        .gte('created_at', startDateStr)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data: events, error } = await query

      if (error) throw error

      const sessionMaxSteps: Record<string, { category: string; maxStep: number; questionId: string | null }> = {}

      events?.forEach(event => {
        if (event.event_type === 'step_entered') {
          if (!sessionMaxSteps[event.session_id] || event.step_number > sessionMaxSteps[event.session_id].maxStep) {
            sessionMaxSteps[event.session_id] = {
              category: event.category,
              maxStep: event.step_number,
              questionId: event.question_id
            }
          }
        }
      })

      const dropOffsByStep: Record<number, { count: number; percentage: number; questionIds: string[] }> = {}
      const incompleteSessions = Object.values(sessionMaxSteps).filter(s => s.maxStep < 24)
      const totalIncomplete = incompleteSessions.length

      incompleteSessions.forEach(session => {
        if (!dropOffsByStep[session.maxStep]) {
          dropOffsByStep[session.maxStep] = { count: 0, percentage: 0, questionIds: [] }
        }
        dropOffsByStep[session.maxStep].count++
        if (session.questionId && !dropOffsByStep[session.maxStep].questionIds.includes(session.questionId)) {
          dropOffsByStep[session.maxStep].questionIds.push(session.questionId)
        }
      })

      Object.keys(dropOffsByStep).forEach(step => {
        dropOffsByStep[parseInt(step)].percentage = totalIncomplete > 0
          ? Math.round((dropOffsByStep[parseInt(step)].count / totalIncomplete) * 100)
          : 0
      })

      const sortedDropOffs = Object.entries(dropOffsByStep)
        .map(([step, data]) => ({ step: parseInt(step), ...data }))
        .sort((a, b) => b.count - a.count)

      return NextResponse.json({
        view: 'dropoffs',
        period: { days, startDate: startDateStr },
        category,
        totalIncomplete,
        totalCompleted: Object.values(sessionMaxSteps).filter(s => s.maxStep >= 24).length,
        dropOffs: sortedDropOffs
      })
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 })

  } catch (error: any) {
    console.error('[Quiz Flow API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz flow data' },
      { status: 500 }
    )
  }
}
