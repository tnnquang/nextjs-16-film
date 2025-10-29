/**
 * Recommendation System - Main Entry Point
 */

export * from './collaborative-filtering'
export * from './content-based'
export * from './hybrid'

import { Movie } from '@/types'
import { UserRating, UserInteraction, convertInteractionsToRatings } from './collaborative-filtering'
import { getAdaptiveRecommendations, diversifyRecommendations, HybridRecommendation } from './hybrid'

/**
 * Main function to get personalized recommendations
 */
export async function getPersonalizedRecommendations(
  userId: string,
  watchedMovies: Movie[],
  allMovies: Movie[],
  interactions: UserInteraction[],
  options: {
    limit?: number
    diversify?: boolean
    diversityFactor?: number
  } = {}
): Promise<HybridRecommendation[]> {
  const { limit = 10, diversify = true, diversityFactor = 0.3 } = options

  // Convert interactions to ratings
  const allRatings = convertInteractionsToRatings(interactions)

  // Get adaptive recommendations
  let recommendations = getAdaptiveRecommendations(
    userId,
    watchedMovies,
    allMovies,
    allRatings,
    limit * 2 // Get more to allow for diversity
  )

  // Apply diversity if requested
  if (diversify) {
    recommendations = diversifyRecommendations(recommendations, diversityFactor)
  }

  return recommendations.slice(0, limit)
}
