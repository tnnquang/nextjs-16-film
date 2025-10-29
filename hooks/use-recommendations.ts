/**
 * React Hook for Personalized Recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { Movie } from '@/types'
import { getPersonalizedRecommendations, HybridRecommendation } from '@/lib/recommendations'
import { UserInteraction } from '@/lib/recommendations/collaborative-filtering'

interface UseRecommendationsOptions {
  userId: string
  watchedMovies: Movie[]
  allMovies: Movie[]
  limit?: number
  diversify?: boolean
}

export function useRecommendations({
  userId,
  watchedMovies,
  allMovies,
  limit = 10,
  diversify = true,
}: UseRecommendationsOptions) {
  const [recommendations, setRecommendations] = useState<HybridRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true)

        // Simulate interactions from watch history
        const interactions: UserInteraction[] = watchedMovies.map((movie, index) => ({
          userId,
          movieId: movie._id,
          interactionType: 'view' as const,
          weight: 3.0 + (watchedMovies.length - index) * 0.1, // More recent = higher weight
          timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        }))

        const recs = await getPersonalizedRecommendations(
          userId,
          watchedMovies,
          allMovies,
          interactions,
          { limit, diversify }
        )

        setRecommendations(recs)
        setError(null)
      } catch (err) {
        setError('Failed to load recommendations')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (userId && allMovies.length > 0) {
      loadRecommendations()
    }
  }, [userId, watchedMovies, allMovies, limit, diversify])

  return {
    recommendations,
    loading,
    error,
  }
}
