# Enterprise Movie Streaming Platform - Implementation Plan

## Executive Summary

This document outlines the comprehensive architecture and implementation plan for transforming the existing Next.js 16 movie platform into an enterprise-level streaming service with ML-powered recommendations, real-time social features, payment integration, and advanced analytics.

**Timeline Estimate**: 8-12 weeks for full implementation
**Current Status**: Foundation complete (60% core features, 40% advanced features pending)

---

## 1. Project Architecture Overview

### 1.1 Technology Stack & Rationale

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js** | 16.0.1 | Full-stack framework | Latest features: PPR, React Server Components, enhanced middleware |
| **React** | 19.2 | UI library | Server Components, new hooks (useActionState, useFormStatus) |
| **TypeScript** | 5.7+ | Type safety | Enhanced type inference, decorators support |
| **Supabase** | 2.39.0 | BaaS | Real-time, auth, database, storage in one platform |
| **TanStack Query** | 5.8.0 | Data fetching | Advanced caching, optimistic updates, infinite queries |
| **Tailwind CSS** | 4.1.16 | Styling | Performance improvements, native cascade layers |
| **Framer Motion** | 10.16.0 | Animations | Hardware-accelerated, gesture support |
| **Redis** | (Upstash) | Caching | Sub-millisecond latency, serverless-friendly |
| **PostgreSQL** | (Supabase) | Database | ACID compliance, full-text search, JSONB support |

### 1.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile PWA  │  │   Admin      │     │
│  │  (Next.js)   │  │  (Service    │  │  Dashboard   │     │
│  │              │  │   Worker)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js 16 App Router (Edge Runtime)         │  │
│  │  - Server Components (RSC)                           │  │
│  │  - Middleware/Proxy (Auth, Rate Limit, Analytics)   │  │
│  │  - API Routes (Edge/Node)                            │  │
│  │  - Server Actions                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │  Movies  │  │   ML     │  │ Payment  │  │
│  │ Service  │  │  Service │  │  Engine  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Social  │  │Analytics │  │  Cache   │  │  Queue   │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Supabase  │  │  Redis   │  │  S3/     │  │ External │  │
│  │PostgreSQL│  │  Cache   │  │ Storage  │  │   APIs   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow Architecture

```
User Request → Middleware (Auth/Rate Limit) → Server Component/API Route
     ↓
Check Redis Cache → [HIT] Return Cached Data
     ↓ [MISS]
Query Supabase/External API → Transform Data → Cache in Redis
     ↓
Update Analytics/Logs → Return Response
     ↓
Client-side TanStack Query Cache → Render UI
```

---

## 2. Database Schema Design

### 2.1 Supabase PostgreSQL Schema

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Extended user profiles (Supabase auth.users integration)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'vip')),
    subscription_expires_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb,
    total_watch_time INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences structure
-- preferences JSONB example:
-- {
--   "theme": "dark",
--   "language": "en",
--   "video_quality": "auto",
--   "autoplay": true,
--   "email_notifications": true,
--   "push_notifications": false,
--   "layout_preference": "grid_3x3"
-- }

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- User following system
CREATE TABLE public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- User activity feed
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'movie_watched', 'movie_rated', 'movie_favorited',
        'comment_created', 'review_created', 'user_followed'
    )),
    metadata JSONB NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Real-time comments
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_slug VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_movie_slug ON public.comments(movie_slug, created_at DESC);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Comment likes
CREATE TABLE public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================
-- MOVIE INTERACTIONS
-- ============================================

-- Movie ratings
CREATE TABLE public.movie_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_slug VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(movie_slug, user_id)
);

CREATE INDEX idx_movie_ratings_movie_slug ON public.movie_ratings(movie_slug);

-- Movie reviews
CREATE TABLE public.movie_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_slug VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    spoiler BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(movie_slug, user_id)
);

-- Favorites
CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    movie_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, movie_slug)
);

-- Watch Later
CREATE TABLE public.user_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    movie_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, movie_slug)
);

