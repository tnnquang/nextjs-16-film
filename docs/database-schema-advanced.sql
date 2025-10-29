-- Advanced Features Database Schema for Supabase
-- This schema supports: Real-time Comments, Activity Feed, Video Analytics, and Recommendations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  movie_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON public.comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENT LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Comment likes are viewable by everyone" 
  ON public.comment_likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like comments" 
  ON public.comment_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" 
  ON public.comment_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENT REACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);

-- Enable RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reactions are viewable by everyone" 
  ON public.comment_reactions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can react" 
  ON public.comment_reactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reactions" 
  ON public.comment_reactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their reactions" 
  ON public.comment_reactions FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  type TEXT CHECK (type IN ('watch', 'rate', 'comment', 'favorite', 'follow', 'share', 'review')),
  movie_id TEXT,
  movie_name TEXT,
  movie_poster TEXT,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_name TEXT,
  content TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_movie_id ON public.activities(movie_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Activities are viewable by everyone" 
  ON public.activities FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own activities" 
  ON public.activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FOLLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Follows are viewable by everyone" 
  ON public.follows FOR SELECT 
  USING (true);

CREATE POLICY "Users can follow others" 
  ON public.follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
  ON public.follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- ============================================================================
-- WATCH SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.watch_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  episode INTEGER,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_watch_time INTEGER DEFAULT 0, -- in seconds
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  quality_used TEXT[] DEFAULT ARRAY['auto'],
  buffer_count INTEGER DEFAULT 0,
  total_buffer_time INTEGER DEFAULT 0, -- in seconds
  device_type TEXT,
  browser TEXT,
  ip_address INET,
  location TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_id ON public.watch_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_movie_id ON public.watch_sessions(movie_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_start_time ON public.watch_sessions(start_time DESC);

-- Enable RLS
ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions" 
  ON public.watch_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.watch_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.watch_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admin can view all sessions
CREATE POLICY "Admins can view all sessions" 
  ON public.watch_sessions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- VIDEO EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.video_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  episode INTEGER,
  event_type TEXT CHECK (event_type IN ('play', 'pause', 'seek', 'complete', 'buffer', 'error', 'quality_change')),
  timestamp INTEGER NOT NULL, -- video timestamp in seconds
  duration INTEGER NOT NULL, -- total video duration
  quality TEXT,
  buffer_time DECIMAL(10,2), -- in seconds
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_video_events_user_id ON public.video_events(user_id);
CREATE INDEX IF NOT EXISTS idx_video_events_movie_id ON public.video_events(movie_id);
CREATE INDEX IF NOT EXISTS idx_video_events_event_type ON public.video_events(event_type);
CREATE INDEX IF NOT EXISTS idx_video_events_created_at ON public.video_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.video_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own events" 
  ON public.video_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all events
CREATE POLICY "Admins can view all events" 
  ON public.video_events FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- USER RATINGS TABLE (for recommendations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON public.user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_movie_id ON public.user_ratings(movie_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON public.user_ratings(rating DESC);

-- Enable RLS
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ratings are viewable by everyone" 
  ON public.user_ratings FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own ratings" 
  ON public.user_ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
  ON public.user_ratings FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON public.favorites(movie_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
  ON public.favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
  ON public.favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create activity when user rates a movie
CREATE OR REPLACE FUNCTION create_rating_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activities (user_id, user_name, user_avatar, type, movie_id, rating)
  SELECT 
    NEW.user_id, 
    p.username, 
    p.avatar_url, 
    'rate', 
    NEW.movie_id, 
    NEW.rating
  FROM public.profiles p
  WHERE p.id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_created AFTER INSERT ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION create_rating_activity();

-- Function to create activity when user favorites a movie
CREATE OR REPLACE FUNCTION create_favorite_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activities (user_id, user_name, user_avatar, type, movie_id)
  SELECT 
    NEW.user_id, 
    p.username, 
    p.avatar_url, 
    'favorite', 
    NEW.movie_id
  FROM public.profiles p
  WHERE p.id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_favorite_created AFTER INSERT ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION create_favorite_activity();

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_sessions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View for movie statistics
CREATE OR REPLACE VIEW public.movie_statistics AS
SELECT 
  movie_id,
  COUNT(DISTINCT user_id) as total_viewers,
  COUNT(*) as total_views,
  AVG(total_watch_time) as avg_watch_time,
  AVG(completion_percentage) as avg_completion_rate,
  SUM(buffer_count) as total_buffers,
  AVG(total_buffer_time) as avg_buffer_time
FROM public.watch_sessions
GROUP BY movie_id;

-- View for user engagement metrics
CREATE OR REPLACE VIEW public.user_engagement_metrics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_activities
FROM public.activities
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample admin user (update with your actual user ID after auth)
-- INSERT INTO public.profiles (id, username, full_name, role)
-- VALUES ('your-user-id-here', 'admin', 'Admin User', 'admin')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_user_type_created 
  ON public.activities(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_watch_sessions_movie_start 
  ON public.watch_sessions(movie_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_video_events_movie_type_created 
  ON public.video_events(movie_id, event_type, created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.comments IS 'Stores user comments with real-time support';
COMMENT ON TABLE public.activities IS 'Stores user activities for social feed';
COMMENT ON TABLE public.watch_sessions IS 'Tracks video watching sessions for analytics';
COMMENT ON TABLE public.video_events IS 'Tracks detailed video player events';
COMMENT ON TABLE public.user_ratings IS 'Stores user ratings for recommendation engine';
COMMENT ON TABLE public.follows IS 'Stores user follow relationships';
