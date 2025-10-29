/**
 * Collaborative Filtering Recommendation System
 * Uses user-based and item-based collaborative filtering
 */

import { Movie } from '@/types'

export interface UserRating {
  userId: string
  movieId: string
  rating: number
  timestamp: Date
}

export interface UserInteraction {
  userId: string
  movieId: string
  interactionType: 'view' | 'rating' | 'favorite' | 'watch_complete'
  weight: number
  timestamp: Date
}

/**
 * Calculate similarity between two users based on their ratings
 * Uses Pearson correlation coefficient
 */
export function calculateUserSimilarity(
  user1Ratings: UserRating[],
  user2Ratings: UserRating[]
): number {
  // Find common movies
  const user1Movies = new Map(user1Ratings.map((r) => [r.movieId, r.rating]))
  const user2Movies = new Map(user2Ratings.map((r) => [r.movieId, r.rating]))

  const commonMovies = user1Ratings
    .filter((r) => user2Movies.has(r.movieId))
    .map((r) => r.movieId)

  if (commonMovies.length === 0) return 0

  // Calculate Pearson correlation
  let sum1 = 0,
    sum2 = 0,
    sum1Sq = 0,
    sum2Sq = 0,
    pSum = 0
  const n = commonMovies.length

  commonMovies.forEach((movieId) => {
    const rating1 = user1Movies.get(movieId)!
    const rating2 = user2Movies.get(movieId)!

    sum1 += rating1
    sum2 += rating2
    sum1Sq += rating1 * rating1
    sum2Sq += rating2 * rating2
    pSum += rating1 * rating2
  })

  const num = pSum - (sum1 * sum2) / n
  const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n))

  if (den === 0) return 0
  return num / den
}

/**
 * Calculate similarity between two movies based on user ratings
 * Uses cosine similarity
 */
export function calculateMovieSimilarity(
  movie1Ratings: UserRating[],
  movie2Ratings: UserRating[]
): number {
  const movie1Users = new Map(movie1Ratings.map((r) => [r.userId, r.rating]))
  const movie2Users = new Map(movie2Ratings.map((r) => [r.userId, r.rating]))

  const commonUsers = movie1Ratings
    .filter((r) => movie2Users.has(r.userId))
    .map((r) => r.userId)

  if (commonUsers.length === 0) return 0

  // Calculate cosine similarity
  let dotProduct = 0,
    magnitude1 = 0,
    magnitude2 = 0

  commonUsers.forEach((userId) => {
    const rating1 = movie1Users.get(userId)!
    const rating2 = movie2Users.get(userId)!

    dotProduct += rating1 * rating2
    magnitude1 += rating1 * rating1
    magnitude2 += rating2 * rating2
  })

  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2)
  if (magnitude === 0) return 0

  return dotProduct / magnitude
}

/**
 * Find similar users based on ratings
 */
export function findSimilarUsers(
  targetUserId: string,
  allRatings: UserRating[],
  limit: number = 10
): Array<{ userId: string; similarity: number }> {
  const targetUserRatings = allRatings.filter((r) => r.userId === targetUserId)
  const otherUsers = [...new Set(allRatings.map((r) => r.userId))].filter(
    (id) => id !== targetUserId
  )

  const similarities = otherUsers.map((userId) => {
    const userRatings = allRatings.filter((r) => r.userId === userId)
    const similarity = calculateUserSimilarity(targetUserRatings, userRatings)
    return { userId, similarity }
  })

  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
}

/**
 * Get user-based collaborative filtering recommendations
 */
export function getUserBasedRecommendations(
  targetUserId: string,
  allRatings: UserRating[],
  allMovies: Movie[],
  limit: number = 10
): Movie[] {
  const targetUserRatings = allRatings.filter((r) => r.userId === targetUserId)
  const watchedMovieIds = new Set(targetUserRatings.map((r) => r.movieId))

  // Find similar users
  const similarUsers = findSimilarUsers(targetUserId, allRatings, 20)

  // Get movies rated by similar users that target user hasn't watched
  const movieScores = new Map<string, number>()

  similarUsers.forEach(({ userId, similarity }) => {
    const userRatings = allRatings.filter(
      (r) => r.userId === userId && !watchedMovieIds.has(r.movieId)
    )

    userRatings.forEach((rating) => {
      const currentScore = movieScores.get(rating.movieId) || 0
      movieScores.set(rating.movieId, currentScore + rating.rating * similarity)
    })
  })

  // Sort by score and return movies
  const recommendedMovieIds = Array.from(movieScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([movieId]) => movieId)

  return allMovies.filter((movie) => recommendedMovieIds.includes(movie._id))
}

/**
 * Get item-based collaborative filtering recommendations
 */
export function getItemBasedRecommendations(
  targetUserId: string,
  allRatings: UserRating[],
  allMovies: Movie[],
  limit: number = 10
): Movie[] {
  const targetUserRatings = allRatings.filter((r) => r.userId === targetUserId)
  const watchedMovieIds = new Set(targetUserRatings.map((r) => r.movieId))

  // Calculate movie similarities
  const movieScores = new Map<string, number>()

  targetUserRatings.forEach((targetRating) => {
    const targetMovieRatings = allRatings.filter((r) => r.movieId === targetRating.movieId)

    allMovies
      .filter((movie) => !watchedMovieIds.has(movie._id))
      .forEach((movie) => {
        const movieRatings = allRatings.filter((r) => r.movieId === movie._id)
        const similarity = calculateMovieSimilarity(targetMovieRatings, movieRatings)

        const currentScore = movieScores.get(movie._id) || 0
        movieScores.set(movie._id, currentScore + similarity * targetRating.rating)
      })
  })

  // Sort by score and return movies
  const recommendedMovieIds = Array.from(movieScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([movieId]) => movieId)

  return allMovies.filter((movie) => recommendedMovieIds.includes(movie._id))
}

/**
 * Convert user interactions to implicit ratings
 */
export function convertInteractionsToRatings(
  interactions: UserInteraction[]
): UserRating[] {
  const userMovieInteractions = new Map<string, UserInteraction[]>()

  // Group interactions by user and movie
  interactions.forEach((interaction) => {
    const key = `${interaction.userId}:${interaction.movieId}`
    const existing = userMovieInteractions.get(key) || []
    userMovieInteractions.set(key, [...existing, interaction])
  })

  // Convert to ratings
  return Array.from(userMovieInteractions.entries()).map(([key, interactions]) => {
    const [userId, movieId] = key.split(':')
    
    // Calculate implicit rating based on interactions
    const totalWeight = interactions.reduce((sum, i) => sum + i.weight, 0)
    const rating = Math.min(5, totalWeight / interactions.length) // Normalize to 1-5

    return {
      userId,
      movieId,
      rating,
      timestamp: interactions[interactions.length - 1].timestamp,
    }
  })
}