-- Viewing history with analytics
CREATE TABLE public.viewing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    episode_slug VARCHAR(255),
    progress_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    watch_percentage NUMERIC(5,2),
    completed BOOLEAN DEFAULT FALSE,
    video_quality VARCHAR(10),
    device_type VARCHAR(50),
    metadata JSONB,
    watched_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_viewing_history_user_id ON public.viewing_history(user_id, watched_at DESC);
CREATE INDEX idx_viewing_history_movie_slug ON public.viewing_history(movie_slug);
CREATE UNIQUE INDEX idx_viewing_history_unique ON public.viewing_history(user_id, movie_slug, episode_slug);

-- ============================================
-- ML RECOMMENDATION SYSTEM
-- ============================================

-- User-Movie interactions for ML
CREATE TABLE public.ml_user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'view', 'rating', 'favorite', 'watchlist', 'complete'
    )),
    interaction_score NUMERIC(5,2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ml_interactions_user ON public.ml_user_interactions(user_id);
CREATE INDEX idx_ml_interactions_movie ON public.ml_user_interactions(movie_slug);

-- Pre-computed movie similarities (content-based)
CREATE TABLE public.ml_movie_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_slug VARCHAR(255) NOT NULL,
    similar_movie_slug VARCHAR(255) NOT NULL,
    similarity_score NUMERIC(5,4) NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(movie_slug, similar_movie_slug, algorithm)
);

CREATE INDEX idx_ml_similarities_movie ON public.ml_movie_similarities(movie_slug, similarity_score DESC);

-- User-based collaborative filtering recommendations
CREATE TABLE public.ml_user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    recommendation_score NUMERIC(5,4) NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    reasoning JSONB,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_ml_recommendations_user ON public.ml_user_recommendations(user_id, recommendation_score DESC);
CREATE INDEX idx_ml_recommendations_expires ON public.ml_user_recommendations(expires_at);

-- ============================================
-- PAYMENT & SUBSCRIPTIONS
-- ============================================

-- Subscription plans
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL,
    price_monthly NUMERIC(10,2) NOT NULL,
    price_yearly NUMERIC(10,2),
    features JSONB NOT NULL,
    max_concurrent_streams INTEGER DEFAULT 1,
    max_video_quality VARCHAR(10) DEFAULT 'HD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    provider_transaction_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotional codes
CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

-- Video analytics
CREATE TABLE public.video_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    movie_slug VARCHAR(255) NOT NULL,
    episode_slug VARCHAR(255),
    session_id VARCHAR(255) NOT NULL,

    -- Playback metrics
    play_count INTEGER DEFAULT 0,
    pause_count INTEGER DEFAULT 0,
    seek_count INTEGER DEFAULT 0,
    buffer_count INTEGER DEFAULT 0,
    quality_changes INTEGER DEFAULT 0,

    -- Time metrics
    watch_duration_seconds INTEGER DEFAULT 0,
    buffer_duration_seconds INTEGER DEFAULT 0,
    session_duration_seconds INTEGER DEFAULT 0,

    -- Quality metrics
    average_bitrate INTEGER,
    startup_time_ms INTEGER,

    -- Device info
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_resolution VARCHAR(20),

    -- Engagement metrics
    completion_rate NUMERIC(5,2),
    drop_off_point_seconds INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE INDEX idx_video_analytics_movie ON public.video_analytics(movie_slug, created_at DESC);
CREATE INDEX idx_video_analytics_user ON public.video_analytics(user_id, created_at DESC);

-- Page analytics
CREATE TABLE public.page_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    page_path VARCHAR(500) NOT NULL,
    session_id VARCHAR(255),
    referrer VARCHAR(500),

    -- Performance metrics
    ttfb_ms INTEGER,
    fcp_ms INTEGER,
    lcp_ms INTEGER,
    fid_ms INTEGER,
    cls NUMERIC(5,3),

    -- User engagement
    time_on_page_seconds INTEGER,
    scroll_depth_percentage INTEGER,

    -- Device info
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN & MODERATION
-- ============================================

