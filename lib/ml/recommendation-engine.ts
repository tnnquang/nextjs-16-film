/**
 * ML-Powered Recommendation Engine
 * Implements collaborative filtering, content-based filtering, and hybrid approaches
 */

import { createClient } from '@/lib/supabase/server';
import type {
  MovieFeatures,
  UserRecommendation,
  MLUserInteraction,
} from '@/types/advanced';

// Will be used when Redis is configured
// import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/redis/client';

// ============================================
// RECOMMENDATION ENGINE CLASS
// ============================================

export class RecommendationEngine {
  private supabase = createClient();

  // ============================================
  // CONTENT-BASED FILTERING
  // ============================================

  /**
   * Calculate Jaccard similarity between two sets
   */
  private jaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1);
    const s2 = new Set(set2);

    const intersection = new Set([...s1].filter((x) => s2.has(x)));
    const union = new Set([...s1, ...s2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculate content similarity between two movies
   */
  private calculateContentSimilarity(
    movie1: MovieFeatures,
    movie2: MovieFeatures
  ): number {
    let totalScore = 0;
    let weights = 0;

    // Category similarity (Jaccard index) - weight: 0.4
    const categoryJaccard = this.jaccardSimilarity(
      movie1.categories,
      movie2.categories
    );
    totalScore += categoryJaccard * 0.4;
    weights += 0.4;

    // Country similarity (Jaccard index) - weight: 0.2
    const countryJaccard = this.jaccardSimilarity(
      movie1.countries,
      movie2.countries
    );
    totalScore += countryJaccard * 0.2;
    weights += 0.2;

    // Type match - weight: 0.2
    if (movie1.type === movie2.type) {
      totalScore += 0.2;
    }
    weights += 0.2;

    // Year proximity - weight: 0.1
    const yearDiff = Math.abs(movie1.year - movie2.year);
    const yearSimilarity = Math.max(0, 1 - yearDiff / 20);
    totalScore += yearSimilarity * 0.1;
    weights += 0.1;

    // Keywords similarity if available - weight: 0.1
    if (movie1.keywords && movie2.keywords) {
      const keywordJaccard = this.jaccardSimilarity(
        movie1.keywords,
        movie2.keywords
      );
      totalScore += keywordJaccard * 0.1;
      weights += 0.1;
    }

    return totalScore / weights;
  }

  /**
   * Get content-based recommendations
   */
  async getContentBasedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<UserRecommendation[]> {
    try {
      // Get user's interaction history
      const { data: interactions, error } = await this.supabase
        .from('ml_user_interactions')
        .select('movie_slug, interaction_score')
        .eq('user_id', userId)
        .order('interaction_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!interactions || interactions.length === 0) {
        return this.getPopularMovies(limit);
      }

      // Get similar movies for each interacted movie
      const recommendations = new Map<string, number>();

      for (const interaction of interactions) {
        const { data: similar } = await this.supabase
          .from('ml_movie_similarities')
          .select('similar_movie_slug, similarity_score')
          .eq('movie_slug', interaction.movie_slug)
          .eq('algorithm', 'content_based')
          .order('similarity_score', { ascending: false })
          .limit(20);

        if (similar) {
          for (const sim of similar) {
            const currentScore = recommendations.get(sim.similar_movie_slug) || 0;
            const weightedScore =
              sim.similarity_score * interaction.interaction_score;
            recommendations.set(
              sim.similar_movie_slug,
              currentScore + weightedScore
            );
          }
        }
      }

      // Filter out already interacted movies
      const interactedSlugs = new Set(interactions.map((i) => i.movie_slug));
      for (const slug of interactedSlugs) {
        recommendations.delete(slug);
      }

      // Convert to array and sort
      const results: UserRecommendation[] = Array.from(recommendations.entries())
        .map(([movieSlug, score]) => ({
          id: `${userId}-${movieSlug}`,
          userId,
          movieSlug,
          recommendationScore: score,
          algorithm: 'content_based' as const,
          reasoning: {
            type: 'similar_content',
            details: { baseMovies: interactions.slice(0, 5).map((i) => i.movie_slug) },
          },
          computedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('[RecommendationEngine] Content-based error:', error);
      return this.getPopularMovies(limit);
    }
  }

  // ============================================
  // COLLABORATIVE FILTERING (User-Based)
  // ============================================

  /**
   * Pearson correlation coefficient
   */
  private pearsonCorrelation(
    interactions1: Array<{ movie_slug: string; interaction_score: number }>,
    interactions2: Array<{ movie_slug: string; interaction_score: number }>
  ): number {
    // Find common movies
    const map1 = new Map(
      interactions1.map((i) => [i.movie_slug, i.interaction_score])
    );
    const map2 = new Map(
      interactions2.map((i) => [i.movie_slug, i.interaction_score])
    );

    const commonMovies = [...map1.keys()].filter((slug) => map2.has(slug));

    if (commonMovies.length < 2) return 0;

    // Calculate Pearson correlation
    let sum1 = 0,
      sum2 = 0,
      sum1Sq = 0,
      sum2Sq = 0,
      pSum = 0;

    for (const movie of commonMovies) {
      const score1 = map1.get(movie)!;
      const score2 = map2.get(movie)!;

      sum1 += score1;
      sum2 += score2;
      sum1Sq += score1 ** 2;
      sum2Sq += score2 ** 2;
      pSum += score1 * score2;
    }

    const n = commonMovies.length;
    const num = pSum - (sum1 * sum2) / n;
    const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));

    return den === 0 ? 0 : num / den;
  }

  /**
   * Find similar users based on interaction patterns
   */
  async findSimilarUsers(
    userId: string,
    limit: number = 50
  ): Promise<Array<{ userId: string; similarity: number }>> {
    try {
      // Get target user's interactions
      const { data: userInteractions, error } = await this.supabase
        .from('ml_user_interactions')
        .select('movie_slug, interaction_score')
        .eq('user_id', userId);

      if (error) throw error;

      if (!userInteractions || userInteractions.length < 3) {
        return [];
      }

      // Get all users who interacted with at least one same movie
      const movieSlugs = userInteractions.map((i) => i.movie_slug);
      const { data: otherUsers } = await this.supabase
        .from('ml_user_interactions')
        .select('user_id')
        .in('movie_slug', movieSlugs)
        .neq('user_id', userId);

      if (!otherUsers) return [];

      const uniqueUsers = [...new Set(otherUsers.map((u) => u.user_id))];

      // Calculate similarity with each user
      const similarities = await Promise.all(
        uniqueUsers.slice(0, 100).map(async (otherUserId) => {
          const { data: otherInteractions } = await this.supabase
            .from('ml_user_interactions')
            .select('movie_slug, interaction_score')
            .eq('user_id', otherUserId);

          if (!otherInteractions) return null;

          const similarity = this.pearsonCorrelation(
            userInteractions,
            otherInteractions
          );

          return { userId: otherUserId, similarity };
        })
      );

      return similarities
        .filter((s): s is { userId: string; similarity: number } => s !== null)
        .filter((s) => s.similarity > 0.3) // Minimum similarity threshold
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('[RecommendationEngine] Find similar users error:', error);
      return [];
    }
  }

  /**
   * Get collaborative filtering recommendations
   */
  async getCollaborativeRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<UserRecommendation[]> {
    try {
      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId, 50);

      if (similarUsers.length === 0) {
        return this.getPopularMovies(limit);
      }

      // Get movies liked by similar users
      const { data: userInteractions } = await this.supabase
        .from('ml_user_interactions')
        .select('movie_slug')
        .eq('user_id', userId);

      const userMovies = new Set(userInteractions?.map((i) => i.movie_slug) || []);

      const recommendations = new Map<string, number>();

      for (const { userId: similarUserId, similarity } of similarUsers) {
        const { data: interactions } = await this.supabase
          .from('ml_user_interactions')
          .select('movie_slug, interaction_score')
          .eq('user_id', similarUserId)
          .gte('interaction_score', 0.7) // Only positive interactions
          .order('interaction_score', { ascending: false })
          .limit(20);

        if (interactions) {
          for (const interaction of interactions) {
            if (userMovies.has(interaction.movie_slug)) continue;

            const currentScore = recommendations.get(interaction.movie_slug) || 0;
            const weightedScore = similarity * interaction.interaction_score;
            recommendations.set(
              interaction.movie_slug,
              currentScore + weightedScore
            );
          }
        }
      }

      // Convert to array and normalize scores
      const maxScore = Math.max(...recommendations.values(), 1);
      const results: UserRecommendation[] = Array.from(recommendations.entries())
        .map(([movieSlug, score]) => ({
          id: `${userId}-${movieSlug}`,
          userId,
          movieSlug,
          recommendationScore: score / maxScore,
          algorithm: 'collaborative' as const,
          reasoning: {
            type: 'similar_users',
            details: { similarUserCount: similarUsers.length },
          },
          computedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('[RecommendationEngine] Collaborative error:', error);
      return this.getPopularMovies(limit);
    }
  }

  // ============================================
  // HYBRID RECOMMENDATION SYSTEM
  // ============================================

  /**
   * Combine content-based and collaborative filtering
   */
  async getHybridRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<UserRecommendation[]> {
    try {
      // Check cache first (when Redis is configured)
      // const cacheKey = CACHE_KEYS.USER_RECOMMENDATIONS(userId);
      // const cached = await cacheService.get<UserRecommendation[]>(cacheKey);
      // if (cached) return cached.slice(0, limit);

      // Get recommendations from both algorithms
      const [contentBased, collaborative] = await Promise.all([
        this.getContentBasedRecommendations(userId, 30),
        this.getCollaborativeRecommendations(userId, 30),
      ]);

      // Merge and weight (60% collaborative, 40% content-based)
      const hybridScores = new Map<string, UserRecommendation>();

      for (const rec of collaborative) {
        hybridScores.set(rec.movieSlug, {
          ...rec,
          recommendationScore: rec.recommendationScore * 0.6,
          algorithm: 'hybrid',
        });
      }

      for (const rec of contentBased) {
        const existing = hybridScores.get(rec.movieSlug);
        if (existing) {
          existing.recommendationScore += rec.recommendationScore * 0.4;
        } else {
          hybridScores.set(rec.movieSlug, {
            ...rec,
            recommendationScore: rec.recommendationScore * 0.4,
            algorithm: 'hybrid',
          });
        }
      }

      // Sort and limit
      const results = Array.from(hybridScores.values())
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

      // Cache for 1 hour (when Redis is configured)
      // await cacheService.set(cacheKey, results, CACHE_TTL.USER_RECOMMENDATIONS);

      // Store in database for analytics
      await this.storeRecommendations(userId, results);

      return results;
    } catch (error) {
      console.error('[RecommendationEngine] Hybrid error:', error);
      return this.getPopularMovies(limit);
    }
  }

  /**
   * Store recommendations in database
   */
  private async storeRecommendations(
    userId: string,
    recommendations: UserRecommendation[]
  ): Promise<void> {
    try {
      const records = recommendations.map((rec) => ({
        user_id: userId,
        movie_slug: rec.movieSlug,
        recommendation_score: rec.recommendationScore,
        algorithm: rec.algorithm,
        reasoning: rec.reasoning,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }));

      await this.supabase.from('ml_user_recommendations').upsert(records);
    } catch (error) {
      console.error('[RecommendationEngine] Store recommendations error:', error);
    }
  }

  // ============================================
  // FALLBACK: POPULAR MOVIES
  // ============================================

  /**
   * Get popular movies for cold start
   */
  private async getPopularMovies(limit: number = 20): Promise<UserRecommendation[]> {
    try {
      const { data: popular } = await this.supabase
        .from('ml_user_interactions')
        .select('movie_slug, interaction_score')
        .gte('interaction_score', 0.7)
        .limit(100);

      if (!popular) return [];

      // Count occurrences and average scores
      const movieScores = new Map<string, { count: number; totalScore: number }>();

      for (const interaction of popular) {
        const current = movieScores.get(interaction.movie_slug) || {
          count: 0,
          totalScore: 0,
        };
        movieScores.set(interaction.movie_slug, {
          count: current.count + 1,
          totalScore: current.totalScore + interaction.interaction_score,
        });
      }

      // Calculate popularity score
      const results: UserRecommendation[] = Array.from(movieScores.entries())
        .map(([movieSlug, { count, totalScore }]) => ({
          id: `popular-${movieSlug}`,
          userId: 'system',
          movieSlug,
          recommendationScore: (count * totalScore) / count,
          algorithm: 'popular' as const,
          reasoning: {
            type: 'trending',
            details: { viewCount: count },
          },
          computedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('[RecommendationEngine] Popular movies error:', error);
      return [];
    }
  }

  // ============================================
  // TRACK USER INTERACTIONS
  // ============================================

  /**
   * Record user interaction for ML training
   */
  async trackInteraction(interaction: Omit<MLUserInteraction, 'id'>): Promise<void> {
    try {
      await this.supabase.from('ml_user_interactions').insert({
        user_id: interaction.userId,
        movie_slug: interaction.movieSlug,
        interaction_type: interaction.interactionType,
        interaction_score: interaction.interactionScore,
        metadata: interaction.metadata,
      });

      // Invalidate user's recommendation cache (when Redis is configured)
      // await cacheService.del(CACHE_KEYS.USER_RECOMMENDATIONS(interaction.userId));
    } catch (error) {
      console.error('[RecommendationEngine] Track interaction error:', error);
    }
  }

  // ============================================
  // BACKGROUND JOBS
  // ============================================

  /**
   * Pre-compute movie similarities (run as cron job)
   * This should be called periodically to update the ml_movie_similarities table
   */
  async precomputeMovieSimilarities(movieSlug: string): Promise<void> {
    // Implementation for background job to pre-compute similarities
    console.log(`[RecommendationEngine] Pre-computing similarities for ${movieSlug}`);
    // This would be implemented as a scheduled task
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
