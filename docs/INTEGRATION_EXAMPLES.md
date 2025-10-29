# Integration Examples

This document provides practical examples of integrating the advanced features into your Next.js application.

---

## 1. Enhanced Movie Detail Page

Complete example with all advanced features integrated:

```tsx
// app/movies/[slug]/page.tsx
import { MovieDetailEnhanced } from './components/movie-detail-enhanced'
import { getMovieBySlug, getMovies } from '@/lib/api/movies-corrected'
import { createClient } from '@/lib/supabase/server'

export default async function MoviePage({ params }) {
  const { slug } = params
  
  // Fetch movie data
  const movie = await getMovieBySlug(slug)
  const allMovies = await getMovies({ limit: 100 })
  
  // Get user session
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user's watch history
  let watchedMovies = []
  if (user) {
    const { data: sessions } = await supabase
      .from('watch_sessions')
      .select('movie_id')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(20)
    
    // Fetch movie details for watched movies
    watchedMovies = allMovies.filter(m => 
      sessions?.some(s => s.movie_id === m._id)
    )
  }
  
  // Get similar movies (you can use API or recommendation system)
  const similarMovies = allMovies.filter(m => 
    m.category?.some(cat => 
      movie.category?.some(c => c.id === cat.id)
    ) && m._id !== movie._id
  )
  
  return (
    <main className="container py-8">
      <MovieDetailEnhanced
        movie={movie}
        similarMovies={similarMovies}
        allMovies={allMovies}
        userId={user?.id}
        userName={user?.user_metadata?.username}
        watchedMovies={watchedMovies}
      />
    </main>
  )
}
```

---

## 2. Homepage with Personalized Recommendations

```tsx
// app/page.tsx
import { RecommendationsSection } from '@/components/recommendations/recommendations-section'
import { getMovies } from '@/lib/api/movies-corrected'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const movies = await getMovies({ limit: 100 })
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let watchedMovies = []
  if (user) {
    const { data: sessions } = await supabase
      .from('watch_sessions')
      .select('movie_id')
      .eq('user_id', user.id)
      .gte('completion_percentage', 50) // Only movies watched >50%
      .order('start_time', { ascending: false })
      .limit(20)
    
    watchedMovies = movies.filter(m => 
      sessions?.some(s => s.movie_id === m._id)
    )
  }
  
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Personalized Recommendations */}
      {user && watchedMovies.length > 0 && (
        <RecommendationsSection
          userId={user.id}
          watchedMovies={watchedMovies}
          allMovies={movies}
          limit={10}
        />
      )}
      
      {/* Trending Movies */}
      <TrendingMovies />
      
      {/* New Releases */}
      <NewMovies />
    </main>
  )
}
```

---

## 3. Profile Page with Activity Feed

```tsx
// app/profile/page.tsx
import { ActivityFeed } from '@/components/activity/activity-feed'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  const { count: watchCount } = await supabase
    .from('watch_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id)
  
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)
  
  return (
    <main className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.username}</h2>
                <p className="text-muted-foreground">{profile?.full_name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{watchCount}</div>
                <div className="text-sm text-muted-foreground">Đã xem</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{followersCount}</div>
                <div className="text-sm text-muted-foreground">Người theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{followingCount}</div>
                <div className="text-sm text-muted-foreground">Đang theo dõi</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Hoạt động gần đây</h2>
          <ActivityFeed userId={user.id} limit={20} />
        </div>
      </div>
    </main>
  )
}
```

---

## 4. Admin Dashboard with Real-time Analytics

```tsx
// app/admin/page.tsx
import { RealtimeAnalyticsDashboard } from '@/components/admin/realtime-analytics-dashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    redirect('/')
  }
  
  return (
    <main className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time analytics and system monitoring
          </p>
        </div>
        
        <RealtimeAnalyticsDashboard />
      </div>
    </main>
  )
}
```

---

## 5. Watch Page with Enhanced Player