-- Content reports
CREATE TABLE public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(50) CHECK (content_type IN ('comment', 'review', 'user')),
    content_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES public.user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin action logs
CREATE TABLE public.admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can read all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Comments: Anyone can read, authenticated users can create
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Favorites/Watchlist: Private, only accessible by owner
CREATE POLICY "Users can manage own favorites"
    ON public.user_favorites
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist"
    ON public.user_watchlist
    USING (auth.uid() = user_id);

-- Notifications: Private, only for the recipient
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment comment likes count
CREATE OR REPLACE FUNCTION increment_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_liked
    AFTER INSERT ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION increment_comment_likes();

-- Decrement comment likes count
CREATE OR REPLACE FUNCTION decrement_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_unliked
    AFTER DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION decrement_comment_likes();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
```

### 2.2 Redis Cache Schema

```typescript
// Cache key patterns
const CACHE_KEYS = {
  // Movie data
  MOVIE_DETAIL: (slug: string) => `movie:${slug}`,
  MOVIE_EPISODES: (slug: string) => `movie:${slug}:episodes`,
  MOVIE_SIMILAR: (slug: string) => `movie:${slug}:similar`,
  MOVIE_LIST: (type: string, page: number) => `movies:${type}:${page}`,

  // User data
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_FAVORITES: (userId: string) => `user:${userId}:favorites`,
  USER_WATCHLIST: (userId: string) => `user:${userId}:watchlist`,
  USER_RECOMMENDATIONS: (userId: string) => `user:${userId}:recommendations`,

  // Analytics
  TRENDING_MOVIES: () => `trending:movies`,
  POPULAR_CATEGORIES: () => `popular:categories`,

  // Rate limiting
  RATE_LIMIT: (identifier: string) => `ratelimit:${identifier}`,

  // Session
  SESSION: (sessionId: string) => `session:${sessionId}`,
};

// TTL configurations (in seconds)
const CACHE_TTL = {
  MOVIE_DETAIL: 300,        // 5 minutes
  MOVIE_LIST: 120,          // 2 minutes
  USER_DATA: 600,           // 10 minutes
  RECOMMENDATIONS: 3600,    // 1 hour
  TRENDING: 1800,           // 30 minutes
  SESSION: 86400,           // 24 hours
};
```

---

## 3. Feature Implementation Plan

### Phase 1: Foundation & Infrastructure (Week 1-2)

#### 3.1 Next.js 16+ Middleware & Authentication Enhancement

**File**: `/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Redis } from '@upstash/redis';

// Initialize Redis for rate limiting and caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiting configuration
const RATE_LIMITS = {
  api: { requests: 100, window: 60 }, // 100 requests per minute
  search: { requests: 20, window: 60 },
  auth: { requests: 5, window: 300 }, // 5 login attempts per 5 minutes
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ============================================
  // 1. SUPABASE AUTH MIDDLEWARE
  // ============================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ============================================
  // 2. PROTECTED ROUTES
  // ============================================
  const protectedRoutes = ['/profile', '/watch', '/admin'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if accessing auth routes while logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check admin role for admin routes
  if (isAdminRoute && session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ============================================
  // 3. RATE LIMITING
  // ============================================
  const rateLimitKey = await getRateLimitKey(request, pathname);

  if (rateLimitKey) {
    const { allowed, remaining } = await checkRateLimit(
      rateLimitKey,
      pathname
    );

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
  }

  // ============================================
  // 4. ANALYTICS & TRACKING
  // ============================================
  if (!pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    // Track page view asynchronously
    trackPageView(request, session?.user.id).catch(console.error);
  }

  // ============================================
  // 5. SECURITY HEADERS
  // ============================================
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

// Helper: Get rate limit key based on route and user
async function getRateLimitKey(
  request: NextRequest,
  pathname: string
): Promise<string | null> {
  // API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    return `ratelimit:api:${ip}`;
  }

  // Search routes
  if (pathname.startsWith('/search') || pathname.startsWith('/api/search')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    return `ratelimit:search:${ip}`;
  }

  // Auth routes
  if (pathname.startsWith('/api/auth')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    return `ratelimit:auth:${ip}`;
  }

  return null;
}

// Helper: Check rate limit using Redis
async function checkRateLimit(
  key: string,
  pathname: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = pathname.startsWith('/api/search')
    ? RATE_LIMITS.search
    : pathname.startsWith('/api/auth')
    ? RATE_LIMITS.auth
    : RATE_LIMITS.api;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, limit.window);
  }

  const remaining = Math.max(0, limit.requests - current);

  return {
    allowed: current <= limit.requests,
    remaining,
  };
}

