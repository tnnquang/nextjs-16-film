/**
 * Real-time Analytics Dashboard
 * Provides live metrics and insights for admin dashboard
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeDashboardMetrics {
  currentViewers: number
  activeMovies: Array<{ movie_id: string; viewers: number; movie_name?: string }>
  recentActivities: Array<{ type: string; count: number }>
  systemHealth: {
    avgBufferTime: number
    errorRate: number
    averageQuality: string
  }
  userEngagement: {
    newUsers: number
    activeUsers: number
    returningUsers: number
  }
}

export interface DashboardCallback {
  (metrics: RealtimeDashboardMetrics): void
}

/**
 * Subscribe to real-time dashboard metrics
 */
export function subscribeToRealtimeDashboard(callback: DashboardCallback): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel('realtime_dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'watch_sessions' }, () => {
      // Refresh metrics when watch sessions change
      fetchDashboardMetrics().then(callback)
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
      // Refresh metrics when activities change
      fetchDashboardMetrics().then(callback)
    })
    .subscribe()

  // Initial fetch
  fetchDashboardMetrics().then(callback)

  // Periodic refresh every 30 seconds
  const interval = setInterval(() => {
    fetchDashboardMetrics().then(callback)
  }, 30000)

  // Store interval for cleanup
  ;(channel as any)._interval = interval

  return channel
}

/**
 * Unsubscribe from real-time dashboard
 */
export function unsubscribeFromRealtimeDashboard(channel: RealtimeChannel): void {
  if ((channel as any)._interval) {
    clearInterval((channel as any)._interval)
  }
  channel.unsubscribe()
}

/**
 * Fetch current dashboard metrics
 */
