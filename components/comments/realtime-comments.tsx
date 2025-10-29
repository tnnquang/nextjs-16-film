/**
 * Real-time Comments Component
 */

'use client'

import { useState } from 'react'
import { useRealtimeComments } from '@/hooks/use-realtime-comments'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface RealtimeCommentsProps {
  movieId: string
  userId?: string
  userName?: string
}

export function RealtimeComments({ movieId, userId, userName }: RealtimeCommentsProps) {
  const { comments, loading, addComment, likeComment } = useRealtimeComments(movieId)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newComment.trim()) return

    setSubmitting(true)
    try {
      await addComment(userId, newComment.trim(), replyTo || undefined)
      setNewComment('')
      setReplyTo(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!userId) return
    await likeComment(commentId, userId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Bình luận ({comments.length})</h3>

        {/* Comment Form */}
        {userId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {replyTo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Đang trả lời bình luận</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  Hủy
                </Button>
              </div>
            )}
            
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="min-h-[100px]"
              disabled={submitting}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-muted rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              Đăng nhập để bình luận
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                {comment.user_avatar ? (
                  <img src={comment.user_avatar} alt={comment.user_name} />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {comment.user_name[0].toUpperCase()}
                  </div>
                )}
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    disabled={!userId}
                  >
                    <Heart className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>

                  {userId && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="hover:text-primary transition-colors"
                    >
                      Trả lời
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
