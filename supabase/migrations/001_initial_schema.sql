-- ============================================
-- CINEVERSE PLATFORM - DATABASE SCHEMA
-- Migration: 001_initial_schema
-- Description: Core tables for social features, ML recommendations, payments, and analytics
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Extended user profiles (Supabase auth.users integration)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'vip')),
    subscription_expires_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{
        "theme": "dark",
        "language": "en",
        "video_quality": "auto",
        "autoplay": true,
        "email_notifications": true,
        "push_notifications": false,
        "layout_preference": "grid_3x3"
    }'::jsonb,
    total_watch_time INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_profiles
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_subscription ON public.user_profiles(subscription_tier, subscription_expires_at);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- User following system
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- User activity feed
CREATE TABLE IF NOT EXISTS public.user_activities (
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

CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id, created_at DESC);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Real-time comments
CREATE TABLE IF NOT EXISTS public.comments (
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

CREATE INDEX idx_comments_movie_slug ON public.comments(movie_slug, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- Comment likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON public.comment_likes(user_id);

-- ============================================
-- MOVIE INTERACTIONS
-- ============================================

-- Movie ratings
CREATE TABLE IF NOT EXISTS public.movie_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_slug VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(movie_slug, user_id)
);

CREATE INDEX idx_movie_ratings_movie_slug ON public.movie_ratings(movie_slug);
CREATE INDEX idx_movie_ratings_user_id ON public.movie_ratings(user_id);

-- Movie reviews
CREATE TABLE IF NOT EXISTS public.movie_reviews (
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

CREATE INDEX idx_movie_reviews_movie ON public.movie_reviews(movie_slug, created_at DESC);
CREATE INDEX idx_movie_reviews_user ON public.movie_reviews(user_id);

-- Favorites
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    movie_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, movie_slug)
);

CREATE INDEX idx_user_favorites_user ON public.user_favorites(user_id, created_at DESC);

-- Watch Later
CREATE TABLE IF NOT EXISTS public.user_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    movie_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, movie_slug)
);

CREATE INDEX idx_user_watchlist_user ON public.user_watchlist(user_id, created_at DESC);

-- Viewing history with analytics
CREATE TABLE IF NOT EXISTS public.viewing_history (
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
CREATE UNIQUE INDEX idx_viewing_history_unique ON public.viewing_history(user_id, movie_slug, COALESCE(episode_slug, ''));

-- ============================================
-- ML RECOMMENDATION SYSTEM
-- ============================================

-- User-Movie interactions for ML
CREATE TABLE IF NOT EXISTS public.ml_user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'view', 'rating', 'favorite', 'watchlist', 'complete', 'search'
    )),
    interaction_score NUMERIC(5,2) NOT NULL CHECK (interaction_score >= 0 AND interaction_score <= 1),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ml_interactions_user ON public.ml_user_interactions(user_id, created_at DESC);
CREATE INDEX idx_ml_interactions_movie ON public.ml_user_interactions(movie_slug);
CREATE INDEX idx_ml_interactions_type ON public.ml_user_interactions(interaction_type);

-- Pre-computed movie similarities (content-based)
CREATE TABLE IF NOT EXISTS public.ml_movie_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_slug VARCHAR(255) NOT NULL,
    similar_movie_slug VARCHAR(255) NOT NULL,
    similarity_score NUMERIC(5,4) NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
    algorithm VARCHAR(50) NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(movie_slug, similar_movie_slug, algorithm)
);

CREATE INDEX idx_ml_similarities_movie ON public.ml_movie_similarities(movie_slug, similarity_score DESC);
CREATE INDEX idx_ml_similarities_algorithm ON public.ml_movie_similarities(algorithm);

-- User-based collaborative filtering recommendations
CREATE TABLE IF NOT EXISTS public.ml_user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    movie_slug VARCHAR(255) NOT NULL,
    recommendation_score NUMERIC(5,4) NOT NULL CHECK (recommendation_score >= 0 AND recommendation_score <= 1),
    algorithm VARCHAR(50) NOT NULL,
    reasoning JSONB,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    UNIQUE(user_id, movie_slug, algorithm)
);

CREATE INDEX idx_ml_recommendations_user ON public.ml_user_recommendations(user_id, recommendation_score DESC);
CREATE INDEX idx_ml_recommendations_expires ON public.ml_user_recommendations(expires_at);

-- ============================================
-- PAYMENT & SUBSCRIPTIONS
-- ============================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL,
    price_monthly NUMERIC(10,2) NOT NULL,
    price_yearly NUMERIC(10,2),
    features JSONB NOT NULL,
    max_concurrent_streams INTEGER DEFAULT 1,
    max_video_quality VARCHAR(10) DEFAULT 'HD',
    is_active BOOLEAN DEFAULT TRUE,
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, price_yearly, features, max_concurrent_streams, max_video_quality) VALUES
('Free', 'free', 0, 0, '{"ads": true, "quality": "SD", "downloads": false}'::jsonb, 1, 'SD'),
('Basic', 'basic', 9.99, 99.99, '{"ads": false, "quality": "HD", "downloads": true}'::jsonb, 2, 'HD'),
('Premium', 'premium', 14.99, 149.99, '{"ads": false, "quality": "4K", "downloads": true, "offline": true}'::jsonb, 4, '4K'),
('VIP', 'vip', 19.99, 199.99, '{"ads": false, "quality": "4K", "downloads": true, "offline": true, "early_access": true}'::jsonb, 6, '4K');

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(255),
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id, status);
CREATE INDEX idx_user_subscriptions_stripe ON public.user_subscriptions(stripe_subscription_id);

-- Payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50) DEFAULT 'stripe',
    provider_transaction_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id, created_at DESC);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider ON public.payment_transactions(provider_transaction_id);

-- Promotional codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
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

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code) WHERE is_active = TRUE;

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

-- Video analytics
CREATE TABLE IF NOT EXISTS public.video_analytics (
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
CREATE INDEX idx_video_analytics_session ON public.video_analytics(session_id);

-- Page analytics
CREATE TABLE IF NOT EXISTS public.page_analytics (
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

CREATE INDEX idx_page_analytics_path ON public.page_analytics(page_path, created_at DESC);
CREATE INDEX idx_page_analytics_user ON public.page_analytics(user_id, created_at DESC);

-- ============================================
-- ADMIN & MODERATION
-- ============================================

-- Content reports
CREATE TABLE IF NOT EXISTS public.content_reports (
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

CREATE INDEX idx_content_reports_status ON public.content_reports(status, created_at DESC);
CREATE INDEX idx_content_reports_type ON public.content_reports(content_type);

-- Admin action logs
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON public.admin_action_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_logs_action ON public.admin_action_logs(action_type);
CREATE INDEX idx_admin_logs_created ON public.admin_action_logs(created_at DESC);

-- System notifications
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE INDEX idx_notifications_expires ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can read all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- User follows
CREATE POLICY "Anyone can view follows"
    ON public.user_follows FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can manage own follows"
    ON public.user_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
    ON public.user_follows FOR DELETE
    USING (auth.uid() = follower_id);

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

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Comment likes
CREATE POLICY "Comment likes are viewable by everyone"
    ON public.comment_likes FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can like comments"
    ON public.comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
    ON public.comment_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Movie ratings and reviews
CREATE POLICY "Ratings are viewable by everyone"
    ON public.movie_ratings FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can manage own ratings"
    ON public.movie_ratings
    USING (auth.uid() = user_id);

CREATE POLICY "Reviews are viewable by everyone"
    ON public.movie_reviews FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can manage own reviews"
    ON public.movie_reviews
    USING (auth.uid() = user_id);

-- Favorites/Watchlist: Private, only accessible by owner
CREATE POLICY "Users can manage own favorites"
    ON public.user_favorites
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist"
    ON public.user_watchlist
    USING (auth.uid() = user_id);

-- Viewing history: Private
CREATE POLICY "Users can manage own viewing history"
    ON public.viewing_history
    USING (auth.uid() = user_id);

-- ML interactions: System managed
CREATE POLICY "Users can view own interactions"
    ON public.ml_user_interactions FOR SELECT
    USING (auth.uid() = user_id);

-- Subscriptions: Private
CREATE POLICY "Users can view own subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Transactions: Private
CREATE POLICY "Users can view own transactions"
    ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Notifications: Private
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Content reports
CREATE POLICY "Users can create reports"
    ON public.content_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
    ON public.content_reports FOR SELECT
    USING (auth.uid() = reporter_id);

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
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movie_ratings_updated_at ON public.movie_ratings;
CREATE TRIGGER update_movie_ratings_updated_at
    BEFORE UPDATE ON public.movie_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movie_reviews_updated_at ON public.movie_reviews;
CREATE TRIGGER update_movie_reviews_updated_at
    BEFORE UPDATE ON public.movie_reviews
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

DROP TRIGGER IF EXISTS on_comment_liked ON public.comment_likes;
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

DROP TRIGGER IF EXISTS on_comment_unliked ON public.comment_likes;
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
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Track user activity on interactions
CREATE OR REPLACE FUNCTION track_user_activity()
RETURNS TRIGGER AS $$
DECLARE
    activity_type_val VARCHAR(50);
    metadata_val JSONB;
BEGIN
    -- Determine activity type based on table
    IF TG_TABLE_NAME = 'movie_ratings' THEN
        activity_type_val := 'movie_rated';
        metadata_val := jsonb_build_object('movie_slug', NEW.movie_slug, 'rating', NEW.rating);
    ELSIF TG_TABLE_NAME = 'user_favorites' THEN
        activity_type_val := 'movie_favorited';
        metadata_val := jsonb_build_object('movie_slug', NEW.movie_slug);
    ELSIF TG_TABLE_NAME = 'comments' THEN
        activity_type_val := 'comment_created';
        metadata_val := jsonb_build_object('movie_slug', NEW.movie_slug, 'comment_id', NEW.id);
    ELSIF TG_TABLE_NAME = 'movie_reviews' THEN
        activity_type_val := 'review_created';
        metadata_val := jsonb_build_object('movie_slug', NEW.movie_slug, 'review_id', NEW.id);
    END IF;

    -- Insert activity
    INSERT INTO public.user_activities (user_id, activity_type, metadata)
    VALUES (NEW.user_id, activity_type_val, metadata_val);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply activity tracking triggers
DROP TRIGGER IF EXISTS track_rating_activity ON public.movie_ratings;
CREATE TRIGGER track_rating_activity
    AFTER INSERT ON public.movie_ratings
    FOR EACH ROW EXECUTE FUNCTION track_user_activity();

DROP TRIGGER IF EXISTS track_favorite_activity ON public.user_favorites;
CREATE TRIGGER track_favorite_activity
    AFTER INSERT ON public.user_favorites
    FOR EACH ROW EXECUTE FUNCTION track_user_activity();

DROP TRIGGER IF EXISTS track_comment_activity ON public.comments;
CREATE TRIGGER track_comment_activity
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION track_user_activity();

-- Clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
    DELETE FROM public.ml_user_recommendations
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA & CONFIGURATION
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Migration complete
COMMENT ON SCHEMA public IS 'Cineverse Platform Schema v1.0';
