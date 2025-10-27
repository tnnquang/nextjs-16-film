# CineVerse API v2.0 Integration Guide

## 📚 Overview

The CineVerse API v2.0 provides a comprehensive RESTful API for film data management with advanced features including:

- ✅ Cursor-based pagination for efficient data fetching
- ✅ MongoDB aggregation for complex queries
- ✅ Advanced filtering with include/exclude options
- ✅ Multi-attribute search and sorting
- ✅ Episode management with multi-server support

**Base URL**: `https://cinevserse-api.nhatquang.shop`

## 🚀 Quick Start

### Installation

The API client is already integrated in `lib/api/movies-v2.ts`:

```typescript
import { movieApiV2 } from '@/lib/api/movies-v2'

// Get trending films
const hotFilms = await movieApiV2.getHotFilms(20)

// Search films
const results = await movieApiV2.searchFilms({ 
  keyword: 'avatar',
  limit: 20 
})

// Get film by slug
const film = await movieApiV2.getFilmBySlug('avatar-2009')
```

## 📖 Core Endpoints

### 1. Basic Film Operations

#### Get Categories
```typescript
const categories = await movieApiV2.getCategories()
// Returns: Array<{ _id, name, slug }>
```

#### Get Countries
```typescript
const countries = await movieApiV2.getCountries()
// Returns: Array<{ _id, name, slug }>
```

#### Get Film by Slug
```typescript
const film = await movieApiV2.getFilmBySlug('avatar-2009')
// Returns: Complete film object with all metadata
```

#### Get Film Episodes
```typescript
const episodes = await movieApiV2.getFilmEpisodes('avatar-2009')
// Returns: Episodes grouped by server with streaming links
```

### 2. Trending & Popular

#### Get Hot/Trending Films
```typescript
const trending = await movieApiV2.getHotFilms(100)
// Returns: Films sorted by view count
```

#### Get Recently Updated Films
```typescript
const updated = await movieApiV2.getRecentlyUpdated({
  limit: 20,
  categories: ['hanh-dong'],
  types: ['series']
})
```

#### Get New Films
```typescript
const newFilms = await movieApiV2.getNewFilms({
  limit: 20
})
```

### 3. Search & Filtering

#### Simple Search
```typescript
const results = await movieApiV2.searchFilms({
  keyword: 'avatar',
  limit: 20
})
```

#### Advanced Search with Include/Exclude
```typescript
const results = await movieApiV2.advancedSearch({
  keyword: 'action',
  include: {
    categories: ['hanh-dong', 'phieu-luu'],
    countries: ['han-quoc'],
    types: ['series']
  },
  exclude: {
    categories: ['kinh-di'],
    isCinema: true
  },
  limit: 20
})
```

#### Sorted Results
```typescript
const sorted = await movieApiV2.getFilmsSorted({
  categories: ['hanh-dong'],
  sortBy: 'view',
  sortOrder: 'desc',
  limit: 20
})
```

### 4. Filter by Attributes

#### By Type
```typescript
// Types: 'series' | 'single' | 'hoathinh'
const series = await movieApiV2.getFilmsByType('series', {
  limit: 20
})
```

#### By Category
```typescript
const action = await movieApiV2.getFilmsByCategory('hanh-dong', {
  limit: 20
})
```

#### By Country
```typescript
const korean = await movieApiV2.getFilmsByCountry('han-quoc', {
  limit: 20
})
```

#### By Year
```typescript
const films2024 = await movieApiV2.getFilmsByYear(2024, {
  limit: 20
})
```

#### Cinema Releases
```typescript
const cinema = await movieApiV2.getCinemaFilms({
  limit: 20
})
```

#### By Actor/Director
```typescript
const byActor = await movieApiV2.getFilmsByActor('Tom Cruise', {
  limit: 20
})

const byDirector = await movieApiV2.getFilmsByDirector('Christopher Nolan', {
  limit: 20
})
```

### 5. Multi-Filter Queries

#### Type + Category
```typescript
const actionSeries = await movieApiV2.getFilmsByTypeAndCategory(
  'series',
  'hanh-dong',
  { limit: 20 }
)
```

#### Type + Country
```typescript
const koreanSeries = await movieApiV2.getFilmsByTypeAndCountry(
  'series',
  'han-quoc',
  { limit: 20 }
)
```

