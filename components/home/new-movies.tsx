'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCarousel } from '@/components/movies/movie-carousel'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { movieApi } from '@/lib/api/movies'
import { CACHE_KEYS, CACHE_TIME } from '@/lib/constants'

export function NewMovies() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.MOVIES, 'new'],
    queryFn: () => movieApi.getNewMovies(20),
    staleTime: CACHE_TIME.SHORT,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">New Releases</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !response?.data?.items) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">New Releases</h2>
        <div className="text-center py-12 text-muted-foreground">
          Failed to load new movies. Please try again later.
        </div>
      </section>
    )
  }

  const movies = response.data.items

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New Releases</h2>
        <a 
          href="/movies?sort=created" 
          className="text-primary hover:text-primary/80 font-medium"
        >
          View All
        </a>
      </div>
      
      <MovieCarousel movies={movies} />
    </section>
  )
}