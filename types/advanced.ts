/**
 * Advanced TypeScript types for ML, payments, analytics, and social features
 */

// ============================================
// ML & RECOMMENDATION TYPES
// ============================================

export interface MLUserInteraction {
  id: string;
  userId: string;
  movieSlug: string;
  interactionType: 'view' | 'rating' | 'favorite' | 'watchlist' | 'complete' | 'search';
  interactionScore: number; // 0-1
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface MovieSimilarity {
  id: string;
  movieSlug: string;
  similarMovieSlug: string;
  similarityScore: number; // 0-1
  algorithm: 'content_based' | 'collaborative' | 'hybrid';
  computedAt: Date;
}

export interface UserRecommendation {
  id: string;
  userId: string;
  movieSlug: string;
  recommendationScore: number; // 0-1
  algorithm: 'content_based' | 'collaborative' | 'hybrid' | 'popular';
  reasoning: {
    type: string;
    details: Record<string, any>;
  };
  computedAt: Date;
  expiresAt: Date;
}

export interface MovieFeatures {
  slug: string;
  categories: string[];
  countries: string[];
  year: number;
  type: string;
  keywords?: string[];
  actors?: string[];
  director?: string;
}

export interface RecommendationRequest {
  userId: string;
  limit?: number;
  excludeWatched?: boolean;
  algorithm?: 'content_based' | 'collaborative' | 'hybrid' | 'popular';
}

export interface RecommendationResponse {
  recommendations: UserRecommendation[];
  algorithm: string;
  computedAt: Date;
  cached: boolean;
}

// ============================================
// SOCIAL FEATURES TYPES
// ============================================

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  activityType:
    | 'movie_watched'
    | 'movie_rated'
    | 'movie_favorited'
    | 'comment_created'
    | 'review_created'
    | 'user_followed';
  metadata: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  user?: UserProfile;
}

export interface Comment {
  id: string;
  movieSlug: string;
  userId: string;
  parentId: string | null;
  content: string;
  likesCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserProfile;
  replies?: Comment[];
}

export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: Date;
}

export interface MovieRating {
  id: string;
  movieSlug: string;
  userId: string;
  rating: number; // 0-10
  createdAt: Date;
  updatedAt: Date;
  user?: UserProfile;
}

export interface MovieReview {
  id: string;
  movieSlug: string;
  userId: string;
  title?: string;
  content: string;
  helpfulCount: number;
  spoiler: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserProfile;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  subscriptionTier: 'free' | 'basic' | 'premium' | 'vip';
  subscriptionExpiresAt?: Date;
  preferences: UserPreferencesExtended;
  totalWatchTime: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface UserPreferencesExtended {
  theme: 'light' | 'dark' | 'system';
  language: string;
  videoQuality: 'auto' | 'SD' | 'HD' | 'FHD' | '4K';
  autoplay: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  layoutPreference: 'grid_2x2' | 'grid_3x3' | 'grid_4x4' | 'list' | 'card';
  showSpoilers: boolean;
  adultContent: boolean;
}

// ============================================
// PAYMENT & SUBSCRIPTION TYPES
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'vip';
  priceMonthly: number;
  priceYearly?: number;
  features: {
    ads: boolean;
    quality: string;
    downloads: boolean;
    offline?: boolean;
    earlyAccess?: boolean;
    customProfile?: boolean;
  };
  maxConcurrentStreams: number;
  maxVideoQuality: string;
  isActive: boolean;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  paymentMethod?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlan;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentProvider: string;
  providerTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  promoCode?: string;
  paymentMethodId?: string;
}

export interface SubscriptionCheckout {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  promoCode?: string;
  successUrl: string;
  cancelUrl: string;
}

// ============================================
// ANALYTICS & TRACKING TYPES
// ============================================

export interface VideoAnalytics {
  id: string;
  userId?: string;
  movieSlug: string;
  episodeSlug?: string;
  sessionId: string;

  // Playback metrics
  playCount: number;
  pauseCount: number;
  seekCount: number;
  bufferCount: number;
  qualityChanges: number;