#### Category + Country
```typescript
const koreanAction = await movieApiV2.getFilmsByCategoryAndCountry(
  'hanh-dong',
  'han-quoc',
  { limit: 20 }
)
```

## 🔄 Cursor-Based Pagination

The API uses cursor-based pagination for efficient data fetching:

### Understanding Cursors

```typescript
interface PaginationCursor {
  view: number          // View count of the document
  createdAt: string     // ISO timestamp
  id: string            // MongoDB document ID
}

interface FilmResponse {
  data: Film[]
  pagination: {
    hasNextPage: boolean
    hasPrevPage: boolean
    nextCursor?: PaginationCursor
    prevCursor?: PaginationCursor
    totalDocuments: number
    limit: number
  }
}
```

### Fetching Next Page

```typescript
// First request
const page1 = await movieApiV2.searchFilms({
  keyword: 'avatar',
  limit: 20
})

// Check if there's a next page
if (page1.pagination.hasNextPage) {
  // Use nextCursor for next page
  const page2 = await movieApiV2.searchFilms({
    keyword: 'avatar',
    lastCursor: page1.pagination.nextCursor,
    limit: 20
  })
}
```

### Fetching Previous Page

```typescript
// Going back to previous page
if (page2.pagination.hasPrevPage) {
  const page1Again = await movieApiV2.searchFilms({
    keyword: 'avatar',
    firstCursor: page2.pagination.prevCursor,
    limit: 20
  })
}
```

### Helper Functions

```typescript
// Build next page params
const nextParams = movieApiV2.buildNextPageParams(response, {
  keyword: 'avatar'
})

if (nextParams) {
  const nextPage = await movieApiV2.searchFilms(nextParams)
}

// Build previous page params
const prevParams = movieApiV2.buildPrevPageParams(response, {
  keyword: 'avatar'
})

if (prevParams) {
  const prevPage = await movieApiV2.searchFilms(prevParams)
}
```

## 🎯 Advanced Filtering

### Include/Exclude Pattern

```typescript
const results = await movieApiV2.advancedSearch({
  keyword: 'action',
  include: {
    // Films MUST match these criteria
    categories: ['hanh-dong', 'phieu-luu'],
    countries: ['han-quoc', 'trung-quoc'],
    types: ['series']
  },
  exclude: {
    // Films must NOT match these criteria
    categories: ['kinh-di'],
    types: ['hoathinh'],
    isCinema: true
  },
  limit: 20
})
```

### Complex Query Example

```typescript
// Find Korean action series from 2024, excluding horror and cinema releases
const results = await movieApiV2.advancedSearch({
  include: {
    categories: ['hanh-dong'],
    countries: ['han-quoc'],
    types: ['series']
  },
  exclude: {
    categories: ['kinh-di'],
    isCinema: true
  },
  limit: 20
})
```

## 📺 Episode Management

### Get All Episodes

```typescript
const episodes = await movieApiV2.getFilmEpisodes('avatar-2009')

// Response structure:
{
  filmSlug: 'avatar-2009',
  episodes: [
    {
      serverName: 'Server 1',
      episodes: [
        {
          name: 'Episode 1',
          slug: 'tap-1',
          filename: 'avatar-ep1',
          link_embed: 'https://...',
          link_m3u8: 'https://...'
        }
      ]
    }
  ]
}
```

### Get Specific Episode

```typescript
// Get episode by number and server
const episode = await movieApiV2.getFilmEpisode(
  'avatar-2009',
  '1',
  'Server 1'
)
```

## 🎨 Integration Examples

### React Component with TanStack Query

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { movieApiV2 } from '@/lib/api/movies-v2'

export function TrendingMovies() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => movieApiV2.getHotFilms(20),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <Loading />
  if (error) return <Error />

  return (
    <div>
      {data.data.map(film => (
        <FilmCard key={film._id} film={film} />
      ))}
    </div>
  )
}
```

### Infinite Scroll with Cursor Pagination

```typescript
'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { movieApiV2 } from '@/lib/api/movies-v2'

