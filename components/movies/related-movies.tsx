'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCarousel } from './movie-carousel'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { movieApi } from '@/lib/api/movies'
import { Category } from '@/types'
import { CACHE_KEYS, CACHE_TIME } from '@/lib/constants'

interface RelatedMoviesProps {
  categories: Category[]
  excludeId: string
}

export function RelatedMovies({ categories, excludeId }: RelatedMoviesProps) {
  const primaryCategory = categories[0]
  
  const { data: response, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.MOVIES, 'category', primaryCategory?.slug, 'related'],
    queryFn: () => movieApi.getMoviesByCategory(primaryCategory.slug, { limit: 20 }),
    enabled: !!primaryCategory,
    staleTime: CACHE_TIME.MEDIUM,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Related Movies</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !response?.data?.items) {
    return null
  }

  // Filter out the current movie
  const relatedMovies = response.data.items.filter(movie => movie._id !== excludeId)

  if (relatedMovies.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">
        More {primaryCategory.name} Movies
      </h2>
      
      <MovieCarousel movies={relatedMovies} />
    </section>
  )
}