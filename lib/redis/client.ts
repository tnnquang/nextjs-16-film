/**
 * Redis Client for Caching and Rate Limiting
 * Uses Upstash Redis for serverless-friendly caching
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ============================================
// CACHE KEY PATTERNS
// ============================================

export const CACHE_KEYS = {
  // Movie data
  MOVIE_DETAIL: (slug: string) => `movie:${slug}`,
  MOVIE_EPISODES: (slug: string) => `movie:${slug}:episodes`,
  MOVIE_SIMILAR: (slug: string) => `movie:${slug}:similar`,
  MOVIE_LIST: (type: string, page: number, filters?: string) =>
    `movies:${type}:${page}${filters ? `:${filters}` : ''}`,

  // User data
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_FAVORITES: (userId: string) => `user:${userId}:favorites`,
  USER_WATCHLIST: (userId: string) => `user:${userId}:watchlist`,
  USER_RECOMMENDATIONS: (userId: string) => `user:${userId}:recommendations`,
  USER_VIEWING_HISTORY: (userId: string) => `user:${userId}:history`,

  // Search
  SEARCH_RESULTS: (query: string, page: number) => `search:${query}:${page}`,

  // Categories & Countries
  CATEGORIES: () => 'categories:all',
  COUNTRIES: () => 'countries:all',
  CATEGORY_MOVIES: (slug: string, page: number) => `category:${slug}:${page}`,
  COUNTRY_MOVIES: (slug: string, page: number) => `country:${slug}:${page}`,

  // Analytics
  TRENDING_MOVIES: (period: string = '24h') => `trending:movies:${period}`,
  POPULAR_CATEGORIES: () => 'popular:categories',
  MOVIE_STATS: (slug: string) => `stats:movie:${slug}`,

  // Rate limiting
  RATE_LIMIT: (identifier: string, scope: string) =>
    `ratelimit:${scope}:${identifier}`,

  // Session
  SESSION: (sessionId: string) => `session:${sessionId}`,

  // Locks (for preventing race conditions)
  LOCK: (resource: string) => `lock:${resource}`,
};

// ============================================
// TTL CONFIGURATIONS (in seconds)
// ============================================

export const CACHE_TTL = {
  MOVIE_DETAIL: 300, // 5 minutes
  MOVIE_LIST: 120, // 2 minutes
  MOVIE_EPISODES: 600, // 10 minutes
  USER_DATA: 600, // 10 minutes
  USER_RECOMMENDATIONS: 3600, // 1 hour
  CATEGORIES: 3600, // 1 hour
  COUNTRIES: 3600, // 1 hour
  SEARCH_RESULTS: 300, // 5 minutes
  TRENDING: 1800, // 30 minutes
  SESSION: 86400, // 24 hours
  LOCK: 30, // 30 seconds
};

// ============================================
// CACHE SERVICE
// ============================================

export class CacheService {
  /**
   * Get cached data with type safety
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<T>(key);
      return data;
    } catch (error) {
      console.error('[Redis] Get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('[Redis] Set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  async del(key: string | string[]): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('[Redis] Delete error:', error);
      return false;
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      // Scan for keys matching pattern
      let cursor = '0';
      let deletedCount = 0;

      do {
        const [newCursor, keys] = await redis.scan(cursor, {
          match: pattern,
          count: 100,
        });

        cursor = newCursor;

        if (keys.length > 0) {
          await redis.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch (error) {
      console.error('[Redis] Delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[Redis] Exists error:', error);
      return false;
    }
  }

  /**
   * Increment counter (for analytics)
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error('[Redis] Increment error:', error);
      return 0;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('[Redis] TTL error:', error);
      return -1;
    }
  }

  /**
   * Extend TTL of a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('[Redis] Expire error:', error);
      return false;
    }
  }

  /**
   * Get or set with callback (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch from source
    const data = await callback();

    // Store in cache
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Distributed lock implementation
   */
  async acquireLock(
    resource: string,
    ttl: number = CACHE_TTL.LOCK
  ): Promise<string | null> {
    try {
      const lockKey = CACHE_KEYS.LOCK(resource);
      const lockValue = `${Date.now()}-${Math.random()}`;

      // Try to acquire lock with NX (only set if not exists)
      const result = await redis.set(lockKey, lockValue, {
        nx: true,
        ex: ttl,
      });

      return result === 'OK' ? lockValue : null;
    } catch (error) {
      console.error('[Redis] Acquire lock error:', error);
      return null;
    }
  }

  /**
   * Release distributed lock
   */
  async releaseLock(resource: string, lockValue: string): Promise<boolean> {
    try {
      const lockKey = CACHE_KEYS.LOCK(resource);

      // Only delete if the lock value matches (to prevent deleting someone else's lock)
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await redis.eval(script, [lockKey], [lockValue]);
      return result === 1;
    } catch (error) {
      console.error('[Redis] Release lock error:', error);
      return false;
    }
  }

  /**
   * Execute with lock (prevents race conditions)
   */
  async withLock<T>(
    resource: string,
    callback: () => Promise<T>,
    options: { ttl?: number; retries?: number; retryDelay?: number } = {}
  ): Promise<T> {
    const { ttl = CACHE_TTL.LOCK, retries = 3, retryDelay = 100 } = options;

    for (let attempt = 0; attempt < retries; attempt++) {
      // Try to acquire lock
      const lockValue = await this.acquireLock(resource, ttl);

      if (lockValue) {
        try {
          // Execute callback with lock held
          return await callback();
        } finally {
          // Always release lock
          await this.releaseLock(resource, lockValue);
        }
      }

      // Wait before retrying
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    throw new Error(`Failed to acquire lock for resource: ${resource}`);
  }
}

