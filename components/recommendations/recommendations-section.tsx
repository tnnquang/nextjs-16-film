/**
 * Recommendations Section Component
 * Displays personalized movie recommendations
 */

'use client'

import { Movie } from '@/types'
import { useRecommendations } from '@/hooks/use-recommendations'
import { MovieCard } from '@/components/movies/movie-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'

interface RecommendationsSectionProps {
  userId: string
  watchedMovies: Movie[]
  allMovies: Movie[]
  limit?: number
}

export function RecommendationsSection({
  userId,
  watchedMovies,
  allMovies,
  limit = 10,
}: RecommendationsSectionProps) {
  const { recommendations, loading, error } = useRecommendations({
    userId,
    watchedMovies,
    allMovies,
    limit,
    diversify: true,
  })

  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Đề xuất cho bạn</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Đề xuất cho bạn</h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (recommendations.length === 0) {
    return (
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Đề xuất cho bạn</h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Hãy xem thêm phim để nhận được đề xuất phù hợp!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Đề xuất cho bạn</h2>
          <span className="text-sm text-muted-foreground">
            Dựa trên sở thích của bạn
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recommendations.map(({ movie, confidence, reasons }) => (
            <div key={movie._id} className="relative group">
              <MovieCard movie={movie} />
              
              {/* Recommendation Info Overlay */}
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-4 flex flex-col justify-end">
                <div className="text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-primary/20 rounded-full h-1.5">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-primary font-medium">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  
                  {reasons.length > 0 && (
                    <ul className="space-y-1 text-muted-foreground">
                      {reasons.slice(0, 3).map((reason, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span className="line-clamp-1">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
