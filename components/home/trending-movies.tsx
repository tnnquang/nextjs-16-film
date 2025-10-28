'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCarousel } from '@/components/movies/movie-carousel'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { CACHE_TTL, ROUTES } from '@/lib/constants'
import Link from 'next/link'

export function TrendingMovies() {
  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: async () => {
      const response = await movieApiCorrected.getTrendingMovies(20)
      return response
    },
    staleTime: CACHE_TTL.MOVIE_LIST,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Phim Hot</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !movies.length) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Phim Hot</h2>
        <Link 
          href={ROUTES.MOVIES}
          className="text-primary hover:text-primary/80 font-medium"
        >
          Xem Tất Cả
        </Link>
      </div>
      
      <MovieCarousel movies={movies} />
    </section>
  )
}