  // Time metrics
  watchDurationSeconds: number;
  bufferDurationSeconds: number;
  sessionDurationSeconds: number;

  // Quality metrics
  averageBitrate?: number;
  startupTimeMs?: number;

  // Device info
  deviceType?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;

  // Engagement metrics
  completionRate?: number;
  dropOffPointSeconds?: number;

  createdAt: Date;
  endedAt?: Date;
}

export interface PageAnalytics {
  id: string;
  userId?: string;
  pagePath: string;
  sessionId?: string;
  referrer?: string;

  // Performance metrics (Core Web Vitals)
  ttfbMs?: number; // Time to First Byte
  fcpMs?: number; // First Contentful Paint
  lcpMs?: number; // Largest Contentful Paint
  fidMs?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // User engagement
  timeOnPageSeconds?: number;
  scrollDepthPercentage?: number;

  // Device info
  deviceType?: string;
  browser?: string;
  os?: string;

  createdAt: Date;
}

export interface ViewingHistory {
  id: string;
  userId: string;
  movieSlug: string;
  episodeSlug?: string;
  progressSeconds: number;
  durationSeconds?: number;
  watchPercentage?: number;
  completed: boolean;
  videoQuality?: string;
  deviceType?: string;
  metadata?: Record<string, any>;
  watchedAt: Date;
  updatedAt: Date;
}

export interface MovieStats {
  movieSlug: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  averageRating?: number;
  totalRatings: number;
  totalFavorites: number;
  totalComments: number;
  period: '24h' | '7d' | '30d' | 'all';
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMovies: number;
  totalViews: number;
  averageWatchTime: number;
  revenueThisMonth: number;
  newSubscribers: number;
  churnRate: number;
  topMovies: Array<{
    slug: string;
    title: string;
    views: number;
    rating: number;
  }>;
  topCategories: Array<{
    slug: string;
    name: string;
    views: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  revenueGrowth: Array<{
    date: string;
    revenue: number;
  }>;
}

// ============================================
// ADMIN & MODERATION TYPES
// ============================================

export interface ContentReport {
  id: string;
  reporterId: string;
  contentType: 'comment' | 'review' | 'user';
  contentId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  reporter?: UserProfile;
  reviewer?: UserProfile;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  actionType: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
  admin?: UserProfile;
}

export interface UserManagement {
  user: UserProfile;
  subscription?: UserSubscription;
  stats: {
    totalWatchTime: number;
    totalMoviesWatched: number;
    totalComments: number;
    totalReviews: number;
    totalReports: number;
    accountAge: number;
    lastActive: Date;
  };
}

// ============================================
// CACHE & PERFORMANCE TYPES
// ============================================

export interface CacheEntry<T> {
  data: T;
  cachedAt: Date;
  expiresAt: Date;
  version: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  revalidate?: boolean;
}

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    cached?: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

// ============================================
// REAL-TIME TYPES
// ============================================

export interface RealtimeEvent<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  old?: T;
  new?: T;
  timestamp: Date;
}

export interface WebSocketMessage {
  event: string;
  payload: any;
  timestamp: Date;
}

// ============================================
// FORM & VALIDATION TYPES
// ============================================

export interface CommentFormData {
  content: string;
  parentId?: string;
  movieSlug: string;
}

export interface ReviewFormData {
  movieSlug: string;
  title?: string;
  content: string;
  rating?: number;
  spoiler?: boolean;
}

export interface ReportFormData {
  contentType: 'comment' | 'review' | 'user';
  contentId: string;
  reason: string;
  description?: string;
}

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: Partial<UserPreferencesExtended>;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface AdvancedSearchFilters {
  query?: string;
  categories?: string[];
  countries?: string[];
  years?: number[];
  types?: string[];
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'views' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchSuggestion {
  type: 'movie' | 'category' | 'actor' | 'director';
  value: string;
  label: string;
  metadata?: Record<string, any>;
}

// ============================================
// EXPORT UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type WithId<T> = T & {
  id: string;
};
