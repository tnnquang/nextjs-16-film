/**
 * Content-Based Filtering Recommendation System
 * Recommends movies based on content characteristics
 */

import { Movie } from '@/types'

export interface MovieFeatures {
  movieId: string
  genres: string[]
  countries: string[]
  directors: string[]
  actors: string[]
  year: number
  keywords: string[]
}

/**
 * Extract features from a movie
 */
export function extractMovieFeatures(movie: Movie): MovieFeatures {
  return {
    movieId: movie._id,
    genres: movie.category?.map((c) => c.slug) || [],
    countries: movie.country?.map((c) => c.slug) || [],
    directors: movie.director || [],
    actors: movie.actor || [],
    year: movie.year || 0,
    keywords: [
      ...(movie.name?.toLowerCase().split(' ') || []),
      ...(movie.origin_name?.toLowerCase().split(' ') || []),
    ],
  }
}

/**
 * Calculate TF-IDF (Term Frequency-Inverse Document Frequency) for text features
 */
export function calculateTFIDF(
  documents: string[][],
  documentIndex: number
): Map<string, number> {
  const doc = documents[documentIndex]
  const totalDocs = documents.length

  // Calculate term frequency
  const termFreq = new Map<string, number>()
  doc.forEach((term) => {
    termFreq.set(term, (termFreq.get(term) || 0) + 1)
  })

  // Calculate document frequency
  const docFreq = new Map<string, number>()
  documents.forEach((d) => {
    const uniqueTerms = new Set(d)
    uniqueTerms.forEach((term) => {
      docFreq.set(term, (docFreq.get(term) || 0) + 1)
    })
  })

  // Calculate TF-IDF
  const tfidf = new Map<string, number>()
  termFreq.forEach((tf, term) => {
    const df = docFreq.get(term) || 1
    const idf = Math.log(totalDocs / df)
    tfidf.set(term, (tf / doc.length) * idf)
  })

  return tfidf
}

/**
 * Calculate cosine similarity between two feature vectors
 */
export function calculateCosineSimilarity(
  features1: MovieFeatures,
  features2: MovieFeatures
): number {
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  // Genre similarity (weight: 0.3)
  const genreWeight = 0.3
  const commonGenres = features1.genres.filter((g) => features2.genres.includes(g)).length
  const genreScore =
    features1.genres.length > 0 && features2.genres.length > 0
      ? (2 * commonGenres) / (features1.genres.length + features2.genres.length)
      : 0

  // Country similarity (weight: 0.2)
  const countryWeight = 0.2
  const commonCountries = features1.countries.filter((c) => features2.countries.includes(c)).length
  const countryScore =
    features1.countries.length > 0 && features2.countries.length > 0
      ? (2 * commonCountries) / (features1.countries.length + features2.countries.length)
      : 0

  // Director similarity (weight: 0.2)
  const directorWeight = 0.2
  const commonDirectors = features1.directors.filter((d) => features2.directors.includes(d)).length
  const directorScore =
    features1.directors.length > 0 && features2.directors.length > 0
      ? (2 * commonDirectors) / (features1.directors.length + features2.directors.length)
      : 0

  // Actor similarity (weight: 0.2)
  const actorWeight = 0.2
  const commonActors = features1.actors.filter((a) => features2.actors.includes(a)).length
  const actorScore =
    features1.actors.length > 0 && features2.actors.length > 0
      ? (2 * commonActors) / (features1.actors.length + features2.actors.length)
      : 0

  // Year similarity (weight: 0.1)
  const yearWeight = 0.1
  const yearDiff = Math.abs(features1.year - features2.year)
  const yearScore = Math.max(0, 1 - yearDiff / 20) // Similar if within 20 years

  // Weighted sum
  const similarity =
    genreScore * genreWeight +
    countryScore * countryWeight +
    directorScore * directorWeight +
    actorScore * actorWeight +
    yearScore * yearWeight

  return similarity
}

/**
 * Build user profile based on watched movies
 */
export function buildUserProfile(watchedMovies: Movie[]): MovieFeatures {
  const allGenres: string[] = []
  const allCountries: string[] = []
  const allDirectors: string[] = []
  const allActors: string[] = []
  const years: number[] = []

  watchedMovies.forEach((movie) => {
    const features = extractMovieFeatures(movie)
    allGenres.push(...features.genres)
    allCountries.push(...features.countries)
    allDirectors.push(...features.directors)
    allActors.push(...features.actors)
    if (features.year > 0) years.push(features.year)
  })

  // Get most frequent items
  const getTopItems = (items: string[], limit: number = 5) => {
    const freq = new Map<string, number>()
    items.forEach((item) => freq.set(item, (freq.get(item) || 0) + 1))
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item)
  }

  return {
    movieId: 'user-profile',
    genres: getTopItems(allGenres),
    countries: getTopItems(allCountries),
    directors: getTopItems(allDirectors, 3),
    actors: getTopItems(allActors, 10),
    year: years.length > 0 ? Math.round(years.reduce((a, b) => a + b) / years.length) : 0,
    keywords: [],
  }
}

/**
 * Get content-based recommendations
 */
export function getContentBasedRecommendations(
  watchedMovies: Movie[],
  allMovies: Movie[],
  limit: number = 10
): Array<{ movie: Movie; score: number; reasons: string[] }> {
  const watchedIds = new Set(watchedMovies.map((m) => m._id))
  const userProfile = buildUserProfile(watchedMovies)

  // Calculate similarity scores for unwatched movies
  const recommendations = allMovies
    .filter((movie) => !watchedIds.has(movie._id))
    .map((movie) => {
      const movieFeatures = extractMovieFeatures(movie)
      const score = calculateCosineSimilarity(userProfile, movieFeatures)

      // Generate reasons
      const reasons: string[] = []
      const commonGenres = movieFeatures.genres.filter((g) => userProfile.genres.includes(g))
      if (commonGenres.length > 0) {
        reasons.push(`Thể loại: ${commonGenres.join(', ')}`)
      }

      const commonCountries = movieFeatures.countries.filter((c) =>
        userProfile.countries.includes(c)
      )
      if (commonCountries.length > 0) {
        reasons.push(`Quốc gia: ${commonCountries.join(', ')}`)
      }

      const commonDirectors = movieFeatures.directors.filter((d) =>
        userProfile.directors.includes(d)
      )
      if (commonDirectors.length > 0) {
        reasons.push(`Đạo diễn: ${commonDirectors.join(', ')}`)
      }

      return { movie, score, reasons }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return recommendations
}

/**
 * Get similar movies based on content
 */
export function getSimilarMovies(
  targetMovie: Movie,
  allMovies: Movie[],
  limit: number = 10
): Array<{ movie: Movie; score: number }> {
  const targetFeatures = extractMovieFeatures(targetMovie)

  return allMovies
    .filter((movie) => movie._id !== targetMovie._id)
    .map((movie) => {
      const movieFeatures = extractMovieFeatures(movie)
      const score = calculateCosineSimilarity(targetFeatures, movieFeatures)
      return { movie, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
