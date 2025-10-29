'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Reply, Trash2, Edit, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Comment {
  id: string;
  movie_slug: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface CommentsSectionProps {
  movieSlug: string;
}

export function CommentsSection({ movieSlug }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', movieSlug],
    queryFn: async () => {
      const response = await fetch(`/api/comments?movieSlug=${movieSlug}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      return data.data as Comment[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const commentsChannel = supabase
      .channel(`comments:${movieSlug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `movie_slug=eq.${movieSlug}`,
        },
        async (payload) => {
          // Fetch complete comment with user profile
          const response = await fetch(
            `/api/comments?movieSlug=${movieSlug}`
          );
          if (response.ok) {
            const data = await response.json();
            queryClient.setQueryData(['comments', movieSlug], data.data);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `movie_slug=eq.${movieSlug}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `movie_slug=eq.${movieSlug}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
        }
      )
      .subscribe();

    setChannel(commentsChannel);

    return () => {
      commentsChannel.unsubscribe();
    };
  }, [movieSlug, supabase, queryClient]);

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieSlug,
          content,
          parentId: replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create comment');
      }

      return response.json();
    },
    onSuccess: () => {
      setNewComment('');
      setReplyTo(null);
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to update comment');
      return response.json();
    },
    onSuccess: () => {
      setEditingId(null);
      setEditContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/comments/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim()) {
        createCommentMutation.mutate(newComment);
      }
    },
    [newComment, createCommentMutation]
  );

  const handleUpdate = useCallback(
    (id: string) => {
      if (editContent.trim()) {
        updateCommentMutation.mutate({ id, content: editContent });
      }
    },
    [editContent, updateCommentMutation]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          {replyTo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              Cancel Reply
            </Button>
          )}
          <Button
            type="submit"
            disabled={!newComment.trim() || createCommentMutation.isPending}
            className="ml-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(id) => setReplyTo(id)}
            onLike={(id) => likeCommentMutation.mutate(id)}
            onEdit={(id, content) => {
              setEditingId(id);
              setEditContent(content);
            }}
            onDelete={(id) => deleteCommentMutation.mutate(id)}
            editingId={editingId}
            editContent={editContent}
            setEditContent={setEditContent}
            onUpdate={handleUpdate}
            onCancelEdit={() => {
              setEditingId(null);
              setEditContent('');
            }}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  onReply: (id: string) => void;
  onLike: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  onUpdate: (id: string) => void;
  onCancelEdit: () => void;
}

function CommentItem({
  comment,
  onReply,
  onLike,
  onEdit,
  onDelete,
  editingId,
  editContent,
  setEditContent,
  onUpdate,
  onCancelEdit,
}: CommentItemProps) {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, [supabase]);

  const isOwner = currentUserId === comment.user_id;
  const isEditing = editingId === comment.id;

  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src={comment.user_profiles.avatar_url} />
        <AvatarFallback>
          {comment.user_profiles.display_name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {comment.user_profiles.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onUpdate(comment.id)}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm">{comment.content}</p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:text-red-500"
              onClick={() => onLike(comment.id)}
            >
              <Heart className="mr-1 h-3 w-3" />
              {comment.likes_count > 0 && comment.likes_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="mr-1 h-3 w-3" />
              Reply
            </Button>

            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onEdit(comment.id, comment.content)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:text-red-500"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
