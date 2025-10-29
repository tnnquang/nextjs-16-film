/**
 * Enhanced Movie Detail Page with Advanced Features
 * Integrates: Comments, Recommendations, Video Player, Analytics
 */

'use client'

import { useState } from 'react'
import { MovieDetail } from '@/types'
import { EnhancedVideoPlayer } from '@/components/video/enhanced-video-player'
import { RealtimeComments } from '@/components/comments/realtime-comments'
import { RecommendationsSection } from '@/components/recommendations/recommendations-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Plus } from 'lucide-react'
import { useActivityFeed } from '@/hooks/use-activity-feed'

interface MovieDetailEnhancedProps {
  movie: MovieDetail
  similarMovies: MovieDetail[]
  allMovies: MovieDetail[]
  userId?: string
  userName?: string
  watchedMovies?: MovieDetail[]
}

export function MovieDetailEnhanced({
  movie,
  similarMovies,
  allMovies,
  userId,
  userName,
  watchedMovies = [],
}: MovieDetailEnhancedProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { addActivity } = useActivityFeed(userId || 'anonymous')

  const handleFavorite = async () => {
    if (!userId) return

    setIsFavorite(!isFavorite)
    
    if (!isFavorite) {
      await addActivity('favorite', {
        movieId: movie._id,
        movieName: movie.name,
        moviePoster: movie.poster_url,
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.name,
          text: `Check out ${movie.name} on Cineverse!`,
          url: window.location.href,
        })

        if (userId) {
          await addActivity('share', {
            movieId: movie._id,
            movieName: movie.name,
          })
        }
      } catch (err) {
        console.error('Share failed:', err)
      }
    }
  }

  const handleWatchStart = async () => {
    if (userId) {
      await addActivity('watch', {
        movieId: movie._id,
        movieName: movie.name,
        moviePoster: movie.poster_url,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Video Player Section */}
      <section>
        <EnhancedVideoPlayer
          src={movie.episodes?.[0]?.server_data?.[0]?.link_embed || ''}
          movieId={movie._id}
          userId={userId}
          poster={movie.poster_url}
          autoPlay={false}
        />
      </section>

      {/* Action Buttons */}
      <section className="flex gap-4">
        <Button
          onClick={handleFavorite}
          variant={isFavorite ? 'default' : 'outline'}
          size="lg"
        >
          <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
        </Button>

        <Button onClick={handleShare} variant="outline" size="lg">
          <Share2 className="w-5 h-5 mr-2" />
          Chia sẻ
        </Button>

        <Button variant="outline" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Xem sau
        </Button>
      </section>

      {/* Tabs for Comments and Info */}
      <section>
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comments">Bình luận</TabsTrigger>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="episodes">Tập phim</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-6">
            <RealtimeComments
              movieId={movie._id}
              userId={userId}
              userName={userName}
            />
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Mô tả</h3>
                <p className="text-muted-foreground">{movie.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Thể loại</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.category?.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Quốc gia</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.country?.map((country) => (
                      <span
                        key={country.id}
                        className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                      >
                        {country.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {movie.actor && movie.actor.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Diễn viên</h4>
                  <p className="text-muted-foreground">{movie.actor.join(', ')}</p>
                </div>
              )}

              {movie.director && movie.director.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Đạo diễn</h4>
                  <p className="text-muted-foreground">{movie.director.join(', ')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="episodes" className="mt-6">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {movie.episodes?.[0]?.server_data?.map((episode: any, index: number) => (
                <Button
                  key={episode.slug}
                  variant="outline"
                  className="w-full"
                >
                  Tập {index + 1}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Personalized Recommendations */}
      {userId && watchedMovies.length > 0 && (
        <RecommendationsSection
          userId={userId}
          watchedMovies={watchedMovies}
          allMovies={allMovies}
          limit={10}
        />
      )}

      {/* Similar Movies (Content-Based) */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-6">Phim tương tự</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {similarMovies.slice(0, 10).map((similar) => (
            <div key={similar._id} className="space-y-2">
              <img
                src={similar.poster_url}
                alt={similar.name}
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
              <h3 className="font-medium line-clamp-2">{similar.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
