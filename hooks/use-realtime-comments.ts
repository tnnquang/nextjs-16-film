/**
 * React Hook for Real-time Comments
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Comment,
  subscribeToComments,
  unsubscribeFromComments,
  fetchComments,
  postComment,
  toggleCommentLike,
} from '@/lib/realtime/comments'
import { useToast } from '@/hooks/use-toast'

export function useRealtimeComments(movieId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch initial comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true)
        const data = await fetchComments(movieId)
        setComments(data)
        setError(null)
      } catch (err) {
        setError('Failed to load comments')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [movieId])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeToComments(movieId, (event, comment) => {
      if (event === 'INSERT') {
        setComments((prev) => [comment, ...prev])
      } else if (event === 'UPDATE') {
        setComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)))
      } else if (event === 'DELETE') {
        setComments((prev) => prev.filter((c) => c.id !== comment.id))
      }
    })

    return () => {
      unsubscribeFromComments(channel)
    }
  }, [movieId])

  // Post a new comment
  const addComment = useCallback(
    async (userId: string, content: string, parentId?: string) => {
      try {
        await postComment(movieId, userId, content, parentId)
        toast({
          title: 'Thành công',
          description: 'Bình luận của bạn đã được đăng',
        })
      } catch (err) {
        toast({
          title: 'Lỗi',
          description: 'Không thể đăng bình luận',
          variant: 'destructive',
        })
        console.error(err)
      }
    },
    [movieId, toast]
  )

  // Toggle like on a comment
  const likeComment = useCallback(
    async (commentId: string, userId: string) => {
      try {
        const { liked, count } = await toggleCommentLike(commentId, userId)

        // Update local state optimistically
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: count } : c))
        )

        toast({
          title: liked ? 'Đã thích' : 'Bỏ thích',
          description: liked ? 'Bạn đã thích bình luận này' : 'Bạn đã bỏ thích bình luận này',
        })
      } catch (err) {
        toast({
          title: 'Lỗi',
          description: 'Không thể cập nhật',
          variant: 'destructive',
        })
        console.error(err)
      }
    },
    [toast]
  )

  return {
    comments,
    loading,
    error,
    addComment,
    likeComment,
  }
}
