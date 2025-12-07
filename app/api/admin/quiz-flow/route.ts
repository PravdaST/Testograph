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
 * - view: 'funnel' | 'sessions' | 'dropoffs' | 'stats' | 'session-detail' | 'completions' | 'overview' | 'session-explorer' | 'session-timeline' (default: 'funnel')
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
    // days < 0 means "All Time" - no date filter
    const isAllTime = days < 0
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (isAllTime ? 365 * 10 : days)) // 10 years back for "all time"
    const startDateStr = isAllTime ? '2020-01-01T00:00:00.000Z' : startDate.toISOString()

    // ============ STATS VIEW ============
    if (view === 'stats') {
      // Get all events with metadata for comprehensive stats
      let query = supabase
        .from('quiz_step_events')
        .select('session_id, category, step_number, event_type, time_spent_seconds, metadata, created_at, question_id, answer_value')
        .gte('created_at', startDateStr)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data: events, error } = await query

      if (error) throw error

      // Calculate device breakdown from first step_entered events (they have metadata)
      const deviceCounts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0, unknown: 0 }
      const trafficSources: Record<string, number> = {}
      const ageCounts: Record<string, number> = {}
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

        // Age breakdown from answer_selected events with age question
        if (event.event_type === 'answer_selected' &&
            event.question_id &&
            event.question_id.includes('age') &&
            event.answer_value) {
          const ageLabel = event.answer_value
            .replace('age_', '')
            .replace('_', '-')
            .replace('plus', '+')
          ageCounts[ageLabel] = (ageCounts[ageLabel] || 0) + 1
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
        ageBreakdown: ageCounts,
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

      // Get session_ids from current page of completions that have tracking data
      // Instead of fetching ALL tracking session_ids (which hits Supabase 1000 row limit),
      // we only check for the specific session_ids we need
      const completionSessionIds = completions?.map(c => c.session_id).filter(Boolean) || []

      let trackedSessionIds = new Set<string>()

      if (completionSessionIds.length > 0) {
        const { data: trackedSessions } = await supabase
          .from('quiz_step_events')
          .select('session_id')
          .in('session_id', completionSessionIds)

        trackedSessionIds = new Set(trackedSessions?.map(s => s.session_id) || [])
      }

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

      // Fetch order data and app user status for all emails
      const emails = completions?.map(c => c.email).filter(Boolean) || []
      const emailsLower = emails.map(e => e.toLowerCase())
      const emailSet = new Set(emailsLower)

      const orderMap: Record<string, { status: string; total_price: number; order_number: string; products: any[]; totalCapsules: number }> = {}
      const appUserMap: Record<string, { isRegistered: boolean; currentDay: number | null }> = {}

      if (emails.length > 0) {
        // Fetch ALL orders and filter by email set (case-insensitive)
        const { data: orders } = await supabase
          .from('pending_orders')
          .select('email, status, total_price, order_number, products')

        orders?.forEach(order => {
          const emailLower = order.email?.toLowerCase()
          if (emailLower && emailSet.has(emailLower)) {
            if (!orderMap[emailLower] || order.status === 'paid') {
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
          }
        })

        // Fetch app users from Supabase Auth (auth.users)
        const { data: authUsersData } = await supabase.auth.admin.listUsers()
        const authUserEmails = new Set(
          authUsersData?.users?.map(u => u.email?.toLowerCase()).filter(Boolean) || []
        )

        // Mark users as registered if they exist in auth.users
        emailsLower.forEach(emailLower => {
          if (authUserEmails.has(emailLower)) {
            appUserMap[emailLower] = {
              isRegistered: true,
              currentDay: null // We don't have current_day in auth.users
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
        const appUser = emailLower ? appUserMap[emailLower] : null

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
          } : null,
          // App user data
          app_user: appUser ? {
            is_registered: appUser.isRegistered,
            current_day: appUser.currentDay
          } : null
        }
      }) || []

      // Stats
      const trackedCount = sessions.filter(s => s.has_tracking).length
      const withOrderCount = sessions.filter(s => s.order).length
      const paidCount = sessions.filter(s => s.order?.status === 'paid').length
      const appUserCount = sessions.filter(s => s.app_user?.is_registered).length

      return NextResponse.json({
        view: 'sessions',
        period: days > 0 ? { days, startDate: startDateStr } : { days: 'all', startDate: null },
        category,
        totalSessions,
        stats: {
          tracked: trackedCount,
          withOrder: withOrderCount,
          paid: paidCount,
          appUsers: appUserCount
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
      // Get search and filter params
      const searchQuery = searchParams.get('search')?.trim().toLowerCase() || ''
      const statusFilter = searchParams.get('status') || 'all' // all, purchased, not-purchased, in-app, not-in-app, active

      // Get all quiz results with emails (including session_id for tracking)
      let query = supabase
        .from('quiz_results_v2')
        .select('id, session_id, email, first_name, category, total_score, determined_level, workout_location, created_at, breakdown_symptoms, breakdown_nutrition, breakdown_training, breakdown_sleep_recovery, breakdown_context')
        .not('email', 'is', null)
        .order('created_at', { ascending: false })

      if (days > 0) {
        query = query.gte('created_at', startDateStr)
      }

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      // Apply search filter if provided (search in email or first_name)
      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%`)
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

      // Get unique emails for user lookup (lowercase for case-insensitive matching)
      const emails = [...new Set(quizResults?.map(r => r.email?.toLowerCase()).filter(Boolean))]
      const emailSet = new Set(emails)

      // Fetch app users from Supabase Auth (auth.users table) - this is where real app users are
      const { data: journeyAuthData } = await supabase.auth.admin.listUsers()
      const authUsersByEmail = new Map<string, any>()
      journeyAuthData?.users?.forEach(u => {
        if (u.email) {
          authUsersByEmail.set(u.email.toLowerCase(), u)
        }
      })

      // Fetch orders for these emails
      const { data: ordersData } = await supabase
        .from('pending_orders')
        .select('email, status, total_price, order_number, products, created_at, paid_at')

      const ordersByEmail = new Map<string, any>()
      ordersData?.forEach(o => {
        const emailLower = o.email?.toLowerCase()
        if (emailLower && emailSet.has(emailLower)) {
          // Keep the paid order if exists, otherwise keep any order
          if (!ordersByEmail.has(emailLower) || o.status === 'paid') {
            const products = o.products || []
            const totalCapsules = products.reduce((sum: number, p: any) => sum + (p.totalCapsules || 0), 0)
            ordersByEmail.set(emailLower, {
              ...o,
              totalCapsules
            })
          }
        }
      })

      // Fetch inventory data
      const { data: inventoryData } = await supabase
        .from('testoup_inventory')
        .select('email, capsules_remaining, updated_at')

      const inventoryByEmail = new Map<string, any>()
      inventoryData?.forEach(i => {
        const emailLower = i.email?.toLowerCase()
        if (emailLower) {
          inventoryByEmail.set(emailLower, i)
        }
      })

      // Fetch activity data for these users + chat sessions
      const [
        { data: workoutData },
        { data: mealData },
        { data: sleepData },
        { data: testoData },
        { data: progressData },
        { data: chatSessionsData }
      ] = await Promise.all([
        supabase.from('workout_sessions').select('email, created_at').order('created_at', { ascending: false }),
        supabase.from('meal_completions').select('email, created_at').order('created_at', { ascending: false }),
        supabase.from('sleep_tracking').select('email, created_at').order('created_at', { ascending: false }),
        supabase.from('testoup_tracking').select('email, created_at').order('created_at', { ascending: false }),
        supabase.from('daily_progress_scores').select('email, date, overall_score').order('date', { ascending: false }),
        supabase.from('chat_sessions').select('user_id, created_at, messages_count').order('created_at', { ascending: false })
      ])

      // Build chat sessions map (by user_id from auth)
      const chatByUserId = new Map<string, { count: number, totalMessages: number, lastChat: string | null }>()
      chatSessionsData?.forEach(chat => {
        if (!chatByUserId.has(chat.user_id)) {
          chatByUserId.set(chat.user_id, { count: 0, totalMessages: 0, lastChat: null })
        }
        const data = chatByUserId.get(chat.user_id)!
        data.count++
        data.totalMessages += chat.messages_count || 0
        if (!data.lastChat) data.lastChat = chat.created_at
      })

      // Build activity map per user
      const activityByEmail = new Map<string, {
        workouts: number
        meals: number
        sleep: number
        testoup: number
        progressDays: number
        lastActivity: string | null
        avgProgressScore: number
      }>()

      const processActivity = (data: any[] | null, type: 'workouts' | 'meals' | 'sleep' | 'testoup') => {
        data?.forEach(item => {
          const emailLower = item.email?.toLowerCase()
          if (emailLower && emailSet.has(emailLower)) {
            if (!activityByEmail.has(emailLower)) {
              activityByEmail.set(emailLower, {
                workouts: 0, meals: 0, sleep: 0, testoup: 0,
                progressDays: 0, lastActivity: null, avgProgressScore: 0
              })
            }
            const activity = activityByEmail.get(emailLower)!
            activity[type]++
            if (!activity.lastActivity || item.created_at > activity.lastActivity) {
              activity.lastActivity = item.created_at
            }
          }
        })
      }

      processActivity(workoutData, 'workouts')
      processActivity(mealData, 'meals')
      processActivity(sleepData, 'sleep')
      processActivity(testoData, 'testoup')

      // Process progress scores
      const progressByEmail = new Map<string, number[]>()
      progressData?.forEach(p => {
        const emailLower = p.email?.toLowerCase()
        if (emailLower && emailSet.has(emailLower)) {
          if (!progressByEmail.has(emailLower)) {
            progressByEmail.set(emailLower, [])
          }
          progressByEmail.get(emailLower)!.push(p.overall_score || 0)

          if (activityByEmail.has(emailLower)) {
            activityByEmail.get(emailLower)!.progressDays++
          }
        }
      })

      // Calculate average progress scores
      progressByEmail.forEach((scores, email) => {
        if (activityByEmail.has(email) && scores.length > 0) {
          activityByEmail.get(email)!.avgProgressScore = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
          )
        }
      })

      // Fetch tracking data for sessions
      const sessionIds = quizResults?.map(q => q.session_id).filter(Boolean) || []
      const trackingDataMap: Record<string, {
        has_tracking: boolean
        device: string | null
        total_time: number
        utm_source: string | null
      }> = {}

      if (sessionIds.length > 0) {
        // Check which sessions have tracking
        const { data: trackedSessions } = await supabase
          .from('quiz_step_events')
          .select('session_id, step_number, event_type, time_spent_seconds, metadata')
          .in('session_id', sessionIds)

        trackedSessions?.forEach(event => {
          if (!trackingDataMap[event.session_id]) {
            trackingDataMap[event.session_id] = {
              has_tracking: true,
              device: null,
              total_time: 0,
              utm_source: null
            }
          }
          const tracking = trackingDataMap[event.session_id]

          if (event.event_type === 'step_entered' && event.step_number === 0 && event.metadata) {
            const meta = event.metadata as Record<string, any>
            tracking.device = meta.device || null
            tracking.utm_source = meta.utm_source || null
          }

          if (event.time_spent_seconds) {
            tracking.total_time += event.time_spent_seconds
          }
        })
      }

      // Enrich results with all data
      const enrichedResults = quizResults?.map(quiz => {
        const emailLower = quiz.email?.toLowerCase()
        const authUser = emailLower ? authUsersByEmail.get(emailLower) : null
        const order = emailLower ? ordersByEmail.get(emailLower) : null
        const inventory = emailLower ? inventoryByEmail.get(emailLower) : null
        const activity = emailLower ? activityByEmail.get(emailLower) : null
        const tracking = quiz.session_id ? trackingDataMap[quiz.session_id] : null
        const chatData = authUser?.id ? chatByUserId.get(authUser.id) : null

        return {
          id: quiz.id,
          session_id: quiz.session_id,
          email: quiz.email,
          first_name: quiz.first_name,
          category: quiz.category,
          total_score: quiz.total_score,
          determined_level: quiz.determined_level,
          workout_location: quiz.workout_location,
          created_at: quiz.created_at,
          // Breakdown scores
          breakdown: {
            symptoms: quiz.breakdown_symptoms || 0,
            nutrition: quiz.breakdown_nutrition || 0,
            training: quiz.breakdown_training || 0,
            sleep_recovery: quiz.breakdown_sleep_recovery || 0,
            context: quiz.breakdown_context || 0
          },
          // Tracking data
          has_tracking: !!tracking,
          device: tracking?.device || null,
          total_time: tracking?.total_time || 0,
          utm_source: tracking?.utm_source || null,
          userJourney: {
            // App Registration (from auth.users)
            isRegistered: !!authUser,
            registeredAt: authUser?.created_at || null,
            lastSignIn: authUser?.last_sign_in_at || null,
            userId: authUser?.id || null,
            // Order Info
            hasPurchased: !!order,
            orderStatus: order?.status || null,
            orderNumber: order?.order_number || null,
            totalSpent: order?.total_price || 0,
            totalCapsules: order?.totalCapsules || 0,
            orderDate: order?.created_at || null,
            paidAt: order?.paid_at || null,
            // Inventory
            capsulesRemaining: inventory?.capsules_remaining || 0,
            daysSupply: Math.floor((inventory?.capsules_remaining || 0) / 2),
            // Chat Sessions
            chatSessions: chatData?.count || 0,
            totalMessages: chatData?.totalMessages || 0,
            lastChatAt: chatData?.lastChat || null,
            // Activity Stats
            isActive: !!activity && (activity.workouts + activity.meals + activity.sleep + activity.testoup) > 0,
            activityStats: activity ? {
              workouts: activity.workouts,
              meals: activity.meals,
              sleep: activity.sleep,
              testoup: activity.testoup,
              progressDays: activity.progressDays,
              avgProgressScore: activity.avgProgressScore,
              lastActivity: activity.lastActivity
            } : null
          }
        }
      }) || []

      // Calculate conversion stats (for all quiz submissions, not just current page)
      const { data: allQuizEmails } = await supabase
        .from('quiz_results_v2')
        .select('email')
        .not('email', 'is', null)

      // Normalize emails to lowercase for case-insensitive comparison
      const uniqueQuizEmails = [...new Set(
        allQuizEmails?.map(r => r.email?.toLowerCase()).filter(Boolean) as string[]
      )]

      // Reuse auth users data already fetched above (authUsersByEmail Map)
      const allAuthUserEmails = [...authUsersByEmail.keys()]

      // Fetch paid orders
      const { data: allPaidOrders } = await supabase
        .from('pending_orders')
        .select('email')
        .eq('status', 'paid')

      // Create Sets with lowercase emails for case-insensitive matching
      const quizEmailSet = new Set(uniqueQuizEmails)
      const authEmailSet = new Set(allAuthUserEmails)

      // Quiz users who are registered in the App (auth.users)
      const registeredEmails = new Set(
        uniqueQuizEmails.filter(email => authEmailSet.has(email))
      )

      const paidOrderEmails = new Set(
        allPaidOrders?.map(o => o.email?.toLowerCase())
          .filter(email => email && quizEmailSet.has(email)) || []
      )

      // Fetch ACTIVE users - those who actually use the app
      // Check multiple activity tables for any activity (for conversion stats)
      const [
        { data: allWorkoutActivity },
        { data: allMealActivity },
        { data: allSleepActivity },
        { data: allTestoActivity },
        { data: allProgressActivity }
      ] = await Promise.all([
        supabase.from('workout_sessions').select('email'),
        supabase.from('meal_completions').select('email'),
        supabase.from('sleep_tracking').select('email'),
        supabase.from('testoup_tracking').select('email'),
        supabase.from('daily_progress_scores').select('email')
      ])

      // Combine all activity emails into one set
      const allActivityEmails = new Set<string>()
      allWorkoutActivity?.forEach(w => w.email && allActivityEmails.add(w.email.toLowerCase()))
      allMealActivity?.forEach(m => m.email && allActivityEmails.add(m.email.toLowerCase()))
      allSleepActivity?.forEach(s => s.email && allActivityEmails.add(s.email.toLowerCase()))
      allTestoActivity?.forEach(t => t.email && allActivityEmails.add(t.email.toLowerCase()))
      allProgressActivity?.forEach(p => p.email && allActivityEmails.add(p.email.toLowerCase()))

      // Active quiz users = quiz users who have any activity in the app
      const activeQuizUsers = new Set(
        uniqueQuizEmails.filter(email => allActivityEmails.has(email))
      )

      const conversionStats = {
        totalQuizSubmissions: uniqueQuizEmails.length,
        registeredInApp: registeredEmails.size,
        withPaidOrder: paidOrderEmails.size,
        activeInApp: activeQuizUsers.size,
        registrationRate: uniqueQuizEmails.length > 0
          ? Math.round((registeredEmails.size / uniqueQuizEmails.length) * 100)
          : 0,
        purchaseRate: uniqueQuizEmails.length > 0
          ? Math.round((paidOrderEmails.size / uniqueQuizEmails.length) * 100)
          : 0,
        activeRate: uniqueQuizEmails.length > 0
          ? Math.round((activeQuizUsers.size / uniqueQuizEmails.length) * 100)
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

    // ============ COHORT ANALYSIS VIEW ============
    // Groups users by week/month and shows conversion comparison
    if (view === 'cohort') {
      const groupBy = searchParams.get('groupBy') || 'week' // 'week' | 'month'

      // Get all quiz completions
      const { data: quizResults } = await supabase
        .from('quiz_results_v2')
        .select('email, category, total_score, determined_level, created_at')
        .not('email', 'is', null)
        .order('created_at', { ascending: true })

      // Get all orders
      const { data: orders } = await supabase
        .from('pending_orders')
        .select('email, status, total_price, created_at')
        .not('email', 'is', null)

      // Get all app registrations
      const { data: appUsers } = await supabase
        .from('app_users')
        .select('email, created_at')
        .not('email', 'is', null)

      // Build email maps
      const ordersByEmail: Record<string, { status: string; total_price: number; created_at: string }> = {}
      orders?.forEach(o => {
        const email = o.email?.toLowerCase()
        if (email && (!ordersByEmail[email] || o.status === 'paid')) {
          ordersByEmail[email] = o
        }
      })

      const appUsersByEmail = new Set(appUsers?.map(u => u.email?.toLowerCase()).filter(Boolean) || [])

      // Helper function to get week/month key
      const getTimeKey = (dateStr: string): string => {
        const date = new Date(dateStr)
        if (groupBy === 'month') {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }
        // Week: Get start of week (Monday)
        const day = date.getDay()
        const diff = date.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(date)
        monday.setDate(diff)
        return `${monday.getFullYear()}-W${String(Math.ceil((monday.getDate() + new Date(monday.getFullYear(), 0, 1).getDay()) / 7)).padStart(2, '0')}`
      }

      // Group quiz results by time period
      const cohorts: Record<string, {
        period: string
        startDate: string
        quizCompletions: number
        withOrder: number
        withPaidOrder: number
        withAppRegistration: number
        totalRevenue: number
        categoryBreakdown: { libido: number; muscle: number; energy: number }
        levelBreakdown: { low: number; normal: number; good: number }
      }> = {}

      quizResults?.forEach(result => {
        const email = result.email?.toLowerCase()
        if (!email) return

        const timeKey = getTimeKey(result.created_at)
        if (!cohorts[timeKey]) {
          cohorts[timeKey] = {
            period: timeKey,
            startDate: result.created_at,
            quizCompletions: 0,
            withOrder: 0,
            withPaidOrder: 0,
            withAppRegistration: 0,
            totalRevenue: 0,
            categoryBreakdown: { libido: 0, muscle: 0, energy: 0 },
            levelBreakdown: { low: 0, normal: 0, good: 0 }
          }
        }

        const cohort = cohorts[timeKey]
        cohort.quizCompletions++

        // Category
        if (result.category && cohort.categoryBreakdown[result.category as keyof typeof cohort.categoryBreakdown] !== undefined) {
          cohort.categoryBreakdown[result.category as keyof typeof cohort.categoryBreakdown]++
        }

        // Level
        const level = result.determined_level === 'low' ? 'low' :
                      result.determined_level === 'normal' || result.determined_level === 'moderate' ? 'normal' : 'good'
        cohort.levelBreakdown[level]++

        // Check order status
        const order = ordersByEmail[email]
        if (order) {
          cohort.withOrder++
          if (order.status === 'paid') {
            cohort.withPaidOrder++
            cohort.totalRevenue += order.total_price || 0
          }
        }

        // Check app registration
        if (appUsersByEmail.has(email)) {
          cohort.withAppRegistration++
        }
      })

      // Convert to array and calculate rates
      const cohortArray = Object.values(cohorts)
        .sort((a, b) => a.period.localeCompare(b.period))
        .map(cohort => ({
          ...cohort,
          orderRate: cohort.quizCompletions > 0 ? Math.round((cohort.withOrder / cohort.quizCompletions) * 100) : 0,
          paidRate: cohort.quizCompletions > 0 ? Math.round((cohort.withPaidOrder / cohort.quizCompletions) * 100) : 0,
          appRate: cohort.quizCompletions > 0 ? Math.round((cohort.withAppRegistration / cohort.quizCompletions) * 100) : 0,
          avgRevenue: cohort.withPaidOrder > 0 ? Math.round(cohort.totalRevenue / cohort.withPaidOrder) : 0
        }))

      // Calculate summary stats
      const totals = cohortArray.reduce((acc, c) => ({
        quizCompletions: acc.quizCompletions + c.quizCompletions,
        withOrder: acc.withOrder + c.withOrder,
        withPaidOrder: acc.withPaidOrder + c.withPaidOrder,
        withAppRegistration: acc.withAppRegistration + c.withAppRegistration,
        totalRevenue: acc.totalRevenue + c.totalRevenue
      }), { quizCompletions: 0, withOrder: 0, withPaidOrder: 0, withAppRegistration: 0, totalRevenue: 0 })

      return NextResponse.json({
        view: 'cohort',
        groupBy,
        cohorts: cohortArray,
        summary: {
          totalCohorts: cohortArray.length,
          totalQuizCompletions: totals.quizCompletions,
          avgOrderRate: totals.quizCompletions > 0 ? Math.round((totals.withOrder / totals.quizCompletions) * 100) : 0,
          avgPaidRate: totals.quizCompletions > 0 ? Math.round((totals.withPaidOrder / totals.quizCompletions) * 100) : 0,
          avgAppRate: totals.quizCompletions > 0 ? Math.round((totals.withAppRegistration / totals.quizCompletions) * 100) : 0,
          totalRevenue: totals.totalRevenue
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

    // ============ SESSION EXPLORER VIEW ============
    // Comprehensive session analytics with dropoff funnel, abandoned sessions, and problem questions
    if (view === 'session-explorer') {
      // Get ALL events from quiz_step_events
      let eventsQuery = supabase
        .from('quiz_step_events')
        .select('session_id, step_number, question_id, event_type, answer_value, time_spent_seconds, category, metadata, created_at')
        .order('created_at', { ascending: true })

      if (days > 0) {
        eventsQuery = eventsQuery.gte('created_at', startDateStr)
      }

      if (category !== 'all') {
        eventsQuery = eventsQuery.eq('category', category)
      }

      const { data: allEvents, error: eventsError } = await eventsQuery

      if (eventsError) throw eventsError

      // Get completed sessions from quiz_results_v2
      let completedQuery = supabase
        .from('quiz_results_v2')
        .select('session_id, email, first_name, category, total_score, determined_level, created_at')

      if (days > 0) {
        completedQuery = completedQuery.gte('created_at', startDateStr)
      }

      if (category !== 'all') {
        completedQuery = completedQuery.eq('category', category)
      }

      const { data: completedResults, error: completedError } = await completedQuery

      if (completedError) throw completedError

      const completedSessionIds = new Set(completedResults?.map(r => r.session_id).filter(Boolean) || [])

      // Build session data
      const sessionsMap: Record<string, {
        session_id: string
        category: string | null
        started_at: string
        last_activity: string
        max_step: number
        total_time: number
        is_completed: boolean
        completion_data: any | null
        device: string | null
        utm_source: string | null
        events: Array<{
          step_number: number
          question_id: string | null
          event_type: string
          answer_value: string | null
          time_spent_seconds: number | null
          created_at: string
        }>
      }> = {}

      allEvents?.forEach(event => {
        if (!sessionsMap[event.session_id]) {
          const metadata = event.metadata as Record<string, any> || {}
          sessionsMap[event.session_id] = {
            session_id: event.session_id,
            category: event.category,
            started_at: event.created_at,
            last_activity: event.created_at,
            max_step: event.step_number,
            total_time: 0,
            is_completed: completedSessionIds.has(event.session_id),
            completion_data: null,
            device: metadata.device || null,
            utm_source: metadata.utm_source || null,
            events: []
          }
        }

        const session = sessionsMap[event.session_id]
        session.last_activity = event.created_at
        if (event.step_number > session.max_step) {
          session.max_step = event.step_number
        }
        if (event.time_spent_seconds) {
          session.total_time += event.time_spent_seconds
        }

        session.events.push({
          step_number: event.step_number,
          question_id: event.question_id,
          event_type: event.event_type,
          answer_value: event.answer_value,
          time_spent_seconds: event.time_spent_seconds,
          created_at: event.created_at
        })
      })

      // Add completion data to completed sessions
      completedResults?.forEach(result => {
        if (result.session_id && sessionsMap[result.session_id]) {
          sessionsMap[result.session_id].completion_data = {
            email: result.email,
            first_name: result.first_name,
            total_score: result.total_score,
            level: result.determined_level,
            completed_at: result.created_at
          }
        }
      })

      // Convert to array and sort
      const allSessions = Object.values(sessionsMap).sort((a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )

      // Calculate dropoff funnel
      const dropoffByStep: Record<number, number> = {}
      allSessions.forEach(session => {
        const step = session.max_step
        dropoffByStep[step] = (dropoffByStep[step] || 0) + 1
      })

      // Calculate cumulative funnel (how many reached each step)
      const maxStep = Math.max(...allSessions.map(s => s.max_step), 0)
      const cumulativeFunnel: Array<{ step: number; reached: number; dropoff: number; dropoffRate: number }> = []

      for (let step = 0; step <= maxStep; step++) {
        const reached = allSessions.filter(s => s.max_step >= step).length
        const droppedHere = dropoffByStep[step] || 0
        cumulativeFunnel.push({
          step,
          reached,
          dropoff: droppedHere,
          dropoffRate: reached > 0 ? Math.round((droppedHere / reached) * 100) : 0
        })
      }

      // Identify problem questions (high dropoff or long average time)
      const stepStats: Record<number, { times: number[]; answers: Record<string, number> }> = {}

      allEvents?.forEach(event => {
        if (!stepStats[event.step_number]) {
          stepStats[event.step_number] = { times: [], answers: {} }
        }
        if (event.event_type === 'step_exited' && event.time_spent_seconds) {
          stepStats[event.step_number].times.push(event.time_spent_seconds)
        }
        if (event.answer_value) {
          const ans = event.answer_value
          stepStats[event.step_number].answers[ans] = (stepStats[event.step_number].answers[ans] || 0) + 1
        }
      })

      const problemQuestions: Array<{
        step: number
        question_id: string | null
        avgTime: number
        dropoffCount: number
        dropoffRate: number
        reason: string
      }> = []

      cumulativeFunnel.forEach(({ step, dropoffRate, dropoff }) => {
        const stats = stepStats[step]
        const avgTime = stats?.times.length > 0
          ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length)
          : 0

        // Flag as problem if dropoff > 15% or avg time > 60 seconds
        if (dropoffRate > 15 || avgTime > 60) {
          const questionEvent = allEvents?.find(e => e.step_number === step && e.question_id)
          problemQuestions.push({
            step,
            question_id: questionEvent?.question_id || null,
            avgTime,
            dropoffCount: dropoff,
            dropoffRate,
            reason: dropoffRate > 15 && avgTime > 60
              ? 'High dropoff AND slow'
              : dropoffRate > 15
                ? 'High dropoff rate'
                : 'Slow completion time'
          })
        }
      })

      // Sort problem questions by dropoff rate
      problemQuestions.sort((a, b) => b.dropoffRate - a.dropoffRate)

      // Split sessions for response
      const completedSessions = allSessions.filter(s => s.is_completed)
      const abandonedSessions = allSessions.filter(s => !s.is_completed)

      // Paginate abandoned sessions
      const paginatedAbandoned = abandonedSessions.slice(offset, offset + limit)

      return NextResponse.json({
        summary: {
          totalSessions: allSessions.length,
          completedSessions: completedSessions.length,
          abandonedSessions: abandonedSessions.length,
          completionRate: allSessions.length > 0
            ? Math.round((completedSessions.length / allSessions.length) * 100)
            : 0,
          avgTotalTime: allSessions.length > 0
            ? Math.round(allSessions.reduce((sum, s) => sum + s.total_time, 0) / allSessions.length)
            : 0
        },
        dropoffFunnel: cumulativeFunnel,
        problemQuestions: problemQuestions.slice(0, 10), // Top 10 problem questions
        abandonedSessions: {
          total: abandonedSessions.length,
          offset,
          limit,
          data: paginatedAbandoned.map(s => ({
            session_id: s.session_id,
            category: s.category,
            started_at: s.started_at,
            last_activity: s.last_activity,
            max_step: s.max_step,
            total_time: s.total_time,
            device: s.device,
            utm_source: s.utm_source,
            event_count: s.events.length,
            last_answer: s.events.filter(e => e.answer_value).pop()?.answer_value || null
          }))
        },
        recentCompleted: completedSessions.slice(0, 10).map(s => ({
          session_id: s.session_id,
          category: s.category,
          email: s.completion_data?.email,
          first_name: s.completion_data?.first_name,
          total_score: s.completion_data?.total_score,
          level: s.completion_data?.level,
          total_time: s.total_time,
          completed_at: s.completion_data?.completed_at
        })),
        // For session detail modal - include full events for specific session
        getSessionDetail: (sessionId: string) => sessionsMap[sessionId] || null
      })
    }

    // ============ SESSION TIMELINE VIEW ============
    // Get full timeline for a specific session with all events and answers
    if (view === 'session-timeline') {
      if (!sessionIdParam) {
        return NextResponse.json({ error: 'session_id is required for session-timeline view' }, { status: 400 })
      }

      const { data: sessionEvents, error: sessionError } = await supabase
        .from('quiz_step_events')
        .select('step_number, question_id, event_type, answer_value, time_spent_seconds, category, metadata, created_at')
        .eq('session_id', sessionIdParam)
        .order('created_at', { ascending: true })

      if (sessionError) throw sessionError

      if (!sessionEvents || sessionEvents.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      // Check if completed
      const { data: completionData } = await supabase
        .from('quiz_results_v2')
        .select('email, first_name, category, total_score, determined_level, created_at')
        .eq('session_id', sessionIdParam)
        .single()

      const firstEvent = sessionEvents[0]
      const lastEvent = sessionEvents[sessionEvents.length - 1]
      const metadata = firstEvent.metadata as Record<string, any> || {}

      // Build timeline with question details
      const timeline = sessionEvents.map(event => ({
        step: event.step_number,
        question_id: event.question_id,
        event_type: event.event_type,
        answer: event.answer_value,
        time_spent: event.time_spent_seconds,
        timestamp: event.created_at
      }))

      // Calculate total time from step_exited events
      const totalTime = sessionEvents
        .filter(e => e.event_type === 'step_exited' && e.time_spent_seconds)
        .reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0)

      return NextResponse.json({
        session_id: sessionIdParam,
        category: firstEvent.category,
        started_at: firstEvent.created_at,
        last_activity: lastEvent.created_at,
        is_completed: !!completionData,
        completion_data: completionData ? {
          email: completionData.email,
          first_name: completionData.first_name,
          total_score: completionData.total_score,
          level: completionData.determined_level,
          completed_at: completionData.created_at
        } : null,
        device: metadata.device || null,
        utm_source: metadata.utm_source || null,
        referrer: metadata.referrer || null,
        max_step: Math.max(...sessionEvents.map(e => e.step_number)),
        total_time: totalTime,
        event_count: sessionEvents.length,
        timeline,
        // Group answers by question for easy viewing
        answers: sessionEvents
          .filter(e => e.answer_value)
          .map(e => ({
            step: e.step_number,
            question_id: e.question_id,
            answer: e.answer_value,
            time_spent: e.time_spent_seconds
          }))
      })
    }

    // ============ CSV EXPORT VIEW ============
    // Export all quiz results with answers to CSV
    if (view === 'csv-export') {
      // Human-readable answer labels mapping
      const ANSWER_LABELS: Record<string, string> = {
        // Age options
        age_25_35: "25-35 години",
        age_36_45: "36-45 години",
        age_46_55: "46-55 години",
        age_56_plus: "56+ години",

        // Main problem (energy)
        problem_fatigue: "Постоянна умора",
        problem_brain_fog: "Мозъчна мъгла",
        problem_motivation: "Липса на мотивация",
        problem_endurance: "Ниска издръжливост",
        // Main problem (libido)
        problem_confidence: "Ниска сексуална увереност",
        problem_desire: "Намалено желание",
        problem_shame: "Срам от представянето",
        problem_frequency: "Рядка интимност",
        // Main problem (muscle)
        problem_losing: "Губя мускулна маса",
        problem_recovery: "Бавно възстановяване",
        problem_strength: "Губя сила",
        problem_plateau: "Плато в резултатите",
        problem_cant_gain: "Не мога да качвам маса",
        problem_fat_loss: "Трудно горя мазнини",

        // Work stress
        stress_low: "Ниско",
        stress_moderate: "Умерено",
        stress_high: "Високо",
        stress_extreme: "Екстремно",

        // Height
        height_160_170: "160-170 см",
        height_171_180: "171-180 см",
        height_181_190: "181-190 см",
        height_191_plus: "191+ см",

        // Weight
        weight_60_75: "60-75 кг",
        weight_76_85: "76-85 кг",
        weight_86_95: "86-95 кг",
        weight_96_110: "96-110 кг",
        weight_111_plus: "111+ кг",

        // Body fat
        bf_8_12: "8-12% (атлетична)",
        bf_13_17: "13-17% (добра форма)",
        bf_18_22: "18-22% (средна)",
        bf_23_27: "23-27% (наднормено)",
        bf_28_plus: "28%+ (затлъстяване)",

        // Nutrition
        nutrition_high_protein_fat: "Високопротеинов",
        nutrition_balanced: "Балансиран",
        nutrition_high_carb: "Високовъглехидратен",
        nutrition_low_fat: "Нискомазнинен",
        nutrition_irregular: "Нередовен",

        // Smoking
        smoke_never: "Не, никога",
        smoke_quit: "Отказал преди 1+ година",
        smoke_occasional: "Понякога",
        smoke_regular: "До 10 цигари/ден",
        smoke_heavy: "Над 10 цигари/ден",

        // Alcohol
        alcohol_never: "Никога/рядко",
        alcohol_occasional: "1-2 пъти месечно",
        alcohol_weekly: "1-2 пъти седмично",
        alcohol_frequent: "3-4 пъти седмично",
        alcohol_daily: "Ежедневно",

        // Sleep
        sleep_optimal: "7-9 часа (оптимално)",
        sleep_6_7: "6-7 часа",
        sleep_less_6: "Под 6 часа",
        sleep_more_9: "Над 9 часа",
        sleep_irregular: "Нередовно",

        // Tired time
        tired_morning: "Сутрин",
        tired_afternoon: "Следобед (14-16ч)",
        tired_evening: "Вечер",
        tired_all_day: "Целия ден",

        // Energy level
        energy_excellent: "8-10/10 (отлично)",
        energy_good: "6-7/10 (добро)",
        energy_moderate: "4-5/10 (средно)",
        energy_low: "2-3/10 (ниско)",
        energy_very_low: "0-1/10 (много ниско)",

        // Frustration
        frustration_work: "Неефективност в работата",
        frustration_hobbies: "Нямам енергия за хобита",
        frustration_social: "Уморен за социални контакти",
        frustration_focus: "Трудна концентрация",
        frustration_motivation: "Липса на мотивация",
        frustration_no_results: "Няма резултати от тренировки",

        // Change one thing (energy)
        change_morning_energy: "Събуждане с енергия",
        change_sustained_energy: "Стабилна енергия без спадове",
        change_mental_clarity: "Бистър ум и фокус",
        change_motivation: "Да възвърна мотивацията",
        // Change one thing (libido)
        change_desire: "Силно сексуално желание",
        change_spontaneity: "Спонтанност в секса",
        change_confidence: "Увереност в леглото",
        // Change one thing (muscle)
        change_gain_mass: "Набиране на мускулна маса",
        change_strength: "Повече сила",
        change_definition: "По-добра дефиниция",

        // Tried solutions
        tried_supplements: "Добавки (витамини и др.)",
        tried_lifestyle: "Промени в начина на живот",
        tried_medical: "Медицински консултации",
        tried_nothing: "Първи сериозен опит",

        // Important factor
        factor_natural: "Естествено и безопасно",
        factor_proven: "Доказана ефективност",
        factor_simple: "Лесно за прилагане",
        factor_fast: "Бързи резултати",

        // Workout location
        location_home: "Вкъщи",
        location_gym: "Фитнес зала",

        // Dietary preference
        diet_omnivor: "Ям всичко",
        diet_pescatarian: "Вегетарианец + риба",
        diet_vegetarian: "Вегетарианец",
        diet_vegan: "Веган",

        // Morning erections (libido)
        erections_always: "Всяка сутрин",
        erections_often: "Често (4-5 пъти седмично)",
        erections_sometimes: "Понякога (2-3 пъти седмично)",
        erections_rarely: "Рядко (1 път седмично или по-малко)",
        erections_never: "Почти никога",

        // Sex frequency (libido)
        sex_daily: "Ежедневно",
        sex_weekly: "Няколко пъти седмично",
        sex_monthly: "Няколко пъти месечно",
        sex_rarely: "Рядко (веднъж месечно или по-малко)",
        sex_none: "Почти никога",

        // Training frequency (muscle)
        train_0_1: "0-1 пъти седмично",
        train_2_3: "2-3 пъти седмично",
        train_4_5: "4-5 пъти седмично",
        train_6_plus: "6+ пъти седмично",

        // Progress rating (muscle)
        progress_excellent: "Отлични",
        progress_good: "Добри",
        progress_moderate: "Средни",
        progress_poor: "Слаби",
        progress_none: "Никакви",
      }

      // Question ID to human-readable question text mapping
      // Each column includes category prefix for uniqueness
      const QUESTION_LABELS: Record<string, string> = {
        // LIBIDO Questions (Л = Либидо)
        lib_age: "[Либидо] Възраст",
        lib_main_problem: "[Либидо] Основен проблем",
        lib_name: "[Либидо] Име",
        lib_profession: "[Либидо] Професия",
        lib_work_stress: "[Либидо] Стрес от работа",
        lib_height: "[Либидо] Височина",
        lib_weight: "[Либидо] Тегло",
        lib_body_fat: "[Либидо] Телесни мазнини %",
        lib_nutrition_regime: "[Либидо] Хранителен режим",
        lib_smoking: "[Либидо] Пушене",
        lib_alcohol: "[Либидо] Алкохол",
        lib_sleep_hours: "[Либидо] Часове сън",
        lib_sex_frequency: "[Либидо] Честота на секс",
        lib_morning_erections: "[Либидо] Сутрешни ерекции",
        lib_frustration: "[Либидо] Разочарование",
        lib_change_one_thing: "[Либидо] Желана промяна",
        lib_tried_solutions: "[Либидо] Опитвани решения",
        lib_important_factor: "[Либидо] Най-важен фактор",
        lib_vision: "[Либидо] Визия след 30 дни",
        lib_workout_location: "[Либидо] Локация тренировки",
        lib_dietary_preference: "[Либидо] Хранителни предпочитания",

        // ENERGY Questions (Е = Енергия)
        eng_age: "[Енергия] Възраст",
        eng_main_problem: "[Енергия] Основен проблем",
        eng_name: "[Енергия] Име",
        eng_profession: "[Енергия] Професия",
        eng_work_stress: "[Енергия] Стрес от работа",
        eng_height: "[Енергия] Височина",
        eng_weight: "[Енергия] Тегло",
        eng_body_fat: "[Енергия] Телесни мазнини %",
        eng_nutrition_regime: "[Енергия] Хранителен режим",
        eng_smoking: "[Енергия] Пушене",
        eng_alcohol: "[Енергия] Алкохол",
        eng_sleep_hours: "[Енергия] Часове сън",
        eng_tired_time: "[Енергия] Кога сте уморен",
        eng_energy_level: "[Енергия] Ниво 1-10",
        eng_frustration: "[Енергия] Разочарование",
        eng_change_one_thing: "[Енергия] Желана промяна",
        eng_tried_solutions: "[Енергия] Опитвани решения",
        eng_important_factor: "[Енергия] Най-важен фактор",
        eng_vision: "[Енергия] Визия след 30 дни",
        eng_workout_location: "[Енергия] Локация тренировки",
        eng_dietary_preference: "[Енергия] Хранителни предпочитания",

        // MUSCLE Questions (М = Мускули)
        mus_age: "[Мускули] Възраст",
        mus_main_problem: "[Мускули] Основен проблем",
        mus_name: "[Мускули] Име",
        mus_profession: "[Мускули] Професия",
        mus_work_stress: "[Мускули] Стрес от работа",
        mus_height: "[Мускули] Височина",
        mus_weight: "[Мускули] Тегло",
        mus_body_fat: "[Мускули] Телесни мазнини %",
        mus_nutrition_regime: "[Мускули] Хранителен режим",
        mus_smoking: "[Мускули] Пушене",
        mus_alcohol: "[Мускули] Алкохол",
        mus_sleep_hours: "[Мускули] Часове сън",
        mus_training_frequency: "[Мускули] Честота тренировки",
        mus_progress_rating: "[Мускули] Оценка на прогреса",
        mus_frustration: "[Мускули] Разочарование",
        mus_change_one_thing: "[Мускули] Желана промяна",
        mus_tried_solutions: "[Мускули] Опитвани решения",
        mus_important_factor: "[Мускули] Най-важен фактор",
        mus_vision: "[Мускули] Визия след 30 дни",
        mus_workout_location: "[Мускули] Локация тренировки",
        mus_dietary_preference: "[Мускули] Хранителни предпочитания",

        // Legacy/generic
        age_range: "Възрастова група",
      }

      // Helper to get readable question label
      const getQuestionLabel = (questionId: string): string => {
        return QUESTION_LABELS[questionId] || questionId
      }

      // Helper to get readable answer
      const getReadableAnswer = (code: string): string => {
        if (!code) return ''
        return ANSWER_LABELS[code] || code
      }

      // Get all quiz results with full data
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results_v2')
        .select('*')
        .order('created_at', { ascending: false })

      if (quizError) throw quizError

      // PRIORITY 1: Get answers from quiz_responses table (linked by result_id)
      // This is where the quiz app saves individual answers
      let allResponses: any[] = []
      let responseOffset = 0
      const responseBatchSize = 1000

      while (true) {
        const { data: batch, error: responsesError } = await supabase
          .from('quiz_responses')
          .select('result_id, question_id, answer, points')
          .range(responseOffset, responseOffset + responseBatchSize - 1)

        if (responsesError) {
          console.log('[CSV Export] quiz_responses table error (may not exist):', responsesError.message)
          break
        }

        if (!batch || batch.length === 0) break

        allResponses = allResponses.concat(batch)
        responseOffset += responseBatchSize

        if (responseOffset > 100000) break
      }

      console.log('[CSV Export] Total quiz_responses:', allResponses.length)

      // Create map: result_id -> { question_id: answer }
      const answersByResultId: Record<string, Record<string, string>> = {}
      allResponses.forEach(response => {
        if (!answersByResultId[response.result_id]) {
          answersByResultId[response.result_id] = {}
        }
        if (response.question_id && response.answer) {
          answersByResultId[response.result_id][response.question_id] = response.answer
        }
      })

      console.log('[CSV Export] Results with quiz_responses:', Object.keys(answersByResultId).length)

      // PRIORITY 2: Get answers from quiz_step_events (fallback for sessions without quiz_responses)
      let allEvents: any[] = []
      let eventOffset = 0
      const eventBatchSize = 1000

      while (true) {
        const { data: batch, error: eventsError } = await supabase
          .from('quiz_step_events')
          .select('session_id, step_number, question_id, event_type, answer_value, time_spent_seconds')
          .eq('event_type', 'answer_selected')
          .range(eventOffset, eventOffset + eventBatchSize - 1)
          .order('session_id')
          .order('step_number')

        if (eventsError) throw eventsError

        if (!batch || batch.length === 0) break

        allEvents = allEvents.concat(batch)
        eventOffset += eventBatchSize

        if (eventOffset > 100000) break
      }

      console.log('[CSV Export] Total quiz_step_events:', allEvents.length)

      // Group answers by session_id (for abandoned sessions without quiz_responses)
      const answersBySession: Record<string, Record<string, string>> = {}
      allEvents?.forEach(event => {
        if (!answersBySession[event.session_id]) {
          answersBySession[event.session_id] = {}
        }
        if (event.question_id && event.answer_value) {
          answersBySession[event.session_id][event.question_id] = event.answer_value
        }
      })

      console.log('[CSV Export] Sessions with step_events:', Object.keys(answersBySession).length)

      // Get unique question IDs from BOTH sources for CSV columns
      const allQuestionIds = new Set<string>()
      // From quiz_responses (completed quizzes)
      Object.values(answersByResultId).forEach(answers => {
        Object.keys(answers).forEach(qId => allQuestionIds.add(qId))
      })
      // From quiz_step_events (newer tracking + abandoned)
      Object.values(answersBySession).forEach(answers => {
        Object.keys(answers).forEach(qId => allQuestionIds.add(qId))
      })
      const questionColumns = Array.from(allQuestionIds).sort()

      // Build CSV rows
      const csvRows: string[][] = []

      // Header row - with Bulgarian labels
      const headers = [
        'Email',
        'Име',
        'Статус',
        'Категория',
        'Общ Score',
        'Ниво',
        'Локация',
        'Score: Симптоми',
        'Score: Хранене',
        'Score: Тренировки',
        'Score: Сън',
        'Score: Контекст',
        'Session ID',
        'Дата',
        ...questionColumns.map(q => getQuestionLabel(q))
      ]
      csvRows.push(headers)

      // Level labels
      const LEVEL_LABELS: Record<string, string> = {
        low: 'Нисък',
        moderate: 'Умерен',
        good: 'Добър',
        optimal: 'Оптимален'
      }

      // Category labels
      const CATEGORY_LABELS: Record<string, string> = {
        energy: 'Енергия',
        libido: 'Либидо',
        muscle: 'Мускулна маса'
      }

      // Data rows - all from quiz_results_v2 are completed
      quizResults?.forEach(result => {
        // Priority 1: quiz_responses (linked by result_id) - has answers for completed quizzes
        // Priority 2: quiz_step_events (linked by session_id) - fallback for newer tracking
        const responseAnswers = answersByResultId[result.id] || {}
        const stepAnswers = answersBySession[result.session_id] || {}
        // Merge both sources - responseAnswers takes priority
        const sessionAnswers = { ...stepAnswers, ...responseAnswers }
        const hasAnswers = Object.keys(sessionAnswers).length > 0
        const row = [
          result.email || '',
          result.first_name || '',
          'Завършен', // All records in quiz_results_v2 are completed quizzes
          CATEGORY_LABELS[result.category] || result.category || '',
          String(result.total_score || ''),
          LEVEL_LABELS[result.determined_level] || result.determined_level || '',
          result.workout_location === 'home' ? 'Вкъщи' : result.workout_location === 'gym' ? 'Фитнес' : result.workout_location || '',
          String(result.breakdown_symptoms || ''),
          String(result.breakdown_nutrition || ''),
          String(result.breakdown_training || ''),
          String(result.breakdown_sleep_recovery || ''),
          String(result.breakdown_context || ''),
          result.session_id || '',
          result.created_at ? new Date(result.created_at).toLocaleString('bg-BG') : '',
          ...questionColumns.map(qId => getReadableAnswer(sessionAnswers[qId] || ''))
        ]
        csvRows.push(row)
      })

      // Add abandoned sessions (sessions with step events but no quiz completion)
      const completedSessionIds = new Set(quizResults?.map(r => r.session_id) || [])
      const allTrackedSessionIds = Object.keys(answersBySession)

      allTrackedSessionIds.forEach(sessionId => {
        if (!completedSessionIds.has(sessionId)) {
          // This is an abandoned session
          const sessionAnswers = answersBySession[sessionId] || {}

          // Try to extract name from answers (could be in eng_name, lib_name, or mus_name)
          const name = sessionAnswers['eng_name'] || sessionAnswers['lib_name'] || sessionAnswers['mus_name'] || ''

          // Determine category from answer keys
          let category = ''
          const answerKeys = Object.keys(sessionAnswers)
          if (answerKeys.some(k => k.startsWith('eng_'))) category = 'Енергия'
          else if (answerKeys.some(k => k.startsWith('lib_'))) category = 'Либидо'
          else if (answerKeys.some(k => k.startsWith('mus_'))) category = 'Мускулна маса'

          const row = [
            '', // No email for abandoned
            name,
            'Напуснал', // Abandoned status
            category,
            '', // No score
            '', // No level
            '', // No location
            '', // No breakdown
            '',
            '',
            '',
            '',
            sessionId,
            '', // No completion date
            ...questionColumns.map(qId => getReadableAnswer(sessionAnswers[qId] || ''))
          ]
          csvRows.push(row)
        }
      })

      // Convert to CSV string
      const escapeCSV = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      const csvContent = csvRows.map(row => row.map(escapeCSV).join(',')).join('\n')

      // Return as CSV file
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="quiz-data-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // ============ EMAIL CAMPAIGNS VIEW ============
    // Email campaign tracking and stats from Resend API
    if (view === 'email-campaigns') {
      const resendApiKey = process.env.RESEND_API_KEY

      if (!resendApiKey) {
        return NextResponse.json({
          error: 'RESEND_API_KEY not configured',
          view: 'email-campaigns',
          stats: { total: 0, sent: 0, delivered: 0, bounced: 0, complained: 0 },
          recentEmails: [],
          dailyTrend: []
        })
      }

      try {
        // Fetch emails from Resend API (max 100 per request)
        // We'll fetch multiple pages to get more data
        let allEmails: any[] = []
        let hasMore = true
        let lastEmailId: string | null = null
        let pageCount = 0
        const maxPages = 5 // Fetch up to 500 emails

        while (hasMore && pageCount < maxPages) {
          const url = lastEmailId
            ? `https://api.resend.com/emails?limit=100&after=${lastEmailId}`
            : 'https://api.resend.com/emails?limit=100'

          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Resend API error:', response.status, errorText)
            break
          }

          const data = await response.json()
          const emails = data.data || []
          allEmails = [...allEmails, ...emails]
          hasMore = data.has_more === true && emails.length > 0

          if (emails.length > 0) {
            lastEmailId = emails[emails.length - 1].id
          }
          pageCount++
        }

        // Calculate stats based on last_event
        const totalEmails = allEmails.length
        const deliveredEmails = allEmails.filter(e => e.last_event === 'delivered').length
        const bouncedEmails = allEmails.filter(e => e.last_event === 'bounced').length
        const complainedEmails = allEmails.filter(e => e.last_event === 'complained').length
        const openedEmails = allEmails.filter(e => e.last_event === 'opened' || e.last_event === 'clicked').length
        const clickedEmails = allEmails.filter(e => e.last_event === 'clicked').length

        // Calculate rates
        const deliveryRate = totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 0
        const bounceRate = totalEmails > 0 ? Math.round((bouncedEmails / totalEmails) * 100) : 0
        const openRate = deliveredEmails > 0 ? Math.round((openedEmails / deliveredEmails) * 100) : 0
        const clickRate = deliveredEmails > 0 ? Math.round((clickedEmails / deliveredEmails) * 100) : 0

        // Daily trend (last 30 days)
        const now = new Date()
        const dailyTrend: { date: string; sent: number; delivered: number; bounced: number }[] = []
        for (let i = 29; i >= 0; i--) {
          const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
          const dayStr = dayStart.toISOString().split('T')[0]

          const daySent = allEmails.filter(e => {
            const createdAt = new Date(e.created_at)
            return createdAt >= dayStart && createdAt < dayEnd
          }).length

          const dayDelivered = allEmails.filter(e => {
            const createdAt = new Date(e.created_at)
            return createdAt >= dayStart && createdAt < dayEnd && e.last_event === 'delivered'
          }).length

          const dayBounced = allEmails.filter(e => {
            const createdAt = new Date(e.created_at)
            return createdAt >= dayStart && createdAt < dayEnd && e.last_event === 'bounced'
          }).length

          dailyTrend.push({ date: dayStr, sent: daySent, delivered: dayDelivered, bounced: dayBounced })
        }

        // Recent emails (last 50)
        const recentEmails = allEmails.slice(0, 50).map(email => ({
          id: email.id,
          recipient: Array.isArray(email.to) ? email.to.join(', ') : email.to,
          from: email.from,
          subject: email.subject,
          status: email.last_event,
          createdAt: email.created_at,
          scheduledAt: email.scheduled_at
        }))

        // Top recipients
        const recipientCounts: Record<string, { email: string; count: number; delivered: number; bounced: number }> = {}
        allEmails.forEach(email => {
          const recipients = Array.isArray(email.to) ? email.to : [email.to]
          recipients.forEach((recipientEmail: string) => {
            const emailLower = recipientEmail?.toLowerCase()
            if (!emailLower) return
            if (!recipientCounts[emailLower]) {
              recipientCounts[emailLower] = { email: emailLower, count: 0, delivered: 0, bounced: 0 }
            }
            recipientCounts[emailLower].count++
            if (email.last_event === 'delivered') recipientCounts[emailLower].delivered++
            if (email.last_event === 'bounced') recipientCounts[emailLower].bounced++
          })
        })

        const topRecipients = Object.values(recipientCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)

        // Group by subject (as proxy for template)
        const subjectStats: Record<string, { subject: string; sent: number; delivered: number; bounced: number }> = {}
        allEmails.forEach(email => {
          const subject = email.subject || 'No Subject'
          if (!subjectStats[subject]) {
            subjectStats[subject] = { subject, sent: 0, delivered: 0, bounced: 0 }
          }
          subjectStats[subject].sent++
          if (email.last_event === 'delivered') subjectStats[subject].delivered++
          if (email.last_event === 'bounced') subjectStats[subject].bounced++
        })

        return NextResponse.json({
          view: 'email-campaigns',
          source: 'resend',
          stats: {
            total: totalEmails,
            sent: totalEmails,
            delivered: deliveredEmails,
            bounced: bouncedEmails,
            complained: complainedEmails,
            opened: openedEmails,
            clicked: clickedEmails,
            deliveryRate,
            bounceRate,
            openRate,
            clickRate
          },
          subjectStats: Object.values(subjectStats).sort((a, b) => b.sent - a.sent).slice(0, 10),
          dailyTrend,
          recentEmails,
          topRecipients
        })
      } catch (error) {
        console.error('Error fetching from Resend:', error)
        return NextResponse.json({
          error: 'Failed to fetch emails from Resend',
          view: 'email-campaigns',
          stats: { total: 0, sent: 0, delivered: 0, bounced: 0 },
          recentEmails: [],
          dailyTrend: []
        }, { status: 500 })
      }
    }

    // ============ RETENTION VIEW ============
    // DAU/WAU/MAU and churn rate metrics
    if (view === 'retention') {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000)
      const prevMonthStart = new Date(todayStart.getTime() - 60 * 24 * 60 * 60 * 1000)
      const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Get all quiz results for activity tracking
      const { data: quizResults } = await supabase
        .from('quiz_results_v2')
        .select('email, created_at')
        .not('email', 'is', null)

      // Get all app users with their last activity
      const { data: appUsers } = await supabase
        .from('app_users')
        .select('email, created_at, updated_at')

      // Get all orders
      const { data: orders } = await supabase
        .from('pending_orders')
        .select('email, created_at')
        .not('email', 'is', null)

      // Get workout sessions for activity
      const { data: workoutSessions } = await supabase
        .from('workout_sessions')
        .select('user_email, created_at')

      // Get meal completions for activity
      const { data: mealCompletions } = await supabase
        .from('meal_completions')
        .select('user_email, created_at')

      // Get supplement tracking for activity
      const { data: supplementTracking } = await supabase
        .from('supplement_tracking')
        .select('user_email, created_at')

      // Build user activity map - last activity date per email
      const userActivity: Record<string, Date> = {}

      const updateActivity = (email: string | null, dateStr: string) => {
        if (!email) return
        const emailLower = email.toLowerCase()
        const date = new Date(dateStr)
        if (!userActivity[emailLower] || date > userActivity[emailLower]) {
          userActivity[emailLower] = date
        }
      }

      // Track all activities
      quizResults?.forEach(r => updateActivity(r.email, r.created_at))
      appUsers?.forEach(u => {
        updateActivity(u.email, u.created_at)
        if (u.updated_at) updateActivity(u.email, u.updated_at)
      })
      orders?.forEach(o => updateActivity(o.email, o.created_at))
      workoutSessions?.forEach(w => updateActivity(w.user_email, w.created_at))
      mealCompletions?.forEach(m => updateActivity(m.user_email, m.created_at))
      supplementTracking?.forEach(s => updateActivity(s.user_email, s.created_at))

      // Calculate DAU/WAU/MAU
      let dau = 0, wau = 0, mau = 0
      let prevWau = 0, prevMau = 0

      Object.values(userActivity).forEach(lastActive => {
        if (lastActive >= todayStart) dau++
        if (lastActive >= weekStart) wau++
        if (lastActive >= monthStart) mau++
        if (lastActive >= prevWeekStart && lastActive < weekStart) prevWau++
        if (lastActive >= prevMonthStart && lastActive < monthStart) prevMau++
      })

      // Calculate churn rate (users active in prev period but not in current)
      // Churn = (Users lost) / (Users at start of period)
      const weeklyChurn = prevWau > 0 ? Math.round(((prevWau - (wau - dau)) / prevWau) * 100) : 0
      const monthlyChurn = prevMau > 0 ? Math.round(((prevMau - mau) / prevMau) * 100) : 0

      // Get daily trend for the last 30 days
      const dailyTrend: { date: string; activeUsers: number; newUsers: number }[] = []

      // Build first activity date map
      const firstActivity: Record<string, Date> = {}
      quizResults?.forEach(r => {
        if (!r.email) return
        const emailLower = r.email.toLowerCase()
        const date = new Date(r.created_at)
        if (!firstActivity[emailLower] || date < firstActivity[emailLower]) {
          firstActivity[emailLower] = date
        }
      })

      for (let i = 29; i >= 0; i--) {
        const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

        let activeCount = 0
        let newCount = 0

        Object.entries(userActivity).forEach(([email, lastActive]) => {
          if (lastActive >= dayStart && lastActive < dayEnd) {
            activeCount++
          }
        })

        Object.entries(firstActivity).forEach(([email, first]) => {
          if (first >= dayStart && first < dayEnd) {
            newCount++
          }
        })

        dailyTrend.push({
          date: dayStart.toISOString().split('T')[0],
          activeUsers: activeCount,
          newUsers: newCount
        })
      }

      // Calculate weekly trend for the last 12 weeks
      const weeklyTrend: { week: string; activeUsers: number; newUsers: number; retention: number }[] = []

      for (let i = 11; i >= 0; i--) {
        const weekStartDate = new Date(todayStart.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
        const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        const prevWeekStartDate = new Date(weekStartDate.getTime() - 7 * 24 * 60 * 60 * 1000)

        let activeCount = 0
        let newCount = 0
        let prevWeekActive = 0
        let retainedFromPrevWeek = 0

        const activeThisWeek = new Set<string>()
        const activePrevWeek = new Set<string>()

        Object.entries(userActivity).forEach(([email, lastActive]) => {
          if (lastActive >= weekStartDate && lastActive < weekEndDate) {
            activeCount++
            activeThisWeek.add(email)
          }
          if (lastActive >= prevWeekStartDate && lastActive < weekStartDate) {
            activePrevWeek.add(email)
          }
        })

        Object.entries(firstActivity).forEach(([email, first]) => {
          if (first >= weekStartDate && first < weekEndDate) {
            newCount++
          }
        })

        // Count retained users (active in both weeks)
        activeThisWeek.forEach(email => {
          if (activePrevWeek.has(email)) {
            retainedFromPrevWeek++
          }
        })

        const retention = activePrevWeek.size > 0
          ? Math.round((retainedFromPrevWeek / activePrevWeek.size) * 100)
          : 0

        weeklyTrend.push({
          week: weekStartDate.toISOString().split('T')[0],
          activeUsers: activeCount,
          newUsers: newCount,
          retention
        })
      }

      // Engagement metrics by activity type
      const engagementByType = {
        quiz: quizResults?.length || 0,
        orders: orders?.length || 0,
        workouts: workoutSessions?.length || 0,
        meals: mealCompletions?.length || 0,
        supplements: supplementTracking?.length || 0
      }

      return NextResponse.json({
        view: 'retention',
        metrics: {
          dau,
          wau,
          mau,
          totalUsers: Object.keys(userActivity).length,
          weeklyChurn: Math.max(0, weeklyChurn),
          monthlyChurn: Math.max(0, monthlyChurn),
          wauGrowth: prevWau > 0 ? Math.round(((wau - prevWau) / prevWau) * 100) : 0,
          mauGrowth: prevMau > 0 ? Math.round(((mau - prevMau) / prevMau) * 100) : 0
        },
        dailyTrend,
        weeklyTrend,
        engagementByType
      })
    }

    // ============ STEP HEATMAP VIEW ============
    // Visualization of time spent per quiz question
    if (view === 'step-heatmap') {
      // Get all step events with time data
      let query = supabase
        .from('quiz_step_events')
        .select('session_id, category, step_number, question_id, event_type, time_spent_seconds, created_at')
        .eq('event_type', 'step_exited')
        .not('time_spent_seconds', 'is', null)
        .gte('created_at', startDateStr)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data: stepEvents, error: stepError } = await query

      if (stepError) {
        console.error('Step heatmap error:', stepError)
        return NextResponse.json({ error: stepError.message }, { status: 500 })
      }

      // Group by question and calculate stats
      interface StepStats {
        questionId: string;
        stepNumber: number;
        sampleCount: number;
        totalTime: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
        times: number[];
        categories: Record<string, { count: number; totalTime: number }>;
      }

      const stepStats: Record<string, StepStats> = {}

      stepEvents?.forEach(event => {
        const key = event.question_id || `step_${event.step_number}`
        const time = event.time_spent_seconds || 0

        if (!stepStats[key]) {
          stepStats[key] = {
            questionId: key,
            stepNumber: event.step_number,
            sampleCount: 0,
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            times: [],
            categories: {}
          }
        }

        stepStats[key].sampleCount++
        stepStats[key].totalTime += time
        stepStats[key].times.push(time)
        stepStats[key].minTime = Math.min(stepStats[key].minTime, time)
        stepStats[key].maxTime = Math.max(stepStats[key].maxTime, time)

        // Track by category
        const cat = event.category || 'unknown'
        if (!stepStats[key].categories[cat]) {
          stepStats[key].categories[cat] = { count: 0, totalTime: 0 }
        }
        stepStats[key].categories[cat].count++
        stepStats[key].categories[cat].totalTime += time
      })

      // Calculate averages and percentiles
      const heatmapData = Object.values(stepStats).map(stats => {
        stats.avgTime = stats.sampleCount > 0 ? stats.totalTime / stats.sampleCount : 0

        // Calculate median
        const sorted = [...stats.times].sort((a, b) => a - b)
        const median = sorted.length > 0
          ? (sorted.length % 2 === 0
              ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
              : sorted[Math.floor(sorted.length / 2)])
          : 0

        // Calculate p90
        const p90Index = Math.floor(sorted.length * 0.9)
        const p90 = sorted[p90Index] || stats.maxTime

        // Category breakdown
        const categoryBreakdown = Object.entries(stats.categories).map(([cat, data]) => ({
          category: cat,
          count: data.count,
          avgTime: data.count > 0 ? data.totalTime / data.count : 0
        }))

        return {
          questionId: stats.questionId,
          stepNumber: stats.stepNumber,
          sampleCount: stats.sampleCount,
          avgTime: Math.round(stats.avgTime * 10) / 10,
          medianTime: Math.round(median * 10) / 10,
          minTime: Math.round(stats.minTime * 10) / 10,
          maxTime: Math.round(stats.maxTime * 10) / 10,
          p90Time: Math.round(p90 * 10) / 10,
          categoryBreakdown
        }
      }).sort((a, b) => a.stepNumber - b.stepNumber)

      // Calculate overall stats
      const totalSamples = heatmapData.reduce((sum, s) => sum + s.sampleCount, 0)
      const avgAllTime = totalSamples > 0
        ? heatmapData.reduce((sum, s) => sum + s.avgTime * s.sampleCount, 0) / totalSamples
        : 0

      // Find slowest and fastest questions
      const slowestQuestions = [...heatmapData]
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 5)

      const fastestQuestions = [...heatmapData]
        .filter(q => q.sampleCount > 10) // Only include questions with enough data
        .sort((a, b) => a.avgTime - b.avgTime)
        .slice(0, 5)

      // Calculate time distribution buckets
      const timeBuckets = {
        '0-5s': 0,
        '5-15s': 0,
        '15-30s': 0,
        '30-60s': 0,
        '60s+': 0
      }

      stepEvents?.forEach(event => {
        const time = event.time_spent_seconds || 0
        if (time <= 5) timeBuckets['0-5s']++
        else if (time <= 15) timeBuckets['5-15s']++
        else if (time <= 30) timeBuckets['15-30s']++
        else if (time <= 60) timeBuckets['30-60s']++
        else timeBuckets['60s+']++
      })

      return NextResponse.json({
        heatmapData,
        summary: {
          totalSamples,
          avgTimePerStep: Math.round(avgAllTime * 10) / 10,
          totalQuestions: heatmapData.length,
          slowestQuestions,
          fastestQuestions,
          timeBuckets
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