export async function fetchDashboardMetrics(): Promise<RealtimeDashboardMetrics> {
  const supabase = createClient()
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Get current active sessions (started in last 5 minutes and not ended)
  const { data: activeSessions } = await supabase
    .from('watch_sessions')
    .select('movie_id, user_id')
    .gte('start_time', fiveMinutesAgo.toISOString())
    .is('end_time', null)

  const currentViewers = activeSessions?.length || 0

  // Group by movie
  const movieViewers = new Map<string, number>()
  activeSessions?.forEach((session) => {
    movieViewers.set(session.movie_id, (movieViewers.get(session.movie_id) || 0) + 1)
  })

  const activeMovies = Array.from(movieViewers.entries())
    .map(([movie_id, viewers]) => ({ movie_id, viewers }))
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, 10)

  // Get recent activities (last 24 hours)
  const { data: activities } = await supabase
    .from('activities')
    .select('type')
    .gte('created_at', oneDayAgo.toISOString())

  const activityCounts = new Map<string, number>()
  activities?.forEach((activity) => {
    activityCounts.set(activity.type, (activityCounts.get(activity.type) || 0) + 1)
  })

  const recentActivities = Array.from(activityCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Get system health metrics (last 24 hours)
  const { data: sessions } = await supabase
    .from('watch_sessions')
    .select('total_buffer_time, buffer_count, quality_used')
    .gte('start_time', oneDayAgo.toISOString())

  let totalBufferTime = 0
  let totalSessions = sessions?.length || 1
  const qualityCounts = new Map<string, number>()

  sessions?.forEach((session) => {
    totalBufferTime += session.total_buffer_time || 0
    session.quality_used?.forEach((quality: string) => {
      qualityCounts.set(quality, (qualityCounts.get(quality) || 0) + 1)
    })
  })

  const avgBufferTime = totalBufferTime / totalSessions
  const mostUsedQuality =
    Array.from(qualityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'auto'

  // Get video errors (last 24 hours)
  const { data: errors } = await supabase
    .from('video_events')
    .select('id')
    .eq('event_type', 'error')
    .gte('created_at', oneDayAgo.toISOString())

  const { data: totalEvents } = await supabase
    .from('video_events')
    .select('id')
    .gte('created_at', oneDayAgo.toISOString())

  const errorRate = (errors?.length || 0) / Math.max(totalEvents?.length || 1, 1)

  // Get user engagement metrics
  const { data: newUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('created_at', oneDayAgo.toISOString())

  const { data: activeUsers } = await supabase
    .from('watch_sessions')
    .select('user_id')
    .gte('start_time', oneDayAgo.toISOString())

  const uniqueActiveUsers = new Set(activeUsers?.map((s) => s.user_id) || []).size

  return {
    currentViewers,
    activeMovies,
    recentActivities,
    systemHealth: {
      avgBufferTime,
      errorRate: errorRate * 100,
      averageQuality: mostUsedQuality,
    },
    userEngagement: {
      newUsers: newUsers?.length || 0,
      activeUsers: uniqueActiveUsers,
      returningUsers: Math.max(0, uniqueActiveUsers - (newUsers?.length || 0)),
    },
  }
}

/**
 * Get historical analytics data
 */
export async function getHistoricalAnalytics(
  timeRange: '7d' | '30d' | '90d'
): Promise<{
  daily: Array<{ date: string; views: number; users: number; watchTime: number }>
  topMovies: Array<{ movie_id: string; views: number; watchTime: number }>
  userRetention: Array<{ cohort: string; retention: number[] }>
}> {
  const supabase = createClient()
  const now = new Date()
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // Get daily metrics
  const { data: sessions } = await supabase
    .from('watch_sessions')
    .select('start_time, user_id, movie_id, total_watch_time')
    .gte('start_time', startDate.toISOString())

  // Group by date
  const dailyMetrics = new Map<
    string,
    { views: number; users: Set<string>; watchTime: number }
  >()

  sessions?.forEach((session) => {
    const date = new Date(session.start_time).toISOString().split('T')[0]
    const existing = dailyMetrics.get(date) || { views: 0, users: new Set(), watchTime: 0 }
    existing.views += 1
    existing.users.add(session.user_id)
    existing.watchTime += session.total_watch_time || 0
    dailyMetrics.set(date, existing)
  })

  const daily = Array.from(dailyMetrics.entries())
    .map(([date, { views, users, watchTime }]) => ({
      date,
      views,
      users: users.size,
      watchTime,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Get top movies
  const movieMetrics = new Map<string, { views: number; watchTime: number }>()

  sessions?.forEach((session) => {
    const existing = movieMetrics.get(session.movie_id) || { views: 0, watchTime: 0 }
    existing.views += 1
    existing.watchTime += session.total_watch_time || 0
    movieMetrics.set(session.movie_id, existing)
  })

  const topMovies = Array.from(movieMetrics.entries())
    .map(([movie_id, { views, watchTime }]) => ({ movie_id, views, watchTime }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20)

  // User retention (simplified cohort analysis)
  const userRetention: Array<{ cohort: string; retention: number[] }> = []
  // This would require more complex logic to track user cohorts over time

  return {
    daily,
    topMovies,
    userRetention,
  }
}

/**
 * Export analytics data for reporting
 */
export async function exportAnalyticsData(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const supabase = createClient()

  const { data: sessions } = await supabase
    .from('watch_sessions')
    .select('*')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const exportData = {
    sessions: sessions || [],
    activities: activities || [],
    summary: {
      totalSessions: sessions?.length || 0,
      totalActivities: activities?.length || 0,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    },
  }

  if (format === 'json') {
    return JSON.stringify(exportData, null, 2)
  } else {
    // Convert to CSV (simplified)
    const csv: string[] = []
    csv.push('Type,Date,User ID,Movie ID,Value')

    sessions?.forEach((session) => {
      csv.push(
        `session,${session.start_time},${session.user_id},${session.movie_id},${session.total_watch_time}`
      )
    })

    activities?.forEach((activity) => {
      csv.push(
        `activity,${activity.created_at},${activity.user_id},${activity.movie_id || 'N/A'},${activity.type}`
      )
    })

    return csv.join('\n')
  }
}