export function InfiniteFilmList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['films', 'infinite'],
    queryFn: ({ pageParam }) => 
      movieApiV2.searchFilms({
        keyword: 'action',
        lastCursor: pageParam,
        limit: 20
      }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage 
        ? lastPage.pagination.nextCursor 
        : undefined,
    initialPageParam: undefined,
  })

  return (
    <div>
      {data?.pages.map((page) => (
        page.data.map((film) => (
          <FilmCard key={film._id} film={film} />
        ))
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

### Server Component with Caching

```typescript
import { unstable_cache } from 'next/cache'
import { movieApiV2 } from '@/lib/api/movies-v2'

const getCachedTrending = unstable_cache(
  async () => movieApiV2.getHotFilms(20),
  ['trending-films'],
  { revalidate: 300 } // 5 minutes
)

export default async function TrendingPage() {
  const films = await getCachedTrending()
  
  return (
    <div>
      {films.data.map(film => (
        <FilmCard key={film._id} film={film} />
      ))}
    </div>
  )
}
```

## 🔧 Configuration

### API Client Configuration

Located in `lib/api/client.ts`:

```typescript
const API_CONFIG = {
  baseUrl: 'https://cinevserse-api.nhatquang.shop',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
}
```

### Custom Headers

```typescript
// Add custom headers to API client
const customClient = {
  ...apiClient,
  defaultHeaders: {
    'X-Api-Key': 'your-key',
    'X-Client-Version': '1.0.0'
  }
}
```

## 🚨 Error Handling

### Error Types

```typescript
try {
  const films = await movieApiV2.searchFilms({ keyword: 'test' })
} catch (error) {
  if (error.message.includes('404')) {
    // Not found
  } else if (error.message.includes('429')) {
    // Rate limited
  } else if (error.message.includes('500')) {
    // Server error
  } else {
    // Network or other error
  }
}
```

### With React Error Boundary

```typescript
'use client'
import { ErrorBoundary } from 'react-error-boundary'

function FilmsWithErrorHandling() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => logError(error)}
    >
      <FilmsList />
    </ErrorBoundary>
  )
}
```

## ⚡ Performance Tips

### 1. Use Cursor Pagination
- ✅ More efficient than offset-based pagination
- ✅ Better performance with large datasets
- ✅ Consistent results even when data changes

### 2. Optimize Limit Parameter
```typescript
// Use appropriate limits
const mobile = await movieApiV2.searchFilms({ limit: 10 })  // Mobile
const desktop = await movieApiV2.searchFilms({ limit: 20 }) // Desktop
const infinite = await movieApiV2.searchFilms({ limit: 30 }) // Infinite scroll
```

### 3. Cache Responses
```typescript
// Use TanStack Query with appropriate staleTime
const { data } = useQuery({
  queryKey: ['films', filters],
  queryFn: () => movieApiV2.searchFilms(filters),
  staleTime: 5 * 60 * 1000, // Don't refetch for 5 minutes
})
```

### 4. Prefetch Data
```typescript
// Prefetch next page
const queryClient = useQueryClient()

queryClient.prefetchQuery({
  queryKey: ['films', 'page-2'],
  queryFn: () => movieApiV2.searchFilms({ 
    lastCursor: currentPage.pagination.nextCursor 
  })
})
```

## 📊 Response Examples

### Film Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Avatar",
  "slug": "avatar-2009",
  "origin_name": "Avatar",
  "poster_url": "https://...",
  "thumb_url": "https://...",
  "year": 2009,
  "type": "single",
  "status": "completed",
  "quality": "HD",
  "lang": "Vietsub",
  "time": "162 phút",
  "episode_current": "Full",
  "episode_total": "1",
  "content": "Film synopsis...",
  "view": 125000,
  "categories": [
    { "_id": "...", "name": "Hành Động", "slug": "hanh-dong" }
  ],
  "countries": [
    { "_id": "...", "name": "Mỹ", "slug": "my" }
  ],
  "actors": ["Sam Worthington", "Zoe Saldana"],
  "directors": ["James Cameron"]
}
```

## 🎓 Best Practices

1. ✅ Always handle pagination cursors properly
2. ✅ Use appropriate limits for your use case
3. ✅ Cache responses to reduce API calls
4. ✅ Handle errors gracefully
5. ✅ Prefetch data for better UX
6. ✅ Use advanced filtering for complex queries
7. ✅ Implement infinite scroll for better mobile experience
8. ✅ Monitor API usage and response times

---

**Ready to build amazing movie experiences with CineVerse API v2.0!** 🎬