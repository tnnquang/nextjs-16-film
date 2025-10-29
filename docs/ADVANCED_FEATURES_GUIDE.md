# Advanced Features Implementation Guide

## Overview

This guide covers the implementation of advanced features in the Cineverse movie streaming platform:

1. **Hybrid Recommendation System** (Collaborative + Content-Based)
2. **Real-time Comments** (WebSocket via Supabase Realtime)
3. **Activity Feed System**
4. **Video Analytics Tracking**
5. **Real-time Analytics Dashboard**

---

## 🎯 1. Recommendation System

### Architecture

The recommendation system uses a **hybrid approach** combining:

- **Collaborative Filtering**: User-based and item-based recommendations
- **Content-Based Filtering**: Genre, actors, directors, country similarity
- **Hybrid Strategy**: Weighted combination with adaptive selection

### Usage Example

```tsx
import { useRecommendations } from '@/hooks/use-recommendations'
import { RecommendationsSection } from '@/components/recommendations/recommendations-section'

function HomePage({ userId, movies }) {
  return (
    <div>
      <RecommendationsSection
        userId={userId}
        watchedMovies={userWatchHistory}
        allMovies={movies}
        limit={10}
      />
    </div>
  )
}
```

### Key Features

- **Cold Start Problem**: Uses content-based filtering for new users
- **Diversity**: Prevents filter bubbles by diversifying recommendations
- **Confidence Scores**: Shows how confident the system is about each recommendation
- **Explanation**: Provides reasons for each recommendation

### Algorithms

1. **Pearson Correlation**: For user similarity
2. **Cosine Similarity**: For movie similarity
3. **TF-IDF**: For text-based features
4. **Weighted Scoring**: Combines multiple signals

---

## 💬 2. Real-time Comments

### Setup

1. **Database Migration**: Run the SQL script in `docs/database-schema-advanced.sql`
2. **Enable Realtime**: Supabase automatically enables realtime for tables

### Usage Example

```tsx
import { RealtimeComments } from '@/components/comments/realtime-comments'

function MovieDetailPage({ movieId, user }) {
  return (
    <div>
      <RealtimeComments
        movieId={movieId}
        userId={user?.id}
        userName={user?.username}
      />
    </div>
  )
}
```

### Features

- **Real-time Updates**: New comments appear instantly
- **Threaded Replies**: Support for comment threads
- **Likes & Reactions**: Multiple reaction types (like, love, laugh, etc.)
- **Optimistic Updates**: Instant UI feedback

### Hook API

```tsx
const {
  comments,        // Array of comments
  loading,         // Loading state
  error,           // Error message
  addComment,      // Function to add comment
  likeComment,     // Function to like/unlike
} = useRealtimeComments(movieId)
```

---

## 📊 3. Activity Feed System

### Architecture

- **Follow System**: Users can follow other users
- **Activity Types**: watch, rate, comment, favorite, follow, share, review
- **Real-time Updates**: New activities appear instantly in followers' feeds

### Usage Example

```tsx
import { ActivityFeed } from '@/components/activity/activity-feed'

function ProfilePage({ userId }) {
  return (
    <div>
      <h2>Activity Feed</h2>
      <ActivityFeed userId={userId} limit={20} />
    </div>
  )
}
```

### Creating Activities

```tsx
import { createActivity } from '@/lib/realtime/activity-feed'

// When user watches a movie
await createActivity(userId, 'watch', {
  movieId: movie._id,
  movieName: movie.name,
  moviePoster: movie.poster_url,
})

// When user rates a movie
await createActivity(userId, 'rate', {
  movieId: movie._id,
  movieName: movie.name,
  rating: 4.5,
})
```

### Follow/Unfollow

```tsx
import { followUser, unfollowUser } from '@/lib/realtime/activity-feed'

// Follow a user
await followUser(currentUserId, targetUserId)

// Unfollow a user
await unfollowUser(currentUserId, targetUserId)
```

---

## 📹 4. Video Analytics Tracking

### Architecture

Tracks comprehensive video viewing metrics:

- **Play/Pause Events**: User interaction tracking
- **Seek Events**: Skip behavior analysis
- **Buffer Events**: Performance monitoring
- **Completion Tracking**: Watch completion rates
- **Quality Changes**: Streaming quality analysis

### Usage Example

```tsx
import { EnhancedVideoPlayer } from '@/components/video/enhanced-video-player'

function WatchPage({ movie, user }) {
  return (
    <EnhancedVideoPlayer
      src={movie.videoUrl}
      movieId={movie._id}
      userId={user?.id}
      episode={1}
      poster={movie.poster_url}
      autoPlay={false}
    />
  )
}
```

### Manual Tracking

```tsx
import { useVideoAnalytics } from '@/hooks/use-video-analytics'

const analytics = useVideoAnalytics({
  userId: user.id,
  movieId: movie._id,
  episode: 1,
  videoDuration: 7200, // 2 hours in seconds
})

// Track events
analytics.trackPlay(currentTime)
analytics.trackPause(currentTime)
analytics.trackSeek(newTime)
analytics.trackComplete()
analytics.trackError(currentTime, errorMessage)
```

### Metrics Available

