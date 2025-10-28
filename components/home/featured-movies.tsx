'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieGrid } from '@/components/movies/movie-grid'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { CACHE_TTL, ROUTES } from '@/lib/constants'
import Link from 'next/link'
import { getBlurDataURL } from '@/lib/image'

export function FeaturedMovies() {
  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: async () => {
      const response = await movieApiCorrected.getFeaturedMovies(12)
      const moviesWithBlur = await Promise.all(
        response.map(async (movie) => {
          const imageUrl = movie.poster_url || movie.thumb_url
          const blurDataURL = await getBlurDataURL(imageUrl)
          return { ...movie, blurDataURL }
        })
      )
      return moviesWithBlur
    },
    staleTime: CACHE_TTL.MOVIE_LIST,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Phim Nổi Bật</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !movies.length) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Phim Nổi Bật</h2>
        <div className="text-center py-12 text-muted-foreground">
          Không thể tải phim. Vui lòng thử lại sau.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Phim Nổi Bật</h2>
        <Link 
          href={ROUTES.MOVIES}
          className="text-primary hover:text-primary/80 font-medium"
        >
          Xem Tất Cả
        </Link>
      </div>
      
      <MovieGrid movies={movies} />
    </section>
  )
}