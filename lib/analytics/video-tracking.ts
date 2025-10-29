/**
 * Video Player Analytics Tracking
 * Track user viewing behavior and engagement metrics
 */

import { createClient } from '@/lib/supabase/client'

export interface VideoEvent {
  id?: string
  user_id: string
  movie_id: string
  episode?: number
  event_type: 'play' | 'pause' | 'seek' | 'complete' | 'buffer' | 'error' | 'quality_change'
  timestamp: number
  duration: number
  quality?: string
  buffer_time?: number
  error_message?: string
  created_at?: string
}

export interface WatchSession {
  id: string
  user_id: string
  movie_id: string
  episode?: number
  start_time: string
  end_time?: string
  total_watch_time: number
  completion_percentage: number
  quality_used: string[]
  buffer_count: number
  total_buffer_time: number
  device_type: string
  browser: string
  ip_address?: string
  location?: string
}

export interface VideoMetrics {
  movie_id: string
  total_views: number
  unique_viewers: number
  average_watch_time: number
  completion_rate: number
  engagement_score: number
  quality_distribution: Record<string, number>
  peak_viewing_times: Array<{ hour: number; views: number }>
  drop_off_points: Array<{ timestamp: number; percentage: number }>
}

/**
 * Track video event
 */
export async function trackVideoEvent(event: VideoEvent): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('video_events').insert({
    user_id: event.user_id,
    movie_id: event.movie_id,
    episode: event.episode,
    event_type: event.event_type,
    timestamp: event.timestamp,
    duration: event.duration,
    quality: event.quality,
    buffer_time: event.buffer_time,
    error_message: event.error_message,
  })

  if (error) console.error('Failed to track video event:', error)
}

/**
 * Start a watch session
 */
export async function startWatchSession(
  userId: string,
  movieId: string,
  episode?: number
): Promise<string> {
  const supabase = createClient()

  // Get device and browser info
  const deviceType = getDeviceType()
  const browser = getBrowserName()

  const { data, error } = await supabase
    .from('watch_sessions')
    .insert({
      user_id: userId,
      movie_id: movieId,
      episode,
      start_time: new Date().toISOString(),
      total_watch_time: 0,
      completion_percentage: 0,
      quality_used: ['auto'],
      buffer_count: 0,
      total_buffer_time: 0,
      device_type: deviceType,
      browser: browser,
    })
    .select()
    .single()

  if (error) throw error
  return data.id
}

/**
 * Update watch session
 */
export async function updateWatchSession(
  sessionId: string,
  updates: {
    total_watch_time?: number
    completion_percentage?: number
    quality_used?: string[]
    buffer_count?: number
    total_buffer_time?: number
  }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('watch_sessions').update(updates).eq('id', sessionId)

  if (error) console.error('Failed to update watch session:', error)
}

/**
 * End watch session
 */
export async function endWatchSession(sessionId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('watch_sessions')
    .update({
      end_time: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) console.error('Failed to end watch session:', error)
}

/**
 * Get watch progress for user
 */
export async function getWatchProgress(
  userId: string,
  movieId: string,
  episode?: number
): Promise<{ timestamp: number; percentage: number } | null> {
  const supabase = createClient()

  let query = supabase
    .from('watch_sessions')
    .select('total_watch_time, completion_percentage')
    .eq('user_id', userId)
    .eq('movie_id', movieId)
    .order('start_time', { ascending: false })
    .limit(1)

  if (episode !== undefined) {
    query = query.eq('episode', episode)
  }

  const { data, error } = await query.single()

  if (error || !data) return null

  return {
    timestamp: data.total_watch_time,
    percentage: data.completion_percentage,
  }
}

/**
 * Get video metrics for a movie
 */
export async function getVideoMetrics(
  movieId: string,
  timeRange?: { start: Date; end: Date }
): Promise<VideoMetrics> {
  const supabase = createClient()

  let query = supabase.from('watch_sessions').select('*').eq('movie_id', movieId)

  if (timeRange) {
    query = query
      .gte('start_time', timeRange.start.toISOString())
      .lte('start_time', timeRange.end.toISOString())
  }

  const { data: sessions, error } = await query

  if (error) throw error

  const sessions_data = (sessions || []) as WatchSession[]

  // Calculate metrics
  const totalViews = sessions_data.length
  const uniqueViewers = new Set(sessions_data.map((s) => s.user_id)).size
  const totalWatchTime = sessions_data.reduce((sum, s) => sum + s.total_watch_time, 0)
  const averageWatchTime = totalViews > 0 ? totalWatchTime / totalViews : 0
  const completedViews = sessions_data.filter((s) => s.completion_percentage >= 90).length
  const completionRate = totalViews > 0 ? completedViews / totalViews : 0

  // Calculate engagement score (0-100)
  const engagementScore =
    (completionRate * 40 + (averageWatchTime / 3600) * 30 + (uniqueViewers / totalViews) * 30) *
    100

  // Quality distribution
  const qualityDistribution: Record<string, number> = {}
  sessions_data.forEach((session) => {
    session.quality_used.forEach((quality) => {
      qualityDistribution[quality] = (qualityDistribution[quality] || 0) + 1
    })
  })

  // Peak viewing times (by hour)
  const hourCounts: Record<number, number> = {}
  sessions_data.forEach((session) => {
    const hour = new Date(session.start_time).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  const peakViewingTimes = Object.entries(hourCounts)
    .map(([hour, views]) => ({ hour: parseInt(hour), views }))
    .sort((a, b) => b.views - a.views)

  // Drop-off points (simplified - would need more detailed tracking)
  const dropOffPoints: Array<{ timestamp: number; percentage: number }> = []

  return {
    movie_id: movieId,
    total_views: totalViews,
    unique_viewers: uniqueViewers,
    average_watch_time: averageWatchTime,
    completion_rate: completionRate,
    engagement_score: Math.min(100, engagementScore),
    quality_distribution: qualityDistribution,
    peak_viewing_times: peakViewingTimes,
    drop_off_points: dropOffPoints,
  }
}

/**
 * Get trending movies based on watch metrics
 */
export async function getTrendingMovies(
  limit: number = 10,
  timeRange: '24h' | '7d' | '30d' = '24h'
): Promise<Array<{ movie_id: string; score: number; views: number }>> {
  const supabase = createClient()

  const now = new Date()
  const timeThresholds = {
    '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  }

  const { data: sessions, error } = await supabase
    .from('watch_sessions')
    .select('movie_id, completion_percentage, total_watch_time')
    .gte('start_time', timeThresholds[timeRange].toISOString())

  if (error) throw error

  const sessions_data = (sessions || []) as WatchSession[]

  // Calculate trending score for each movie
  const movieScores = new Map<string, { score: number; views: number }>()

  sessions_data.forEach((session) => {
    const existing = movieScores.get(session.movie_id) || { score: 0, views: 0 }
    
    // Score based on views, completion rate, and watch time
    const score =
      1 * 1.0 + // Each view counts as 1
      (session.completion_percentage / 100) * 2.0 + // Completion adds up to 2
      (session.total_watch_time / 3600) * 0.5 // Watch time adds bonus

    movieScores.set(session.movie_id, {
      score: existing.score + score,
      views: existing.views + 1,
    })
  })

  return Array.from(movieScores.entries())
    .map(([movie_id, { score, views }]) => ({ movie_id, score, views }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Helper: Get device type
 */
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

/**
 * Helper: Get browser name
 */
function getBrowserName(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera')) return 'Opera'
  return 'Other'
}