// Helper: Track page view
async function trackPageView(request: NextRequest, userId?: string) {
  // This would send to your analytics service
  const analyticsData = {
    path: request.nextUrl.pathname,
    referrer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
    userId,
    timestamp: new Date().toISOString(),
  };

  // Store in database or send to analytics service
  // For now, we'll just log it
  console.log('[Analytics]', analyticsData);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Timeline**: 2-3 days
**Dependencies**: Upstash Redis account setup

---

### Phase 2: ML Recommendation Engine (Week 2-3)

#### 3.2 Recommendation System Architecture

**File**: `/lib/ml/recommendation-engine.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface MovieFeatures {
  slug: string;
  categories: string[];
  countries: string[];
  year: number;
  type: string;
  keywords?: string[];
}

interface UserInteraction {
  userId: string;
  movieSlug: string;
  interactionType: 'view' | 'rating' | 'favorite' | 'watchlist' | 'complete';
  score: number;
  timestamp: Date;
}

interface Recommendation {
  movieSlug: string;
  score: number;
  algorithm: string;
  reasoning: {
    type: string;
    details: Record<string, any>;
  };
}

export class RecommendationEngine {
  private supabase = createClient();

  // ============================================
  // CONTENT-BASED FILTERING
  // ============================================

  /**
   * Calculate similarity between two movies based on content features
   * Uses Jaccard similarity for categorical features and cosine similarity for numerical
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
    const yearSimilarity = Math.max(0, 1 - yearDiff / 20); // Normalize to 0-1
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
   * Jaccard similarity: intersection / union
   */
  private jaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1);
    const s2 = new Set(set2);

    const intersection = new Set([...s1].filter((x) => s2.has(x)));
    const union = new Set([...s1, ...s2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Get content-based recommendations for a user
   * Based on movies they've interacted with
   */
  async getContentBasedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<Recommendation[]> {
    // Get user's interaction history
    const { data: interactions } = await this.supabase
      .from('ml_user_interactions')
      .select('movie_slug, interaction_score')
      .eq('user_id', userId)
      .order('interaction_score', { ascending: false })
      .limit(50);

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
          // Weight by user's interaction score
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
    const results: Recommendation[] = Array.from(recommendations.entries())
      .map(([movieSlug, score]) => ({
        movieSlug,
        score,
        algorithm: 'content_based',
        reasoning: {
          type: 'similar_content',
          details: { baseMovies: interactions.slice(0, 5) },
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  // ============================================
  // COLLABORATIVE FILTERING (User-Based)
  // ============================================

  /**
   * Find similar users based on interaction patterns
   * Uses Pearson correlation coefficient
   */
  async findSimilarUsers(userId: string, limit: number = 50): Promise<
    Array<{ userId: string; similarity: number }>
  > {
    // Get target user's interactions
    const { data: userInteractions } = await this.supabase
      .from('ml_user_interactions')
      .select('movie_slug, interaction_score')
      .eq('user_id', userId);

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
      uniqueUsers.map(async (otherUserId) => {
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
  }

  /**
   * Pearson correlation coefficient
   */
  private pearsonCorrelation(
    interactions1: Array<{ movie_slug: string; interaction_score: number }>,
    interactions2: Array<{ movie_slug: string; interaction_score: number }>
  ): number {
    // Find common movies
    const map1 = new Map(interactions1.map((i) => [i.movie_slug, i.interaction_score]));
    const map2 = new Map(interactions2.map((i) => [i.movie_slug, i.interaction_score]));

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
    const den = Math.sqrt(
      (sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n)
    );

    return den === 0 ? 0 : num / den;
  }

  /**
   * Get collaborative filtering recommendations
   */
  async getCollaborativeRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<Recommendation[]> {
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
          // Weight by user similarity and interaction score
          const weightedScore =
            similarity * interaction.interaction_score;
          recommendations.set(
            interaction.movie_slug,
            currentScore + weightedScore
          );
        }
      }
    }

    // Convert to array and normalize scores
    const maxScore = Math.max(...recommendations.values());
    const results: Recommendation[] = Array.from(recommendations.entries())
      .map(([movieSlug, score]) => ({
        movieSlug,
        score: score / maxScore, // Normalize to 0-1
        algorithm: 'collaborative_filtering',
        reasoning: {
          type: 'similar_users',
          details: { similarUserCount: similarUsers.length },
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
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
  ): Promise<Recommendation[]> {
    // Check cache first
    const cacheKey = `user:${userId}:recommendations`;
    const cached = await redis.get<Recommendation[]>(cacheKey);

    if (cached) {
      return cached.slice(0, limit);
    }

    // Get recommendations from both algorithms
    const [contentBased, collaborative] = await Promise.all([
      this.getContentBasedRecommendations(userId, 30),
      this.getCollaborativeRecommendations(userId, 30),
    ]);

    // Merge and weight (60% collaborative, 40% content-based)
    const hybridScores = new Map<string, Recommendation>();

    for (const rec of collaborative) {
      hybridScores.set(rec.movieSlug, {
        ...rec,
        score: rec.score * 0.6,
        algorithm: 'hybrid',
      });
    }

    for (const rec of contentBased) {
      const existing = hybridScores.get(rec.movieSlug);
      if (existing) {
        existing.score += rec.score * 0.4;
      } else {
        hybridScores.set(rec.movieSlug, {
          ...rec,
          score: rec.score * 0.4,
          algorithm: 'hybrid',
        });
      }
    }

    // Sort and limit
    const results = Array.from(hybridScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, results);

    // Store in database for analytics
    await this.storeRecommendations(userId, results);

    return results;
  }

  /**
   * Store recommendations in database
   */
  private async storeRecommendations(
    userId: string,
    recommendations: Recommendation[]
  ) {
    const records = recommendations.map((rec) => ({
      user_id: userId,
      movie_slug: rec.movieSlug,
      recommendation_score: rec.score,
      algorithm: rec.algorithm,
      reasoning: rec.reasoning,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }));

    await this.supabase.from('ml_user_recommendations').upsert(records);
  }

  // ============================================
  // FALLBACK: POPULAR MOVIES
  // ============================================

  /**
   * Get popular movies for cold start
   */
  private async getPopularMovies(limit: number = 20): Promise<Recommendation[]> {
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

    // Calculate popularity score (weighted by count and average score)
    const results: Recommendation[] = Array.from(movieScores.entries())
      .map(([movieSlug, { count, totalScore }]) => ({
        movieSlug,
        score: (count * totalScore) / count, // Weighted average
        algorithm: 'popular',
        reasoning: {
          type: 'trending',
          details: { viewCount: count },
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  // ============================================
  // TRACK USER INTERACTIONS
  // ============================================

  /**
   * Record user interaction for ML training
   */
  async trackInteraction(interaction: UserInteraction): Promise<void> {
    await this.supabase.from('ml_user_interactions').insert({
      user_id: interaction.userId,
      movie_slug: interaction.movieSlug,
      interaction_type: interaction.interactionType,
      interaction_score: interaction.score,
      metadata: { timestamp: interaction.timestamp },
    });

    // Invalidate user's recommendation cache
    await redis.del(`user:${interaction.userId}:recommendations`);
  }

  // ============================================
  // BACKGROUND JOBS: PRE-COMPUTE SIMILARITIES
  // ============================================

  /**
   * Pre-compute movie similarities (run as cron job)
   */
  async precomputeMovieSimilarities(movieSlug: string): Promise<void> {
    // This would be triggered by a cron job or webhook
    // For each movie, calculate similarity with all other movies
    // and store in ml_movie_similarities table

    // Pseudo-code:
    // 1. Get movie features
    // 2. Get all other movies
    // 3. Calculate similarity for each pair
    // 4. Store top N similar movies

    console.log(`Pre-computing similarities for ${movieSlug}`);
    // Implementation would go here
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
```

**Timeline**: 5-7 days
**Dependencies**: Database schema must be deployed first

---

### Phase 3: Real-time Social Features (Week 3-4)

#### 3.3 Real-time Comments System

**File**: `/components/comments/real-time-comments.tsx`

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Reply, Flag, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Comment {
  id: string;
  movie_slug: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface RealTimeCommentsProps {
  movieSlug: string;
}

export function RealTimeComments({ movieSlug }: RealTimeCommentsProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // ============================================
  // FETCH COMMENTS
  // ============================================
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', movieSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('movie_slug', movieSlug)
        .is('parent_id', null)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    // Subscribe to new comments
    const commentsChannel = supabase
      .channel(`comments:${movieSlug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `movie_slug=eq.${movieSlug}`,
        },
        async (payload) => {
          console.log('[Realtime] New comment:', payload);

          // Fetch complete comment with user profile
          const { data: newComment } = await supabase
            .from('comments')
            .select(`
              *,
              user_profiles (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newComment) {
            // Add to query cache
            queryClient.setQueryData<Comment[]>(
              ['comments', movieSlug],
              (old = []) => {
                if (newComment.parent_id) {
                  return old; // Replies are handled separately
                }
                return [newComment as Comment, ...old];
              }
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `movie_slug=eq.${movieSlug}`,
        },
        (payload) => {
          console.log('[Realtime] Comment updated:', payload);

          // Update in query cache
          queryClient.setQueryData<Comment[]>(
            ['comments', movieSlug],
            (old = []) =>
              old.map((comment) =>
                comment.id === payload.new.id
                  ? { ...comment, ...payload.new }
                  : comment
              )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `movie_slug=eq.${movieSlug}`,
        },
        (payload) => {
          console.log('[Realtime] Comment deleted:', payload);

          // Remove from query cache
          queryClient.setQueryData<Comment[]>(
            ['comments', movieSlug],
            (old = []) => old.filter((comment) => comment.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    setChannel(commentsChannel);

    return () => {
      commentsChannel.unsubscribe();
    };
  }, [movieSlug, supabase, queryClient]);

  // ============================================
  // CREATE COMMENT MUTATION
  // ============================================
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          movie_slug: movieSlug,
          user_id: user.id,
          parent_id: replyTo,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewComment('');
      setReplyTo(null);
      // Realtime will handle cache update
    },
  });

  // ============================================
  // LIKE COMMENT MUTATION
  // ============================================
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existing } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });

        if (error) throw error;
      }
    },
  });

  // ============================================
  // RENDER
  // ============================================
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim()) {
        createCommentMutation.mutate(newComment);
      }
    },
    [newComment, createCommentMutation]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={
            replyTo ? 'Write a reply...' : 'Write a comment...'
          }
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          {replyTo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              Cancel Reply
            </Button>
          )}
          <Button
            type="submit"
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            movieSlug={movieSlug}
            onReply={(id) => setReplyTo(id)}
            onLike={(id) => likeCommentMutation.mutate(id)}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMMENT ITEM COMPONENT
