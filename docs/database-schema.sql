-- CineVerse Database Schema for Supabase
-- This schema extends Supabase's built-in auth.users table

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'moderator', 'admin', 'super_admin')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'basic', 'premium', 'vip')),
  subscription_expires_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{
    "theme": "system",
    "language": "en",
    "autoplay": true,
    "quality": "auto",
    "subtitles": true,
    "volume": 75,
    "notifications": {
      "email": true,
      "push": false,
      "newMovies": true,
      "recommendations": false
    },
    "layout": "grid-3x3",
    "maturityRating": "pg13"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Countries table
CREATE TABLE public.countries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE, -- ISO country code
  flag_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Movies table (cached from external API)
CREATE TABLE public.movies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL, -- ID from external API
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  origin_name TEXT,
  poster_url TEXT,
  thumb_url TEXT,
  year INTEGER,
  type TEXT CHECK (type IN ('single', 'series', 'hoathinh', 'tvshows')),
  status TEXT CHECK (status IN ('completed', 'ongoing', 'trailer')),
  quality TEXT,
  lang TEXT,
  time TEXT, -- Duration
  episode_current TEXT,
  episode_total TEXT,
  content TEXT, -- Synopsis
  trailer_url TEXT,
  is_cinema BOOLEAN DEFAULT false,
  showtimes TEXT,
  notify TEXT,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data from API
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Movie categories relationship
CREATE TABLE public.movie_categories (
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, category_id)
);

-- Movie countries relationship
CREATE TABLE public.movie_countries (
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, country_id)
);

-- Movie cast and crew
CREATE TABLE public.movie_people (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('actor', 'director', 'producer', 'writer')),
  character_name TEXT, -- For actors
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Episodes table
CREATE TABLE public.episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  server_name TEXT NOT NULL,
  episode_name TEXT NOT NULL,
  episode_slug TEXT NOT NULL,
  filename TEXT,
  link_embed TEXT,
  link_m3u8 TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(movie_id, server_name, episode_slug)
);

-- User favorites
CREATE TABLE public.user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Watch history
CREATE TABLE public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0, -- Percentage watched
  resume_position INTEGER DEFAULT 0, -- Seconds
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id, episode_id)
);

-- Watch later / watchlist
CREATE TABLE public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- User ratings and reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  is_spoiler BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Review helpfulness votes
CREATE TABLE public.review_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog categories
CREATE TABLE public.blog_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog post categories relationship
CREATE TABLE public.blog_post_categories (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System settings
CREATE TABLE public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User sessions (for additional session management)
CREATE TABLE public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT DEFAULT 'general',
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_movies_slug ON public.movies(slug);
CREATE INDEX idx_movies_type ON public.movies(type);
CREATE INDEX idx_movies_status ON public.movies(status);
CREATE INDEX idx_movies_year ON public.movies(year);
CREATE INDEX idx_movies_featured ON public.movies(is_featured);
CREATE INDEX idx_movies_trending ON public.movies(is_trending);
CREATE INDEX idx_movies_view_count ON public.movies(view_count DESC);
CREATE INDEX idx_movies_rating ON public.movies(rating DESC);
CREATE INDEX idx_episodes_movie_id ON public.episodes(movie_id);
CREATE INDEX idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX idx_watch_history_movie_id ON public.watch_history(movie_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_reviews_movie_id ON public.reviews(movie_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users can manage their own watch history"
  ON public.watch_history FOR ALL
  USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can manage their own watchlist"
  ON public.watchlist FOR ALL
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can manage their own reviews"
  ON public.reviews FOR ALL
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update movie ratings
CREATE OR REPLACE FUNCTION update_movie_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.movies 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0)
      FROM public.reviews 
      WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id) 
      AND rating IS NOT NULL
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews 
      WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id) 
      AND rating IS NOT NULL
    )
  WHERE id = COALESCE(NEW.movie_id, OLD.movie_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update movie ratings when reviews change
CREATE TRIGGER update_movie_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_movie_rating();

-- Insert some default data
INSERT INTO public.categories (name, slug, description) VALUES
  ('Action', 'action', 'High-energy movies with intense sequences'),
  ('Comedy', 'comedy', 'Funny and entertaining movies'),
  ('Drama', 'drama', 'Serious and emotional storylines'),
  ('Horror', 'horror', 'Scary and thrilling movies'),
  ('Romance', 'romance', 'Love stories and romantic plots'),
  ('Sci-Fi', 'sci-fi', 'Science fiction and futuristic themes'),
  ('Thriller', 'thriller', 'Suspenseful and exciting movies'),
  ('Animation', 'animation', 'Animated movies and cartoons'),
  ('Documentary', 'documentary', 'Real-life stories and information'),
  ('Adventure', 'adventure', 'Exciting journeys and quests');

INSERT INTO public.countries (name, slug, code) VALUES
  ('United States', 'usa', 'US'),
  ('United Kingdom', 'uk', 'GB'),
  ('France', 'france', 'FR'),
  ('Germany', 'germany', 'DE'),
  ('Japan', 'japan', 'JP'),
  ('South Korea', 'south-korea', 'KR'),
  ('China', 'china', 'CN'),
  ('India', 'india', 'IN'),
  ('Canada', 'canada', 'CA'),
  ('Australia', 'australia', 'AU');

INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('News', 'news', 'Latest movie industry news'),
  ('Reviews', 'reviews', 'Movie and TV show reviews'),
  ('Interviews', 'interviews', 'Cast and crew interviews'),
  ('Behind the Scenes', 'behind-the-scenes', 'Behind the scenes content'),
  ('Awards', 'awards', 'Award shows and nominations');

INSERT INTO public.settings (key, value, description) VALUES
  ('site_name', '"CineVerse"', 'Site name'),
  ('site_description', '"Your ultimate movie streaming destination"', 'Site description'),
  ('max_upload_size', '2147483648', 'Maximum file upload size in bytes'),
  ('featured_movies_count', '6', 'Number of featured movies to display'),
  ('trending_movies_count', '20', 'Number of trending movies to display'),
  ('enable_user_registration', 'true', 'Allow new user registrations'),
  ('maintenance_mode', 'false', 'Enable maintenance mode');