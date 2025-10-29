# 🚀 Quick Start - Advanced Features

Get up and running with the new advanced features in 5 minutes!

---

## ⚡ 1-Minute Setup

### Step 1: Database Setup
```sql
-- Run in Supabase SQL Editor
-- Copy and paste from: docs/database-schema-advanced.sql
```

### Step 2: Environment Variables
```bash
# Already in .env.local - no changes needed!
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Step 3: Start Using!
```tsx
// That's it! Import and use the components
```

---

## 🎯 Feature Quick Reference

### 1. Personalized Recommendations

**Import:**
```tsx
import { RecommendationsSection } from '@/components/recommendations/recommendations-section'
```

**Use:**
```tsx
<RecommendationsSection
  userId={user.id}
  watchedMovies={userWatchHistory}
  allMovies={allMovies}
  limit={10}
/>
```

**What it does:**
- Shows personalized movie recommendations
- Uses hybrid algorithm (collaborative + content-based)
- Displays confidence scores
- Explains why each movie is recommended

---

### 2. Real-time Comments

**Import:**
```tsx
import { RealtimeComments } from '@/components/comments/realtime-comments'
```

**Use:**
```tsx
<RealtimeComments
  movieId={movie._id}
  userId={user?.id}
  userName={user?.username}
/>
```

**What it does:**
- Real-time comment updates (WebSocket)
- Threaded replies
- Like/unlike functionality
- Emoji reactions (6 types)

---

### 3. Activity Feed

**Import:**
```tsx
import { ActivityFeed } from '@/components/activity/activity-feed'
```

**Use:**
```tsx
<ActivityFeed userId={user.id} limit={20} />
```

**What it does:**
- Shows activities from followed users
- Real-time updates
- 7 activity types (watch, rate, comment, favorite, follow, share, review)
- Beautiful timeline UI

---

### 4. Enhanced Video Player

**Import:**
```tsx
import { EnhancedVideoPlayer } from '@/components/video/enhanced-video-player'
```

**Use:**
```tsx
<EnhancedVideoPlayer
  src={videoUrl}
  movieId={movie._id}
  userId={user?.id}
  poster={movie.poster_url}
  autoPlay={false}
/>
```

**What it does:**
- Full-featured video player
- Automatic analytics tracking
- Resume playback support
- Custom controls

---

### 5. Analytics Dashboard (Admin)

**Import:**
```tsx
import { RealtimeAnalyticsDashboard } from '@/components/admin/realtime-analytics-dashboard'
```

**Use:**
```tsx
<RealtimeAnalyticsDashboard />
```

**What it does:**
- Live viewer count
- Active movies ranking
- System health monitoring
- User engagement metrics

---

## 🔧 Common Tasks

### Track User Rating
```tsx
import { createActivity } from '@/lib/realtime/activity-feed'

// When user rates a movie
await createActivity(userId, 'rate', {
  movieId: movie._id,
  movieName: movie.name,
  rating: 4.5,
})
```

### Follow/Unfollow User
```tsx
import { followUser, unfollowUser } from '@/lib/realtime/activity-feed'

// Follow
await followUser(currentUserId, targetUserId)

// Unfollow
await unfollowUser(currentUserId, targetUserId)
```

### Get Watch Progress
```tsx
import { getWatchProgress } from '@/lib/analytics/video-tracking'

const progress = await getWatchProgress(userId, movieId, episode)
// Returns: { timestamp: 1234, percentage: 45 }
```

### Get Movie Analytics
```tsx
import { getVideoMetrics } from '@/lib/analytics/video-tracking'

const metrics = await getVideoMetrics(movieId)
console.log({
  totalViews: metrics.total_views,
  completionRate: metrics.completion_rate,
  engagementScore: metrics.engagement_score,
})
```

---

## 📱 Complete Page Examples

### Movie Detail Page with All Features
```tsx
// app/movies/[slug]/page.tsx
import { MovieDetailEnhanced } from './components/movie-detail-enhanced'

export default async function MoviePage({ params }) {
  // ... fetch data
  
  return (
    <MovieDetailEnhanced
      movie={movie}
      similarMovies={similarMovies}
      allMovies={allMovies}
      userId={user?.id}
      userName={user?.username}
      watchedMovies={watchHistory}
    />
  )
}
```

### Profile Page with Activity Feed
```tsx
// app/profile/page.tsx
import { ActivityFeed } from '@/components/activity/activity-feed'

export default function ProfilePage() {
  return (
    <div>
      <h1>Your Activity</h1>
      <ActivityFeed userId={user.id} limit={20} />
    </div>
  )
}
```

### Admin Dashboard
```tsx
// app/admin/page.tsx
import { RealtimeAnalyticsDashboard } from '@/components/admin/realtime-analytics-dashboard'

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <RealtimeAnalyticsDashboard />
    </div>
  )
}
```

---

## 🎨 UI Customization

All components accept standard props and can be styled:

```tsx
// Custom styling with className
<RecommendationsSection
  userId={user.id}
  watchedMovies={movies}
  allMovies={allMovies}
  limit={15}  // More recommendations
/>

// Comments with custom settings
<RealtimeComments
  movieId={movie._id}
  userId={user?.id}
  userName={user?.username}
/>
```

---

## 🔍 Troubleshooting

### Comments not updating in real-time?
1. Check Supabase Realtime is enabled
2. Verify WebSocket connection in Network tab
3. Check RLS policies allow SELECT

### Recommendations not loading?
1. User needs watch history (watched movies)
2. Ensure `allMovies` array is populated
3. Check console for errors

### Video analytics not tracking?
1. User must be authenticated
2. Check video player events are firing
3. Verify Supabase permissions

---

## 📊 Database Tables

Quick reference for the 10 new tables:

1. **profiles** - User information
2. **comments** - Movie comments
3. **comment_likes** - Like tracking
4. **comment_reactions** - Emoji reactions
5. **activities** - Activity feed
6. **follows** - Social follows
7. **watch_sessions** - Video sessions
8. **video_events** - Video events
9. **user_ratings** - Movie ratings
10. **favorites** - User favorites

---

## 🔐 Security Notes

- All tables have Row Level Security (RLS)
- Users can only modify their own data
- Comments are publicly readable
- Admin role required for full analytics

---

## 📚 Full Documentation

For detailed information, see:

1. **ADVANCED_FEATURES_GUIDE.md** - Complete API documentation
2. **INTEGRATION_EXAMPLES.md** - Detailed code examples
3. **database-schema-advanced.sql** - Database schema
4. **IMPLEMENTATION_COMPLETE.md** - Full feature list

---

## ✅ Checklist

Before going live:

- [ ] Run database migration
- [ ] Test authentication flow
- [ ] Verify Realtime is working
- [ ] Test each feature component
- [ ] Check RLS policies
- [ ] Test on mobile devices
- [ ] Monitor performance

---

## 🎉 You're Ready!

All advanced features are now available to use. Just import the components and start building amazing user experiences!

**Questions?** Check the detailed documentation in the `docs/` folder.

**Happy coding! 🚀**

---

## Quick Links

- [Complete Feature Guide](./docs/ADVANCED_FEATURES_GUIDE.md)
- [Integration Examples](./docs/INTEGRATION_EXAMPLES.md)
- [Database Schema](./docs/database-schema-advanced.sql)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)
