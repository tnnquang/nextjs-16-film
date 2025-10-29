/**
 * Hybrid Recommendation System
 * Combines Collaborative Filtering and Content-Based approaches
 */

import { Movie } from '@/types'
import {
  getUserBasedRecommendations,
  getItemBasedRecommendations,
  UserRating,
} from './collaborative-filtering'
import { getContentBasedRecommendations } from './content-based'

export interface HybridRecommendation {
  movie: Movie
  score: number
  sources: {
    collaborative: number
    contentBased: number
    hybrid: number
  }
  reasons: string[]
  confidence: number
}

export type HybridStrategy = 'weighted' | 'switching' | 'cascade' | 'feature-combination'

/**
 * Weighted Hybrid: Combine scores from different algorithms with weights
 */
export function getWeightedHybridRecommendations(
  userId: string,
  watchedMovies: Movie[],
  allMovies: Movie[],
  allRatings: UserRating[],
  weights: { collaborative: number; contentBased: number } = {
    collaborative: 0.6,
    contentBased: 0.4,
  },
  limit: number = 10
): HybridRecommendation[] {
  // Get recommendations from both systems
  const collaborativeRecs = getUserBasedRecommendations(userId, allRatings, allMovies, limit * 2)
  const contentRecs = getContentBasedRecommendations(watchedMovies, allMovies, limit * 2)

  // Create a map for scoring
  const scoreMap = new Map<
    string,
    { movie: Movie; collaborative: number; contentBased: number; reasons: string[] }
  >()

  // Add collaborative recommendations
  collaborativeRecs.forEach((movie, index) => {
    const score = 1 - index / collaborativeRecs.length // Higher score for higher rank
    scoreMap.set(movie._id, {
      movie,
      collaborative: score,
      contentBased: 0,
      reasons: ['Người dùng tương tự cũng thích'],
    })
  })

  // Add content-based recommendations
  contentRecs.forEach(({ movie, score, reasons }, index) => {
    const existing = scoreMap.get(movie._id)
    if (existing) {
      existing.contentBased = score
      existing.reasons.push(...reasons)
    } else {
      scoreMap.set(movie._id, {
        movie,
        collaborative: 0,
        contentBased: score,
        reasons,
      })
    }
  })

  // Calculate hybrid scores
  const recommendations: HybridRecommendation[] = Array.from(scoreMap.values()).map(
    ({ movie, collaborative, contentBased, reasons }) => {
      const hybridScore =
        collaborative * weights.collaborative + contentBased * weights.contentBased

      // Calculate confidence based on agreement between systems
      const confidence = collaborative > 0 && contentBased > 0 ? 0.9 : 0.6

      return {
        movie,
        score: hybridScore,
        sources: {
          collaborative,
          contentBased,
          hybrid: hybridScore,
        },
        reasons: [...new Set(reasons)],
        confidence,
      }
    }
  )

  // Sort by hybrid score and return top recommendations
  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Switching Hybrid: Use different algorithms based on context
 */
export function getSwitchingHybridRecommendations(
  userId: string,
  watchedMovies: Movie[],
  allMovies: Movie[],
  allRatings: UserRating[],
  limit: number = 10
): HybridRecommendation[] {
  const userRatings = allRatings.filter((r) => r.userId === userId)

  // If user has few ratings, prefer content-based (cold start problem)
  if (userRatings.length < 5) {
    const contentRecs = getContentBasedRecommendations(watchedMovies, allMovies, limit)
    return contentRecs.map(({ movie, score, reasons }) => ({
      movie,
      score,
      sources: {
        collaborative: 0,
        contentBased: score,
        hybrid: score,
      },
      reasons: [...reasons, 'Dựa trên sở thích của bạn'],
      confidence: 0.7,
    }))
  }

  // Otherwise, prefer collaborative filtering
  const collaborativeRecs = getUserBasedRecommendations(userId, allRatings, allMovies, limit)
  return collaborativeRecs.map((movie, index) => ({
    movie,
    score: 1 - index / collaborativeRecs.length,
    sources: {
      collaborative: 1 - index / collaborativeRecs.length,
      contentBased: 0,
      hybrid: 1 - index / collaborativeRecs.length,
    },
    reasons: ['Người xem tương tự đã đánh giá cao'],
    confidence: 0.8,
  }))
}

/**
 * Cascade Hybrid: Use stricter criteria progressively
 */
export function getCascadeHybridRecommendations(
  userId: string,
  watchedMovies: Movie[],
  allMovies: Movie[],
  allRatings: UserRating[],
  limit: number = 10
): HybridRecommendation[] {
  const results: HybridRecommendation[] = []
  const usedMovieIds = new Set<string>()

  // Stage 1: High-confidence collaborative filtering
  const collaborativeRecs = getUserBasedRecommendations(userId, allRatings, allMovies, limit * 2)
  collaborativeRecs.slice(0, Math.ceil(limit / 2)).forEach((movie, index) => {
    if (!usedMovieIds.has(movie._id)) {
      results.push({
        movie,
        score: 1 - index / collaborativeRecs.length,
        sources: {
          collaborative: 1,
          contentBased: 0,
          hybrid: 1,
        },
        reasons: ['Đánh giá cao từ cộng đồng'],
        confidence: 0.9,
      })
      usedMovieIds.add(movie._id)
    }
  })

  // Stage 2: Fill remaining with content-based
  if (results.length < limit) {
    const contentRecs = getContentBasedRecommendations(watchedMovies, allMovies, limit * 2)
    contentRecs.forEach(({ movie, score, reasons }) => {
      if (!usedMovieIds.has(movie._id) && results.length < limit) {
        results.push({
          movie,
          score,
          sources: {
            collaborative: 0,
            contentBased: 1,
            hybrid: score,
          },
          reasons,
          confidence: 0.75,
        })
        usedMovieIds.add(movie._id)
      }
    })
  }

  return results
}

/**
 * Get recommendations with adaptive strategy
 */
export function getAdaptiveRecommendations(
  userId: string,
  watchedMovies: Movie[],
  allMovies: Movie[],
  allRatings: UserRating[],
  limit: number = 10
): HybridRecommendation[] {
  const userRatings = allRatings.filter((r) => r.userId === userId)
  const totalRatings = allRatings.length

  // Determine the best strategy based on data availability
  if (userRatings.length < 3) {
    // Cold start: Use content-based
    return getSwitchingHybridRecommendations(userId, watchedMovies, allMovies, allRatings, limit)
  } else if (totalRatings < 100) {
    // Sparse data: Use cascade
    return getCascadeHybridRecommendations(userId, watchedMovies, allMovies, allRatings, limit)
  } else {
    // Rich data: Use weighted hybrid
    return getWeightedHybridRecommendations(userId, watchedMovies, allMovies, allRatings, {
      collaborative: 0.7,
      contentBased: 0.3,
    }, limit)
  }
}

/**
 * Diversify recommendations to avoid filter bubble
 */
export function diversifyRecommendations(
  recommendations: HybridRecommendation[],
  diversityFactor: number = 0.3
): HybridRecommendation[] {
  if (recommendations.length === 0) return []

  const diversified: HybridRecommendation[] = [recommendations[0]]
  const remaining = recommendations.slice(1)

  while (diversified.length < recommendations.length && remaining.length > 0) {
    // Calculate diversity score for each remaining recommendation
    const scored = remaining.map((rec) => {
      // Average similarity with already selected items
      let totalSimilarity = 0
      diversified.forEach((selected) => {
        // Simple genre-based similarity
        const recGenres = new Set(rec.movie.category?.map((c) => c.slug) || [])
        const selGenres = new Set(selected.movie.category?.map((c) => c.slug) || [])
        const commonGenres = [...recGenres].filter((g) => selGenres.has(g)).length
        const totalGenres = Math.max(recGenres.size, selGenres.size)
        const similarity = totalGenres > 0 ? commonGenres / totalGenres : 0
        totalSimilarity += similarity
      })

      const avgSimilarity = totalSimilarity / diversified.length
      const diversity = 1 - avgSimilarity

      // Combine original score with diversity
      const finalScore = rec.score * (1 - diversityFactor) + diversity * diversityFactor

      return { ...rec, finalScore }
    })

    // Select the one with highest combined score
    scored.sort((a, b) => b.finalScore - a.finalScore)
    const selected = scored[0]
    diversified.push(selected)

    // Remove selected from remaining
    const selectedIndex = remaining.findIndex((r) => r.movie._id === selected.movie._id)
    remaining.splice(selectedIndex, 1)
  }

  return diversified
}
