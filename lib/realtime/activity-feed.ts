/**
 * Activity Feed System
 * Track and display user activities in real-time
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Activity {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  type: 'watch' | 'rate' | 'comment' | 'favorite' | 'follow' | 'share' | 'review'
  movie_id?: string
  movie_name?: string
  movie_poster?: string
  target_user_id?: string
  target_user_name?: string
  content?: string
  rating?: number
  created_at: string
}

export interface ActivityCallback {
  (activity: Activity): void
}

/**
 * Subscribe to activity feed for followed users
 */
export function subscribeToActivityFeed(
  userId: string,
  callback: ActivityCallback
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`activity_feed:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        // Filter to only show activities from followed users
        filter: `user_id=in.(SELECT following_id FROM follows WHERE follower_id='${userId}')`,
      },
      (payload) => {
        const activity = payload.new as Activity
        callback(activity)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from activity feed
 */
export function unsubscribeFromActivityFeed(channel: RealtimeChannel): void {
  channel.unsubscribe()
}

/**
 * Fetch activity feed
 */
export async function fetchActivityFeed(
  userId: string,
  options: {
    limit?: number
    offset?: number
    types?: Activity['type'][]
  } = {}
): Promise<Activity[]> {
  const { limit = 20, offset = 0, types } = options

  const supabase = createClient()

  // Get list of followed users
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (!follows || follows.length === 0) return []

  const followedUserIds = follows.map((f) => f.following_id)

  let query = supabase
    .from('activities')
    .select('*')
    .in('user_id', followedUserIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (types && types.length > 0) {
    query = query.in('type', types)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as Activity[]) || []
}

/**
 * Create a new activity
 */
export async function createActivity(
  userId: string,
  type: Activity['type'],
  data: {
    movieId?: string
    movieName?: string
    moviePoster?: string
    targetUserId?: string
    targetUserName?: string
    content?: string
    rating?: number
  }
): Promise<Activity> {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .single()

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      user_name: profile?.username || 'Anonymous',
      user_avatar: profile?.avatar_url,
      type,
      movie_id: data.movieId,
      movie_name: data.movieName,
      movie_poster: data.moviePoster,
      target_user_id: data.targetUserId,
      target_user_name: data.targetUserName,
      content: data.content,
      rating: data.rating,
    })
    .select()
    .single()

  if (error) throw error
  return activity as Activity
}

/**
 * Get user's own activity history
 */
export async function getUserActivityHistory(
  userId: string,
  options: {
    limit?: number
    offset?: number
    types?: Activity['type'][]
  } = {}
): Promise<Activity[]> {
  const { limit = 50, offset = 0, types } = options

  const supabase = createClient()

  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (types && types.length > 0) {
    query = query.in('type', types)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as Activity[]) || []
}

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  })

  if (error) throw error

  // Create activity
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', followingId)
    .single()

  await createActivity(followerId, 'follow', {
    targetUserId: followingId,
    targetUserName: profile?.username || 'User',
  })
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) throw error
}

/**
 * Get followers count
 */
export async function getFollowersCount(userId: string): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (error) throw error
  return count || 0
}

/**
 * Get following count
 */
export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  if (error) throw error
  return count || 0
}

/**
 * Check if user is following another user
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (error) return false
  return !!data
}

/**
 * Get trending activities (most engaging content)
 */
export async function getTrendingActivities(
  options: {
    limit?: number
    timeRange?: '1h' | '24h' | '7d' | '30d'
  } = {}
): Promise<Activity[]> {
  const { limit = 20, timeRange = '24h' } = options

  const supabase = createClient()

  // Calculate time threshold
  const now = new Date()
  const timeThresholds = {
    '1h': new Date(now.getTime() - 60 * 60 * 1000),
    '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  }

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .gte('created_at', timeThresholds[timeRange].toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as Activity[]) || []
}