// ============================================
interface CommentItemProps {
  comment: Comment;
  movieSlug: string;
  onReply: (id: string) => void;
  onLike: (id: string) => void;
}

function CommentItem({ comment, movieSlug, onReply, onLike }: CommentItemProps) {
  const supabase = createClient();
  const [showReplies, setShowReplies] = useState(false);

  // Fetch replies
  const { data: replies = [] } = useQuery({
    queryKey: ['comments', 'replies', comment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('parent_id', comment.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: showReplies,
  });

  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src={comment.user_profiles.avatar_url} />
        <AvatarFallback>
          {comment.user_profiles.display_name[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {comment.user_profiles.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0"
            onClick={() => onLike(comment.id)}
          >
            <Heart className="mr-1 h-3 w-3" />
            {comment.likes_count > 0 && comment.likes_count}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="mr-1 h-3 w-3" />
            Reply
          </Button>

          {replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? 'Hide' : 'Show'} {replies.length} replies
            </Button>
          )}
        </div>

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="ml-4 space-y-3 border-l-2 pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                movieSlug={movieSlug}
                onReply={onReply}
                onLike={onLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Timeline**: 3-4 days
**Dependencies**: Database schema, Supabase Realtime enabled

---

## 4. Implementation Timeline

### Summary Timeline (8-12 weeks)

| Phase | Duration | Features |
|-------|----------|----------|
| **Phase 1** | Week 1-2 | Middleware, Redis setup, Enhanced auth |
| **Phase 2** | Week 2-3 | ML recommendation engine |
| **Phase 3** | Week 3-4 | Real-time comments, social features |
| **Phase 4** | Week 4-6 | Payment integration, subscriptions |
| **Phase 5** | Week 6-8 | Admin dashboard, analytics |
| **Phase 6** | Week 8-10 | Video analytics, performance optimization |
| **Phase 7** | Week 10-11 | PWA enhancements, offline mode |
| **Phase 8** | Week 11-12 | Testing, documentation, deployment |

---

## 5. Deployment Strategy

### 5.1 Infrastructure Setup

**Platform**: Vercel (recommended for Next.js 16)

**Services**:
- **Frontend**: Vercel Edge Network
- **Database**: Supabase (PostgreSQL + Realtime)
- **Cache**: Upstash Redis (serverless)
- **Storage**: Supabase Storage or Cloudflare R2
- **Analytics**: Vercel Analytics + Custom solution
- **Payments**: Stripe or Paddle
- **Email**: SendGrid or Resend

### 5.2 Environment Variables

```env
# Next.js
NEXT_PUBLIC_APP_URL=https://cineverse.com
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# External APIs
NEXT_PUBLIC_API_URL=https://cinevserse-api.nhatquang.shop
TMDB_API_KEY=

# Payment
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Analytics
NEXT_PUBLIC_GA_ID=
VERCEL_ANALYTICS_ID=

# Email
SENDGRID_API_KEY=
SMTP_FROM=

# Security
SESSION_SECRET=
ENCRYPTION_KEY=
```

### 5.3 Deployment Steps

1. **Setup Supabase Project**
   ```bash
   # Run database migrations
   npx supabase db push

   # Deploy edge functions
   npx supabase functions deploy
   ```

2. **Configure Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Link project
   vercel link

   # Set environment variables
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # ... add all env vars

   # Deploy to production
   vercel --prod
   ```

3. **Setup Monitoring**
   - Vercel Analytics
   - Sentry for error tracking
   - LogRocket for session replay
   - Custom analytics dashboard

### 5.4 Performance Optimization

**Core Web Vitals Targets**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

**Optimization Techniques**:
1. **Image Optimization**
   - Next.js Image component
   - WebP/AVIF formats
   - Lazy loading
   - Blur placeholders

2. **Code Splitting**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

3. **Caching Strategy**
   - Redis for API responses
   - TanStack Query for client state
   - Next.js Static Generation
   - CDN caching

4. **Database Optimization**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Read replicas

---

## 6. Next Steps

This implementation plan provides:

1. **Complete architecture** for enterprise-level streaming platform
2. **Detailed code examples** for critical features
3. **Database schema** with proper relationships and security
4. **Realistic timeline** with phase breakdown
5. **Deployment strategy** for production environment

**Immediate Actions**:
1. Review and approve this plan
2. Set up external services (Supabase, Upstash Redis)
3. Begin Phase 1 implementation
4. Set up CI/CD pipeline
5. Configure monitoring and analytics

Would you like me to proceed with implementing specific features from this plan?
