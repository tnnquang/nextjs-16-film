'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCarousel } from './movie-carousel'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { Category } from '@/types'
import { CACHE_TTL } from '@/lib/constants'

interface RelatedMoviesProps {
  categories: Category[]
  excludeId: string
}

export function RelatedMovies({ categories, excludeId }: RelatedMoviesProps) {
  const primaryCategory = categories[0]
  
  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['movies', 'category', primaryCategory?.slug, 'related'],
    queryFn: async () => {
      const response = await movieApiCorrected.getFilmsByCategory(primaryCategory.slug, { limit: 20 })
      return response.data
    },
    enabled: !!primaryCategory,
    staleTime: CACHE_TTL.MOVIE_LIST,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Phim Liên Quan</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !movies.length) {
    return null
  }

  // Filter out the current movie
  const relatedMovies = movies.filter(movie => movie._id !== excludeId)

  if (relatedMovies.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">
        Phim {primaryCategory.name} Khác
      </h2>
      
      <MovieCarousel movies={relatedMovies} />
    </section>
  )
}