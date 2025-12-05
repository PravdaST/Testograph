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
 * - days: number of days to look back (default: 7, use 0 or 'all' for all time)
 * - view: 'funnel' | 'sessions' | 'dropoffs' | 'stats' | 'session-detail' | 'completions' | 'overview' (default: 'funnel')
 * - session_id: required for session-detail view
 * - limit: number of sessions per page for sessions view (default: 50)
 * - offset: starting position for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  const days = parseInt(searchParams.get('days') || '7')
  const view = searchParams.get('view') || 'funnel'
  const sessionIdParam = searchParams.get('session_id')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

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
    // Now shows ALL quiz completions with tracking status indicator
    if (view === 'sessions') {
      // First, get all quiz completions from quiz_results_v2
      let completionsQuery = supabase
        .from('quiz_results_v2')
        .select('id, session_id, email, first_name, category, total_score, determined_level, workout_location, created_at')
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        completionsQuery = completionsQuery.eq('category', category)
      }

      if (days > 0) {
        completionsQuery = completionsQuery.gte('created_at', startDateStr)
      }

      // Get total count
      let countQuery = supabase
        .from('quiz_results_v2')
        .select('*', { count: 'exact', head: true })

      if (category !== 'all') {
        countQuery = countQuery.eq('category', category)
      }

      if (days > 0) {
        countQuery = countQuery.gte('created_at', startDateStr)
      }

      const { count: totalCount } = await countQuery

      // Apply pagination
      completionsQuery = completionsQuery.range(offset, offset + limit - 1)

      const { data: completions, error: completionsError } = await completionsQuery

      if (completionsError) throw completionsError

      // Get all session_ids that have tracking data
      const { data: trackedSessions } = await supabase
        .from('quiz_step_events')
        .select('session_id')

      const trackedSessionIds = new Set(trackedSessions?.map(s => s.session_id) || [])

      // For sessions with tracking, get their detailed data
      const sessionsWithTracking = completions?.filter(c => c.session_id && trackedSessionIds.has(c.session_id)) || []
      const trackingSessionIds = sessionsWithTracking.map(s => s.session_id).filter(Boolean)

      // Fetch tracking details for these sessions
      const trackingDataMap: Record<string, {
        last_step: number
        total_time: number
        completed: boolean
        abandoned: boolean
        device: string | null
        utm_source: string | null
        back_clicks: number
        offer_selected: string | null
      }> = {}

      if (trackingSessionIds.length > 0) {
        const { data: events } = await supabase
          .from('quiz_step_events')
          .select('session_id, step_number, event_type, time_spent_seconds, metadata, answer_value')
          .in('session_id', trackingSessionIds)

        events?.forEach(event => {
          if (!trackingDataMap[event.session_id]) {
            trackingDataMap[event.session_id] = {
              last_step: 0,
              total_time: 0,
              completed: false,
              abandoned: false,
              device: null,
              utm_source: null,
              back_clicks: 0,
              offer_selected: null,
            }
          }

          const session = trackingDataMap[event.session_id]

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

          if (event.step_number >= 24 && event.event_type === 'step_entered') {
            session.completed = true
          }

          if (event.event_type === 'quiz_abandoned') {
            session.abandoned = true
          }

          if (event.event_type === 'back_clicked') {
            session.back_clicks++
          }

          if (event.event_type === 'offer_clicked' && event.answer_value) {
            session.offer_selected = event.answer_value
          }
        })
      }

      // Fetch order data for all emails
      const emails = completions?.map(c => c.email).filter(Boolean) || []
      const orderMap: Record<string, { status: string; total_price: number; order_number: string; products: any[]; totalCapsules: number }> = {}

      if (emails.length > 0) {
        const { data: orders } = await supabase
          .from('pending_orders')
          .select('email, status, total_price, order_number, products')
          .in('email', emails)

        orders?.forEach(order => {
          const emailLower = order.email?.toLowerCase()
          if (emailLower && (!orderMap[emailLower] || order.status === 'paid')) {
            const products = order.products || []
            const totalCapsules = products.reduce((sum: number, p: any) => sum + (p.totalCapsules || 0), 0)
            orderMap[emailLower] = {
              status: order.status,
              total_price: order.total_price,
              order_number: order.order_number,
              products: products,
              totalCapsules: totalCapsules
            }
          }
        })
      }

      const totalSessions = totalCount || 0
      const totalPages = Math.ceil(totalSessions / limit)
      const currentPage = Math.floor(offset / limit) + 1

      // Build unified sessions list
      const sessions = completions?.map(c => {
        const hasTracking = c.session_id && trackedSessionIds.has(c.session_id)
        const trackingData = c.session_id ? trackingDataMap[c.session_id] : null
        const emailLower = c.email?.toLowerCase()
        const order = emailLower ? orderMap[emailLower] : null

        return {
          session_id: c.session_id || c.id,
          email: c.email,
          first_name: c.first_name,
          category: c.category,
          total_score: c.total_score,
          determined_level: c.determined_level,
          workout_location: c.workout_location,
          started_at: c.created_at,
          // Tracking data (if available)
          has_tracking: hasTracking,
          last_step: trackingData?.last_step ?? (c.total_score ? 26 : 0),
          total_time: trackingData?.total_time ?? 0,
          completed: trackingData?.completed ?? (c.total_score ? true : false),
          abandoned: trackingData?.abandoned ?? false,
          device: trackingData?.device ?? null,
          utm_source: trackingData?.utm_source ?? null,
          back_clicks: trackingData?.back_clicks ?? 0,
          offer_selected: trackingData?.offer_selected ?? null,
          // Order data
          order: order ? {
            status: order.status,
            total_price: order.total_price,
            order_number: order.order_number,
            products: order.products.map((p: any) => ({
              title: p.title,
              quantity: p.quantity,
              capsules: p.totalCapsules || p.capsules
            })),
            totalCapsules: order.totalCapsules
          } : null
        }
      }) || []

      // Stats
      const trackedCount = sessions.filter(s => s.has_tracking).length
      const withOrderCount = sessions.filter(s => s.order).length
      const paidCount = sessions.filter(s => s.order?.status === 'paid').length

      return NextResponse.json({
        view: 'sessions',
        period: days > 0 ? { days, startDate: startDateStr } : { days: 'all', startDate: null },
        category,
        totalSessions,
        stats: {
          tracked: trackedCount,
          withOrder: withOrderCount,
          paid: paidCount
        },
        sessions,
        pagination: {
          total: totalSessions,
          page: currentPage,
          pageSize: limit,
          totalPages,
          hasMore: offset + limit < totalSessions
        }
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

    // ============ OVERVIEW VIEW ============
    // Shows combined stats from both quiz_step_events (tracking) and quiz_results_v2 (completions)
    if (view === 'overview') {
      // Get tracking data range
      const { data: trackingRange } = await supabase
        .from('quiz_step_events')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)

      const { data: trackingLatest } = await supabase
        .from('quiz_step_events')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      // Count tracking sessions
      const { data: trackingSessions } = await supabase
        .from('quiz_step_events')
        .select('session_id')

      const uniqueTrackingSessions = new Set(trackingSessions?.map(s => s.session_id) || [])

      // Get completions from quiz_results_v2
      let completionsQuery = supabase
        .from('quiz_results_v2')
        .select('*', { count: 'exact', head: true })

      if (category !== 'all') {
        completionsQuery = completionsQuery.eq('category', category)
      }

      const { count: totalCompletions } = await completionsQuery

      // Get completions date range
      const { data: completionsFirst } = await supabase
        .from('quiz_results_v2')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)

      const { data: completionsLatest } = await supabase
        .from('quiz_results_v2')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      // Count completions by category
      const { data: byCategory } = await supabase
        .from('quiz_results_v2')
        .select('category')

      const categoryCounts: Record<string, number> = {}
      byCategory?.forEach(r => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
      })

      // Count by level
      const { data: byLevel } = await supabase
        .from('quiz_results_v2')
        .select('determined_level')

      const levelCounts: Record<string, number> = {}
      byLevel?.forEach(r => {
        levelCounts[r.determined_level || 'unknown'] = (levelCounts[r.determined_level || 'unknown'] || 0) + 1
      })

      return NextResponse.json({
        view: 'overview',
        tracking: {
          enabled: true,
          firstEvent: trackingRange?.[0]?.created_at || null,
          lastEvent: trackingLatest?.[0]?.created_at || null,
          totalSessions: uniqueTrackingSessions.size,
          note: 'Step-by-step tracking started on this date'
        },
        completions: {
          total: totalCompletions || 0,
          firstCompletion: completionsFirst?.[0]?.created_at || null,
          lastCompletion: completionsLatest?.[0]?.created_at || null,
          byCategory: categoryCounts,
          byLevel: levelCounts
        },
        summary: {
          message: `Total ${totalCompletions} quiz completions recorded. Step tracking available for ${uniqueTrackingSessions.size} sessions.`
        }
      })
    }

    // ============ COMPLETIONS VIEW ============
    // Shows ALL quiz completions from quiz_results_v2 (historical data)
    if (view === 'completions') {
      let query = supabase
        .from('quiz_results_v2')
        .select('id, session_id, email, first_name, category, total_score, determined_level, workout_location, created_at, breakdown_symptoms, breakdown_nutrition, breakdown_training, breakdown_sleep_recovery, breakdown_context')
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      // Apply date filter if days > 0
      if (days > 0) {
        query = query.gte('created_at', startDateStr)
      }

      // Get total count first
      let countQuery = supabase
        .from('quiz_results_v2')
        .select('*', { count: 'exact', head: true })

      if (category !== 'all') {
        countQuery = countQuery.eq('category', category)
      }

      if (days > 0) {
        countQuery = countQuery.gte('created_at', startDateStr)
      }

      const { count: totalCount } = await countQuery

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data: completions, error } = await query

      if (error) throw error

      // Fetch order data for all emails in this page
      const emails = completions?.map(c => c.email).filter(Boolean) || []
      const orderMap: Record<string, { status: string; total_price: number; paid_at: string | null; order_number: string; products: any[]; totalCapsules: number }> = {}

      if (emails.length > 0) {
        const { data: orders } = await supabase
          .from('pending_orders')
          .select('email, status, total_price, paid_at, order_number, products')
          .in('email', emails)

        orders?.forEach(order => {
          const emailLower = order.email?.toLowerCase()
          if (emailLower) {
            // If multiple orders, keep the most recent paid one, or most recent pending
            if (!orderMap[emailLower] ||
                (order.status === 'paid' && orderMap[emailLower].status !== 'paid')) {
              const products = order.products || []
              const totalCapsules = products.reduce((sum: number, p: any) => sum + (p.totalCapsules || 0), 0)
              orderMap[emailLower] = {
                status: order.status,
                total_price: order.total_price,
                paid_at: order.paid_at,
                order_number: order.order_number,
                products: products,
                totalCapsules: totalCapsules
              }
            }
          }
        })
      }

      // Get overall order stats
      const { data: allOrders } = await supabase
        .from('pending_orders')
        .select('status')

      const orderStats = { paid: 0, pending: 0 }
      allOrders?.forEach(o => {
        if (o.status === 'paid') orderStats.paid++
        else orderStats.pending++
      })

      // Calculate stats
      const avgScore = completions?.length
        ? Math.round(completions.reduce((sum, c) => sum + (c.total_score || 0), 0) / completions.length)
        : 0

      const levelCounts: Record<string, number> = {}
      completions?.forEach(c => {
        levelCounts[c.determined_level || 'unknown'] = (levelCounts[c.determined_level || 'unknown'] || 0) + 1
      })

      const totalCompletions = totalCount || 0
      const totalPages = Math.ceil(totalCompletions / limit)
      const currentPage = Math.floor(offset / limit) + 1

      return NextResponse.json({
        view: 'completions',
        period: days > 0 ? { days, startDate: startDateStr } : { days: 'all', startDate: null },
        category,
        totalCompletions,
        avgScore,
        levelDistribution: levelCounts,
        orderStats,
        completions: completions?.map(c => {
          const emailLower = c.email?.toLowerCase()
          const order = emailLower ? orderMap[emailLower] : null
          return {
            id: c.id,
            session_id: c.session_id,
            email: c.email,
            first_name: c.first_name,
            category: c.category,
            total_score: c.total_score,
            determined_level: c.determined_level,
            workout_location: c.workout_location,
            created_at: c.created_at,
            breakdown: {
              symptoms: c.breakdown_symptoms,
              nutrition: c.breakdown_nutrition,
              training: c.breakdown_training,
              sleep_recovery: c.breakdown_sleep_recovery,
              context: c.breakdown_context
            },
            order: order ? {
              status: order.status,
              total_price: order.total_price,
              paid_at: order.paid_at,
              order_number: order.order_number,
              products: order.products.map((p: any) => ({
                title: p.title,
                quantity: p.quantity,
                capsules: p.totalCapsules || p.capsules
              })),
              totalCapsules: order.totalCapsules
            } : null
          }
        }) || [],
        pagination: {
          total: totalCompletions,
          page: currentPage,
          pageSize: limit,
          totalPages,
          hasMore: offset + limit < totalCompletions
        }
      })
    }

    // ============ TRENDS VIEW ============
    // Daily trend data for charts (from Analytics)
    if (view === 'trends') {
      let query = supabase
        .from('quiz_results_v2')
        .select('created_at, category, total_score, determined_level')
        .order('created_at', { ascending: true })

      if (days > 0) {
        query = query.gte('created_at', startDateStr)
      }

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data: quizResults, error } = await query

      if (error) throw error

      // Calculate daily stats
      const dailyStats: Record<string, {
        total: number
        categories: Record<string, number>
        scores: number[]
      }> = {}

      quizResults?.forEach((quiz) => {
        const date = new Date(quiz.created_at).toISOString().split('T')[0]
        if (!dailyStats[date]) {
          dailyStats[date] = { total: 0, categories: { libido: 0, muscle: 0, energy: 0 }, scores: [] }
        }
        dailyStats[date].total += 1
        if (quiz.category) {
          dailyStats[date].categories[quiz.category] = (dailyStats[date].categories[quiz.category] || 0) + 1
        }
        if (quiz.total_score) {
          dailyStats[date].scores.push(quiz.total_score)
        }
      })

      const trendData = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          total: stats.total,
          libido: stats.categories.libido || 0,
          muscle: stats.categories.muscle || 0,
          energy: stats.categories.energy || 0,
          avgScore: stats.scores.length > 0
            ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
            : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Category breakdown
      const categoryBreakdown = {
        libido: quizResults?.filter(q => q.category === 'libido').length || 0,
        muscle: quizResults?.filter(q => q.category === 'muscle').length || 0,
        energy: quizResults?.filter(q => q.category === 'energy').length || 0,
      }

      // Level breakdown
      const levelBreakdown = {
        low: quizResults?.filter(q => q.determined_level === 'low').length || 0,
        moderate: quizResults?.filter(q => q.determined_level === 'moderate').length || 0,
        good: quizResults?.filter(q => q.determined_level === 'good').length || 0,
        optimal: quizResults?.filter(q => q.determined_level === 'optimal').length || 0,
      }

      // Average score
      const avgScore = quizResults && quizResults.length > 0
        ? Math.round(quizResults.reduce((sum, q) => sum + (q.total_score || 0), 0) / quizResults.length)
        : 0

      return NextResponse.json({
        view: 'trends',
        period: days > 0 ? { days, startDate: startDateStr } : { days: 'all', startDate: null },
        category,
        totalQuizzes: quizResults?.length || 0,
        avgScore,
        categoryBreakdown,
        levelBreakdown,
        trendData,
      })
    }

    // ============ USER JOURNEY VIEW ============
    // User Journey conversion funnel (from Quiz Results)
    if (view === 'user-journey') {
      // Get all quiz results with emails
      let query = supabase
        .from('quiz_results_v2')
        .select('id, email, first_name, category, total_score, determined_level, created_at')
        .not('email', 'is', null)
        .order('created_at', { ascending: false })

      if (days > 0) {
        query = query.gte('created_at', startDateStr)
      }

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data: quizResults, error } = await query

      if (error) throw error

      // Get total count
      let countQuery = supabase
        .from('quiz_results_v2')
        .select('*', { count: 'exact', head: true })
        .not('email', 'is', null)

      if (days > 0) {
        countQuery = countQuery.gte('created_at', startDateStr)
      }

      if (category !== 'all') {
        countQuery = countQuery.eq('category', category)
      }

      const { count: totalCount } = await countQuery

      // Get unique emails for user lookup
      const emails = [...new Set(quizResults?.map(r => r.email).filter(Boolean))]

      // Fetch user data
      const { data: usersData } = await supabase
        .from('users')
        .select('email, id, has_active_subscription, subscription_expires_at, current_day, created_at')
        .in('email', emails)

      // Fetch profile data
      const userIds = usersData?.map(u => u.id).filter(Boolean) || []
      const { data: profilesData } = userIds.length > 0
        ? await supabase
            .from('profiles')
            .select('id, shopify_customer_id, total_spent, onboarding_completed, last_login_at')
            .in('id', userIds)
        : { data: [] }

      // Create lookup maps
      const usersByEmail = new Map(usersData?.map(u => [u.email, u]) || [])
      const profilesById = new Map(profilesData?.map(p => [p.id, p]) || [])

      // Enrich results
      const enrichedResults = quizResults?.map(quiz => {
        const user = usersByEmail.get(quiz.email)
        const profile = user ? profilesById.get(user.id) : null

        return {
          id: quiz.id,
          email: quiz.email,
          first_name: quiz.first_name,
          category: quiz.category,
          total_score: quiz.total_score,
          determined_level: quiz.determined_level,
          created_at: quiz.created_at,
          userJourney: {
            isRegistered: !!user,
            registeredAt: user?.created_at || null,
            hasActiveSubscription: user?.has_active_subscription || false,
            subscriptionExpiresAt: user?.subscription_expires_at || null,
            currentDay: user?.current_day || null,
            lastSignIn: profile?.last_login_at || null,
            userId: user?.id || null,
            hasPurchased: !!profile?.shopify_customer_id || (profile?.total_spent || 0) > 0,
            totalSpent: profile?.total_spent || 0,
            onboardingCompleted: profile?.onboarding_completed || false,
          }
        }
      }) || []

      // Calculate conversion stats (for all quiz submissions, not just current page)
      const { data: allQuizEmails } = await supabase
        .from('quiz_results_v2')
        .select('email')
        .not('email', 'is', null)

      const uniqueQuizEmails = [...new Set(allQuizEmails?.map(r => r.email).filter(Boolean))]

      const { data: allUsersData } = await supabase
        .from('users')
        .select('email, has_active_subscription')
        .in('email', uniqueQuizEmails)

      const registeredEmails = new Set(allUsersData?.map(u => u.email) || [])
      const subscribedEmails = new Set(allUsersData?.filter(u => u.has_active_subscription).map(u => u.email) || [])

      const conversionStats = {
        totalQuizSubmissions: uniqueQuizEmails.length,
        registeredInApp: registeredEmails.size,
        withSubscription: subscribedEmails.size,
        registrationRate: uniqueQuizEmails.length > 0
          ? Math.round((registeredEmails.size / uniqueQuizEmails.length) * 100)
          : 0,
        subscriptionRate: registeredEmails.size > 0
          ? Math.round((subscribedEmails.size / registeredEmails.size) * 100)
          : 0,
        notRegisteredCount: uniqueQuizEmails.length - registeredEmails.size,
      }

      const totalResults = totalCount || 0
      const totalPages = Math.ceil(totalResults / limit)
      const currentPage = Math.floor(offset / limit) + 1

      return NextResponse.json({
        view: 'user-journey',
        period: days > 0 ? { days, startDate: startDateStr } : { days: 'all', startDate: null },
        category,
        conversionStats,
        results: enrichedResults,
        pagination: {
          total: totalResults,
          page: currentPage,
          pageSize: limit,
          totalPages,
          hasMore: offset + limit < totalResults
        }
      })
    }

    // ============ CRM VIEW ============
    // Shows user segments for email campaigns
    if (view === 'crm') {
      // Get all quiz completions with emails
      const { data: quizUsers } = await supabase
        .from('quiz_results_v2')
        .select('email, first_name, category, total_score, determined_level, created_at')
        .not('email', 'is', null)

      const quizEmailMap: Record<string, any> = {}
      quizUsers?.forEach(u => {
        const email = u.email?.toLowerCase()
        if (email) quizEmailMap[email] = u
      })

      // Get all orders with emails
      const { data: orderUsers } = await supabase
        .from('pending_orders')
        .select('email, status, total_price, products, created_at')
        .not('email', 'is', null)

      const orderEmailMap: Record<string, any> = {}
      orderUsers?.forEach(u => {
        const email = u.email?.toLowerCase()
        if (email) {
          // Keep the paid order if exists, otherwise keep any order
          if (!orderEmailMap[email] || u.status === 'paid') {
            orderEmailMap[email] = u
          }
        }
      })

      const quizEmails = new Set(Object.keys(quizEmailMap))
      const orderEmails = new Set(Object.keys(orderEmailMap))

      // Segment 1: Quiz done + No order
      const quizNoOrder: any[] = []
      quizEmails.forEach(email => {
        if (!orderEmails.has(email)) {
          const user = quizEmailMap[email]
          quizNoOrder.push({
            email,
            first_name: user.first_name,
            category: user.category,
            total_score: user.total_score,
            determined_level: user.determined_level,
            quiz_date: user.created_at
          })
        }
      })

      // Segment 2: Has order + No quiz
      const orderNoQuiz: any[] = []
      orderEmails.forEach(email => {
        if (!quizEmails.has(email)) {
          const order = orderEmailMap[email]
          const products = order.products || []
          const totalCapsules = products.reduce((sum: number, p: any) => sum + (p.totalCapsules || 0), 0)
          orderNoQuiz.push({
            email,
            status: order.status,
            total_price: order.total_price,
            products: products.map((p: any) => p.title).join(', '),
            totalCapsules,
            order_date: order.created_at
          })
        }
      })

      // Segment 3: PAID order + No quiz (subset of segment 2)
      const paidNoQuiz = orderNoQuiz.filter(u => u.status === 'paid')

      return NextResponse.json({
        view: 'crm',
        segments: {
          quizNoOrder: {
            name: 'Quiz завършен + Няма поръчка',
            description: 'Потребители които са завършили quiz-а но не са направили поръчка',
            action: 'Изпрати: "Купи за да използваш приложението"',
            count: quizNoOrder.length,
            users: quizNoOrder.sort((a, b) => new Date(b.quiz_date).getTime() - new Date(a.quiz_date).getTime())
          },
          orderNoQuiz: {
            name: 'Има поръчка + Няма Quiz',
            description: 'Потребители които са направили поръчка но не са завършили quiz-а',
            action: 'Изпрати: "Завърши Quiz-а за персонализиран план"',
            count: orderNoQuiz.length,
            users: orderNoQuiz.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
          },
          paidNoQuiz: {
            name: 'ПЛАТЕНА поръчка + Няма Quiz',
            description: 'ВАЖНО! Платили са но не са завършили quiz-а',
            action: 'Приоритет! Изпрати: "Завърши Quiz-а за да активираш плана си"',
            count: paidNoQuiz.length,
            users: paidNoQuiz
          }
        },
        summary: {
          totalQuizUsers: quizEmails.size,
          totalOrderUsers: orderEmails.size,
          overlap: [...quizEmails].filter(e => orderEmails.has(e)).length
        }
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