```tsx
// app/watch/[slug]/page.tsx
import { EnhancedVideoPlayer } from '@/components/video/enhanced-video-player'
import { getMovieBySlug } from '@/lib/api/movies-corrected'
import { createClient } from '@/lib/supabase/server'

export default async function WatchPage({ params, searchParams }) {
  const { slug } = params
  const episode = searchParams.episode ? parseInt(searchParams.episode) : 1
  
  const movie = await getMovieBySlug(slug)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const videoUrl = movie.episodes?.[0]?.server_data?.[episode - 1]?.link_embed || ''
  
  return (
    <main className="min-h-screen bg-black">
      <div className="container py-4">
        <EnhancedVideoPlayer
          src={videoUrl}
          movieId={movie._id}
          userId={user?.id}
          episode={episode}
          poster={movie.poster_url}
          autoPlay={true}
        />
        
        <div className="mt-8 text-white">
          <h1 className="text-3xl font-bold mb-4">{movie.name}</h1>
          <p className="text-gray-300 mb-6">{movie.content}</p>
          
          {/* Episode List */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách tập</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {movie.episodes?.[0]?.server_data?.map((ep, index) => (
                <a
                  key={ep.slug}
                  href={`/watch/${slug}?episode=${index + 1}`}
                  className={`
                    px-4 py-2 rounded text-center
                    ${episode === index + 1 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-800 hover:bg-gray-700'}
                  `}
                >
                  {index + 1}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

---

## 6. Social Features - Follow/Unfollow

```tsx
// components/user/user-follow-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { followUser, unfollowUser, isFollowing } from '@/lib/realtime/activity-feed'
import { useToast } from '@/hooks/use-toast'

interface UserFollowButtonProps {
  currentUserId: string
  targetUserId: string
  targetUserName: string
}

export function UserFollowButton({
  currentUserId,
  targetUserId,
  targetUserName,
}: UserFollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Load initial follow state
  useEffect(() => {
    isFollowing(currentUserId, targetUserId).then(setFollowing)
  }, [currentUserId, targetUserId])
  
  const handleToggleFollow = async () => {
    setLoading(true)
    try {
      if (following) {
        await unfollowUser(currentUserId, targetUserId)
        setFollowing(false)
        toast({
          title: 'Đã bỏ theo dõi',
          description: `Bạn đã bỏ theo dõi ${targetUserName}`,
        })
      } else {
        await followUser(currentUserId, targetUserId)
        setFollowing(true)
        toast({
          title: 'Đã theo dõi',
          description: `Bạn đang theo dõi ${targetUserName}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button
      onClick={handleToggleFollow}
      variant={following ? 'outline' : 'default'}
      disabled={loading}
    >
      {following ? 'Đang theo dõi' : 'Theo dõi'}
    </Button>
  )
}
```

---

## 7. Rating System with Activity Tracking

```tsx
// components/movies/movie-rating.tsx
'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createActivity } from '@/lib/realtime/activity-feed'
import { useToast } from '@/hooks/use-toast'

interface MovieRatingProps {
  movieId: string
  movieName: string
  userId: string
  initialRating?: number
}

export function MovieRating({
  movieId,
  movieName,
  userId,
  initialRating = 0,
}: MovieRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const { toast } = useToast()
  
  const handleRate = async (value: number) => {
    const supabase = createClient()
    
    try {
      // Save rating
      await supabase
        .from('user_ratings')
        .upsert({
          user_id: userId,
          movie_id: movieId,
          rating: value,
        })
      
      setRating(value)
      
      // Create activity (automatically done by trigger, but can also do manually)
      await createActivity(userId, 'rate', {
        movieId,
        movieName,
        rating: value,
      })
      
      toast({
        title: 'Đã đánh giá',
        description: `Bạn đã đánh giá ${value}/5 sao`,
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu đánh giá',
        variant: 'destructive',
      })
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => handleRate(value)}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              value <= (hover || rating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-400'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating > 0 ? `${rating}/5` : 'Chưa đánh giá'}
      </span>
    </div>
  )
}
```

---

## 8. Setup Script

Create a setup script for initializing the database:

```bash
#!/bin/bash
# scripts/setup-advanced-features.sh

echo "🚀 Setting up advanced features..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Run migration
echo "📦 Running database migration..."
supabase db push

# Enable Realtime
echo "⚡ Enabling Realtime..."
supabase realtime enable

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with Supabase credentials"
echo "2. Test authentication flow"
echo "3. Create your first user"
echo "4. Try out the features!"
```

---

## Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

---

## Testing Checklist

- [ ] Database migration completed
- [ ] RLS policies working
- [ ] Realtime subscriptions active
- [ ] Comments appear in real-time
- [ ] Activity feed updates
- [ ] Video analytics tracking
- [ ] Recommendations loading
- [ ] Follow/unfollow working
- [ ] Rating system functional
- [ ] Admin dashboard accessible

---

## Troubleshooting

### Comments not updating in real-time
- Check Supabase Realtime is enabled
- Verify WebSocket connection in Network tab
- Check RLS policies allow SELECT

### Recommendations not appearing
- Ensure user has watch history
- Check `allMovies` array is populated
- Verify interactions are being tracked

### Analytics not tracking
- Confirm user is authenticated
- Check video player is firing events
- Verify table permissions

---

That's it! You now have complete integration examples for all advanced features. 🎉