```tsx
import { getVideoMetrics } from '@/lib/analytics/video-tracking'

const metrics = await getVideoMetrics(movieId, {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31'),
})

console.log({
  totalViews: metrics.total_views,
  uniqueViewers: metrics.unique_viewers,
  avgWatchTime: metrics.average_watch_time,
  completionRate: metrics.completion_rate,
  engagementScore: metrics.engagement_score,
})
```

---

## 📈 5. Real-time Analytics Dashboard

### Architecture

Provides live metrics for administrators:

- **Current Viewers**: Live viewer count
- **Active Movies**: Most watched movies right now
- **System Health**: Buffer times, error rates
- **User Engagement**: New/active/returning users

### Usage Example

```tsx
import { RealtimeAnalyticsDashboard } from '@/components/admin/realtime-analytics-dashboard'

function AdminDashboardPage() {
  return (
    <div>
      <h1>Real-time Analytics</h1>
      <RealtimeAnalyticsDashboard />
    </div>
  )
}
```

### Hook API

```tsx
const {
  metrics,   // Real-time metrics object
  loading,   // Loading state
  error,     // Error message
} = useRealtimeDashboard()

// Metrics structure:
// {
//   currentViewers: number,
//   activeMovies: [...],
//   recentActivities: [...],
//   systemHealth: { avgBufferTime, errorRate, averageQuality },
//   userEngagement: { newUsers, activeUsers, returningUsers }
// }
```

### Historical Analytics

```tsx
import { getHistoricalAnalytics } from '@/lib/analytics/realtime-dashboard'

const analytics = await getHistoricalAnalytics('30d')

console.log({
  daily: analytics.daily,        // Daily metrics
  topMovies: analytics.topMovies, // Most popular movies
  userRetention: analytics.userRetention, // Retention cohorts
})
```

---

## 🗄️ Database Setup

### 1. Run Migration

Execute the SQL script in Supabase dashboard or via CLI:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# SQL Editor > New Query > Paste content from database-schema-advanced.sql
```

### 2. Enable Realtime

The migration script automatically enables realtime for:
- `comments` table
- `activities` table
- `watch_sessions` table

### 3. Configure Row Level Security (RLS)

The migration includes comprehensive RLS policies:
- Users can only modify their own data
- Public read access where appropriate
- Admin override for analytics

---

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Recommendation Settings

Adjust weights in `lib/recommendations/hybrid.ts`:

```tsx
const weights = {
  collaborative: 0.6,  // 60% weight for collaborative filtering
  contentBased: 0.4,   // 40% weight for content-based filtering
}
```

### Analytics Update Frequency

Adjust in `lib/analytics/realtime-dashboard.ts`:

```tsx
const interval = setInterval(() => {
  fetchDashboardMetrics().then(callback)
}, 30000) // Update every 30 seconds
```

---

## 🎨 UI Components

All components are built with:
- **shadcn/ui**: For consistent UI
- **Tailwind CSS**: For styling
- **Lucide Icons**: For icons
- **date-fns**: For date formatting

### Customization

Components accept standard props for customization:

```tsx
<RecommendationsSection
  userId={userId}
  watchedMovies={movies}
  allMovies={allMovies}
  limit={20}  // Number of recommendations
/>

<RealtimeComments
  movieId={movieId}
  userId={userId}
  userName={userName}
/>

<ActivityFeed
  userId={userId}
  limit={30}  // Number of activities to show
/>
```

---

## 📊 Performance Considerations

### Indexes

The migration script creates indexes for:
- Common query patterns
- Foreign key relationships
- Time-based queries

### Caching

Recommendations are cached client-side using React state. Consider adding:

```tsx
// Optional: Add React Query for server-side caching
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['recommendations', userId],
  queryFn: () => getPersonalizedRecommendations(...),
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
})
```

### Batch Updates

Video analytics batches updates every 30 seconds to reduce database load.

---

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- Users can only create/update their own data
- Comments are publicly readable
- Watch sessions are private to users
- Admins have read access to analytics

### API Rate Limiting

Consider adding rate limiting for:
- Comment creation
- Activity generation
- Video event tracking

---

## 🚀 Deployment Checklist

- [ ] Run database migration
- [ ] Enable Realtime in Supabase
- [ ] Configure environment variables
- [ ] Test authentication flow
- [ ] Verify RLS policies
- [ ] Monitor initial performance
- [ ] Set up error tracking (Sentry, etc.)

---

## 📚 Additional Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Collaborative Filtering Guide](https://en.wikipedia.org/wiki/Collaborative_filtering)
- [Content-Based Filtering](https://en.wikipedia.org/wiki/Recommender_system#Content-based_filtering)
- [Video Analytics Best Practices](https://web.dev/media-guides/)

---

## 🐛 Troubleshooting

### Comments Not Updating in Real-time

1. Check Supabase Realtime is enabled
2. Verify RLS policies allow reads
3. Check browser console for WebSocket errors

### Recommendations Not Loading

1. Ensure user has watch history
2. Check that `allMovies` array is populated
3. Verify interactions data is being passed

### Analytics Not Tracking

1. Verify user is authenticated
2. Check Supabase table permissions
3. Ensure video player events are firing

---

## 🤝 Contributing

To add new features:

1. Create new library functions in `lib/`
2. Add React hooks in `hooks/`
3. Build UI components in `components/`
4. Update database schema if needed
5. Add documentation here

---

## 📄 License

MIT License - feel free to use in your projects!
