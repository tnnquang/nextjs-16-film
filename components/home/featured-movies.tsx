'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieGrid } from '@/components/movies/movie-grid'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { movieApi } from '@/lib/api/movies'
import { CACHE_KEYS, CACHE_TIME } from '@/lib/constants'

export function FeaturedMovies() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.MOVIES, 'featured'],
    queryFn: () => movieApi.getFeaturedMovies(),
    staleTime: CACHE_TIME.MEDIUM,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Featured Movies</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !response?.data?.items) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Featured Movies</h2>
        <div className="text-center py-12 text-muted-foreground">
          Failed to load featured movies. Please try again later.
        </div>
      </section>
    )
  }

  const movies = response.data.items.slice(0, 12)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Movies</h2>
        <a 
          href="/movies" 
          className="text-primary hover:text-primary/80 font-medium"
        >
          View All
        </a>
      </div>
      
      <MovieGrid movies={movies} />
    </section>
  )
}