/**
 * Real-time Comments System using Supabase Realtime
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Comment {
  id: string
  movie_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  parent_id?: string
  likes: number
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  comment_id: string
  user_id: string
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
  created_at: string
}

export type CommentEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface CommentCallback {
  (event: CommentEvent, comment: Comment): void
}

/**
 * Subscribe to real-time comments for a movie
 */
export function subscribeToComments(
  movieId: string,
  callback: CommentCallback
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`comments:${movieId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `movie_id=eq.${movieId}`,
      },
      (payload) => {
        const event = payload.eventType as CommentEvent
        const comment = payload.new as Comment
        callback(event, comment)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from comments
 */
export function unsubscribeFromComments(channel: RealtimeChannel): void {
  channel.unsubscribe()
}

/**
 * Fetch comments for a movie
 */
export async function fetchComments(
  movieId: string,
  options: {
    limit?: number
    offset?: number
    sortBy?: 'created_at' | 'likes'
    order?: 'asc' | 'desc'
  } = {}
): Promise<Comment[]> {
  const { limit = 50, offset = 0, sortBy = 'created_at', order = 'desc' } = options

  const supabase = createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('movie_id', movieId)
    .is('parent_id', null) // Top-level comments only
    .order(sortBy, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data as Comment[]) || []
}

/**
 * Fetch replies for a comment
 */
export async function fetchReplies(commentId: string): Promise<Comment[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('parent_id', commentId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as Comment[]) || []
}

/**
 * Post a new comment
 */
export async function postComment(
  movieId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .single()

  const { data, error } = await supabase
    .from('comments')
    .insert({
      movie_id: movieId,
      user_id: userId,
      user_name: profile?.username || 'Anonymous',
      user_avatar: profile?.avatar_url,
      content,
      parent_id: parentId,
      likes: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as Comment
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string): Promise<Comment> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data as Comment
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) throw error
}

/**
 * Like/unlike a comment
 */
export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const supabase = createClient()

  // Check if already liked
  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Unlike
    await supabase.from('comment_likes').delete().eq('id', existing.id)

    // Decrement likes count
    const { data: comment } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', commentId)
      .single()

    const newCount = Math.max(0, (comment?.likes || 1) - 1)

    await supabase.from('comments').update({ likes: newCount }).eq('id', commentId)

    return { liked: false, count: newCount }
  } else {
    // Like
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId })

    // Increment likes count
    const { data: comment } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', commentId)
      .single()

    const newCount = (comment?.likes || 0) + 1

    await supabase.from('comments').update({ likes: newCount }).eq('id', commentId)

    return { liked: true, count: newCount }
  }
}

/**
 * Add a reaction to a comment
 */
export async function addReaction(
  commentId: string,
  userId: string,
  type: Reaction['type']
): Promise<Reaction> {
  const supabase = createClient()

  // Remove existing reaction from this user
  await supabase
    .from('comment_reactions')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId)

  // Add new reaction
  const { data, error } = await supabase
    .from('comment_reactions')
    .insert({ comment_id: commentId, user_id: userId, type })
    .select()
    .single()

  if (error) throw error
  return data as Reaction
}

/**
 * Get reactions for a comment
 */
export async function getReactions(commentId: string): Promise<Reaction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('comment_reactions')
    .select('*')
    .eq('comment_id', commentId)

  if (error) throw error
  return (data as Reaction[]) || []
}
