/**
 * Activity Feed Component
 * Displays user activities in real-time
 */

'use client'

import { useActivityFeed } from '@/hooks/use-activity-feed'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Play, 
  Star, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Share2,
  FileText 
} from 'lucide-react'

interface ActivityFeedProps {
  userId: string
  limit?: number
}

const activityIcons = {
  watch: Play,
  rate: Star,
  comment: MessageSquare,
  favorite: Heart,
  follow: UserPlus,
  share: Share2,
  review: FileText,
}

const activityLabels = {
  watch: 'đã xem',
  rate: 'đã đánh giá',
  comment: 'đã bình luận về',
  favorite: 'đã yêu thích',
  follow: 'đã theo dõi',
  share: 'đã chia sẻ',
  review: 'đã viết đánh giá về',
}

export function ActivityFeed({ userId, limit = 20 }: ActivityFeedProps) {
  const { activities, loading, loadMore } = useActivityFeed(userId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Chưa có hoạt động nào. Hãy theo dõi người dùng khác để xem hoạt động của họ!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type]
        const label = activityLabels[activity.type]

        return (
          <div
            key={activity.id}
            className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* User Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              {activity.user_avatar ? (
                <img src={activity.user_avatar} alt={activity.user_name} />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {activity.user_name[0].toUpperCase()}
                </div>
              )}
            </Avatar>

            {/* Activity Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.user_name}</span>{' '}
                    <span className="text-muted-foreground">{label}</span>{' '}
                    {activity.movie_name && (
                      <span className="font-semibold text-primary">
                        {activity.movie_name}
                      </span>
                    )}
                    {activity.target_user_name && (
                      <span className="font-semibold text-primary">
                        {activity.target_user_name}
                      </span>
                    )}
                  </p>

                  {activity.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-semibold">
                        {activity.rating}/5
                      </span>
                    </div>
                  )}

                  {activity.content && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {activity.content}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>

              {/* Movie Poster (if applicable) */}
              {activity.movie_poster && (
                <div className="mt-2">
                  <img
                    src={activity.movie_poster}
                    alt={activity.movie_name}
                    className="w-20 h-28 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Load More Button */}
      {activities.length >= limit && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMore} variant="outline">
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  )
}