// ============================================
// RATE LIMITING SERVICE
// ============================================

export interface RateLimitConfig {
  requests: number; // Number of requests allowed
  window: number; // Time window in seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp when the limit resets
}

export class RateLimiter {
  /**
   * Sliding window rate limiter
   */
  async checkLimit(
    identifier: string,
    scope: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = CACHE_KEYS.RATE_LIMIT(identifier, scope);
    const now = Date.now();
    const windowStart = now - config.window * 1000;

    try {
      // Use sorted set to store timestamps
      const zkey = `${key}:zset`;

      // Remove old entries outside the window
      await redis.zremrangebyscore(zkey, 0, windowStart);

      // Count current requests in window
      const count = await redis.zcard(zkey);

      // Check if limit exceeded
      if (count >= config.requests) {
        // Get oldest timestamp to calculate reset time
        const oldest = await redis.zrange(zkey, 0, 0, { withScores: true });
        const resetTime = oldest[1]
          ? Math.ceil((Number(oldest[1]) + config.window * 1000) / 1000)
          : Math.ceil((now + config.window * 1000) / 1000);

        return {
          allowed: false,
          remaining: 0,
          reset: resetTime,
        };
      }

      // Add current request
      await redis.zadd(zkey, { score: now, member: `${now}-${Math.random()}` });

      // Set expiry on the key
      await redis.expire(zkey, config.window);

      return {
        allowed: true,
        remaining: config.requests - count - 1,
        reset: Math.ceil((now + config.window * 1000) / 1000),
      };
    } catch (error) {
      console.error('[Redis] Rate limit error:', error);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: config.requests,
        reset: Math.ceil((now + config.window * 1000) / 1000),
      };
    }
  }

  /**
   * Simple token bucket rate limiter
   */
  async checkLimitSimple(
    identifier: string,
    scope: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = CACHE_KEYS.RATE_LIMIT(identifier, scope);

    try {
      // Increment counter
      const count = await redis.incr(key);

      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, config.window);
      }

      // Get TTL to calculate reset time
      const ttl = await redis.ttl(key);
      const reset = Math.ceil(Date.now() / 1000 + ttl);

      const remaining = Math.max(0, config.requests - count);

      return {
        allowed: count <= config.requests,
        remaining,
        reset,
      };
    } catch (error) {
      console.error('[Redis] Rate limit simple error:', error);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: config.requests,
        reset: Math.ceil(Date.now() / 1000 + config.window),
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetLimit(identifier: string, scope: string): Promise<boolean> {
    const key = CACHE_KEYS.RATE_LIMIT(identifier, scope);
    const zkey = `${key}:zset`;

    try {
      await redis.del(key);
      await redis.del(zkey);
      return true;
    } catch (error) {
      console.error('[Redis] Reset limit error:', error);
      return false;
    }
  }
}

// ============================================
// ANALYTICS SERVICE
// ============================================

export class AnalyticsCache {
  /**
   * Increment view count for a movie
   */
  async incrementMovieViews(movieSlug: string): Promise<number> {
    const key = `${CACHE_KEYS.MOVIE_STATS(movieSlug)}:views`;
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error('[Redis] Increment views error:', error);
      return 0;
    }
  }

  /**
   * Get trending movies based on view counts
   */
  async getTrendingMovies(period: string = '24h', limit: number = 20): Promise<
    Array<{ slug: string; views: number }>
  > {
    const key = CACHE_KEYS.TRENDING_MOVIES(period);

    try {
      // Get top movies from sorted set
      const results = await redis.zrange(key, 0, limit - 1, {
        rev: true,
        withScores: true,
      });

      // Transform results
      const trending: Array<{ slug: string; views: number }> = [];
      for (let i = 0; i < results.length; i += 2) {
        trending.push({
          slug: results[i] as string,
          views: results[i + 1] as number,
        });
      }

      return trending;
    } catch (error) {
      console.error('[Redis] Get trending error:', error);
      return [];
    }
  }

  /**
   * Track movie view for trending calculation
   */
  async trackMovieView(movieSlug: string, period: string = '24h'): Promise<void> {
    const key = CACHE_KEYS.TRENDING_MOVIES(period);

    try {
      // Increment score in sorted set
      await redis.zincrby(key, 1, movieSlug);

      // Set expiry based on period
      const ttl = period === '24h' ? 86400 : period === '7d' ? 604800 : 2592000;
      await redis.expire(key, ttl);
    } catch (error) {
      console.error('[Redis] Track view error:', error);
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCES
// ============================================

export const cacheService = new CacheService();
export const rateLimiter = new RateLimiter();
export const analyticsCache = new AnalyticsCache();

export default redis;
