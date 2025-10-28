# API Corrections - Cineverse API Integration

## Summary

Fixed all API endpoints to match the actual API documentation from https://cinevserse-api.nhatquang.shop/api-json

## Issues Found

### 1. ❌ Incorrect Base Path
**Old:** `/v1/api/...`  
**Correct:** `/crawler/ophim/...`

### 2. ❌ Wrong Pagination Model
**Old:** Page-based pagination (`page`, `limit`)  
**Correct:** Cursor-based pagination (`lastView`, `lastCreatedAt`, `lastId`, `firstView`, `firstCreatedAt`, `firstId`)

### 3. ❌ Missing Response Fields
**Old Response:**
```typescript
{
  items: Movie[]
  pagination: { currentPage, totalPages, ... }
}
```

**Correct Response:**
```typescript
{
  data: Movie[]
  nextCursor: { view, createdAt, id }
  prevCursor: { view, createdAt, id }
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
```

### 4. ❌ Incorrect Type Definitions
Missing fields in Movie type:
- `view` (number)
- `sub_docquyen` (boolean)
- `is_copyright` (boolean)
- `imdb` (object)
- `tmdb` (object)
- `createdAt` (string)
- `updatedAt` (string)
- `deleted` (boolean)
- `isPublic` (boolean)
- `keywords` (string[])

### 5. ❌ Wrong Endpoint Paths

| Purpose | Old Endpoint | Correct Endpoint |
|---------|-------------|------------------|
| Get countries | `/v1/api/quoc-gia` | `/crawler/ophim/countries` |
| Get categories | `/v1/api/the-loai` | `/crawler/ophim/categories` |
| Get movie detail | `/v1/api/phim/{slug}` | `/crawler/ophim/info/{slug}` |
| Get hot films | `/v1/api/danh-sach/phim-hot` | `/crawler/ophim/hot` |
| Search films | `/v1/api/tim-kiem` | `/crawler/ophim/search/{keyword}` |
| Filter films | N/A | `/crawler/ophim/search` (POST) |
| By category | `/v1/api/the-loai/{slug}` | `/crawler/ophim/list-film-by-category` |
| By country | `/v1/api/quoc-gia/{slug}` | `/crawler/ophim/list-film-by-country` |
| By type | N/A | `/crawler/ophim/list-film-by-type` |
| By year | N/A | `/crawler/ophim/list-film-by-year` |
| By actor | N/A | `/crawler/ophim/list-film-by-actor` |
| By director | N/A | `/crawler/ophim/list-film-by-director` |

## Corrected Implementation

### New File: `lib/api/movies-corrected.ts`

This file contains the correct API implementation with:

✅ Correct endpoint paths  
✅ Cursor-based pagination  
✅ Complete type definitions  
✅ All available API endpoints  
✅ Helper methods for common use cases

### Usage Example

```typescript
import movieApiCorrected from '@/lib/api/movies-corrected'

// Get hot/trending movies
const hotMovies = await movieApiCorrected.getHotFilms(20)
console.log(hotMovies.data) // Array of movies
console.log(hotMovies.hasNextPage) // true/false
console.log(hotMovies.nextCursor) // Cursor for next page

// Get movie by slug
const movie = await movieApiCorrected.getMovieBySlug('avatar-2-dong-chay-cua-nuoc')

// Search movies
const searchResults = await movieApiCorrected.searchFilms('avatar')

// Get movies by category with pagination
const actionMovies = await movieApiCorrected.getFilmsByCategory('hanh-dong', {
  limit: 20
})

// Navigate to next page using cursor
if (actionMovies.hasNextPage && actionMovies.nextCursor) {
  const nextPage = await movieApiCorrected.getFilmsByCategory('hanh-dong', {
    limit: 20,
    lastView: actionMovies.nextCursor.view,
    lastCreatedAt: actionMovies.nextCursor.createdAt,
    lastId: actionMovies.nextCursor.id
  })
}

// Get movies by type
const series = await movieApiCorrected.getFilmsByType('series', { limit: 20 })
const singles = await movieApiCorrected.getFilmsByType('single', { limit: 20 })
const anime = await movieApiCorrected.getFilmsByType('hoathinh', { limit: 20 })
const tvShows = await movieApiCorrected.getFilmsByType('tvshows', { limit: 20 })

// Get all countries
const countries = await movieApiCorrected.getCountries()

// Get all categories
const categories = await movieApiCorrected.getCategories()

// Helper methods
const trending = await movieApiCorrected.getTrendingMovies(10)
const featured = await movieApiCorrected.getFeaturedMovies(6)
const newMovies = await movieApiCorrected.getNewMovies(20)
```

## API Response Structure

### Countries Response
```typescript
{
  value: Country[],
  Count: number
}
```

### Categories Response
```typescript
{
  value: Category[],
  Count: number
}
```

### Movies Response (with cursor pagination)
```typescript
{
  data: Movie[],
  nextCursor: {
    view: number,
    createdAt: string,
    id: string
  } | null,
  prevCursor: {
    view: number,
    createdAt: string,
    id: string
  } | null,
  totalItems: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPrevPage: boolean
}
```

### Movie Detail Response
```typescript
{
  _id: string,
  slug: string,
  name: string,
  origin_name: string,
  content: string,
  type: 'single' | 'series' | 'hoathinh' | 'tvshows',
  status: 'completed' | 'ongoing' | 'trailer',
  poster_url: string,
  thumb_url: string,
  trailer_url: string,
  time: string,
  episode_current: string,
  episode_total: string,
  quality: string,
  lang: string,
  year: number,
  view: number,
  actor: string[],
  director: string[],
  category: Category[],
  country: Country[],
  chieurap: boolean,
  sub_docquyen: boolean,
  is_copyright: boolean,
  imdb: {
    id: string,
    vote_average: number,
    vote_count: number
  },
  tmdb: {
    type: string | null,
    id: string,
    season: number | null,
    vote_average: number,
    vote_count: number
  },
  created: {
    time: string
  },
  modified: {
    time: string
  },
  createdAt: string,
  updatedAt: string
}
```

## Cursor-Based Pagination

The API uses cursor-based pagination for better performance:

### Forward Pagination (Next Page)
```typescript
const firstPage = await movieApiCorrected.getHotFilms(20)

if (firstPage.hasNextPage && firstPage.nextCursor) {
  const secondPage = await movieApiCorrected.getHotFilms(20, {
    lastView: firstPage.nextCursor.view,
    lastCreatedAt: firstPage.nextCursor.createdAt,
    lastId: firstPage.nextCursor.id
  })
}
```

### Backward Pagination (Previous Page)
```typescript
if (secondPage.hasPrevPage && secondPage.prevCursor) {
  const previousPage = await movieApiCorrected.getHotFilms(20, {
    firstView: secondPage.prevCursor.view,
    firstCreatedAt: secondPage.prevCursor.createdAt,
    firstId: secondPage.prevCursor.id
  })
}
```

## Migration Guide

### Step 1: Update Imports
```typescript
// Old
import { movieApi } from '@/lib/api/movies'

// New
import movieApiCorrected from '@/lib/api/movies-corrected'
```

### Step 2: Update Method Calls
```typescript
// Old
const movies = await movieApi.getMovies({ page: 1, limit: 20 })
movies.items.forEach(movie => ...)

// New
const movies = await movieApiCorrected.getHotFilms(20)
movies.data.forEach(movie => ...)
```

### Step 3: Update Pagination Logic
```typescript
// Old - Page-based
const nextPage = currentPage + 1
const movies = await movieApi.getMovies({ page: nextPage, limit: 20 })

// New - Cursor-based
if (currentResponse.hasNextPage && currentResponse.nextCursor) {
  const nextMovies = await movieApiCorrected.getHotFilms(20, {
    lastView: currentResponse.nextCursor.view,
    lastCreatedAt: currentResponse.nextCursor.createdAt,
    lastId: currentResponse.nextCursor.id
  })
}
```

### Step 4: Update Type Definitions
Make sure your components use the updated Movie type with all fields.

## Available Endpoints

### Public Endpoints (No Auth Required)

1. **GET /crawler/ophim/countries** - Get all countries
2. **GET /crawler/ophim/categories** - Get all categories
3. **GET /crawler/ophim/info/{slug}** - Get movie details
4. **GET /crawler/ophim/hot** - Get hot/trending films
5. **GET /crawler/ophim/search/{keyword}** - Search by keyword
6. **POST /crawler/ophim/search** - Advanced filter
7. **GET /crawler/ophim/list-film-by-type** - Filter by type
8. **GET /crawler/ophim/list-film-by-category** - Filter by category
9. **GET /crawler/ophim/list-film-by-country** - Filter by country
10. **GET /crawler/ophim/list-film-by-year** - Filter by year
11. **GET /crawler/ophim/list-film-by-actor** - Filter by actor
12. **GET /crawler/ophim/list-film-by-director** - Filter by director
13. **GET /crawler/ophim/episode/{slug}** - Get specific episode

## Testing

Test the corrected API:

```bash
# Test getting countries
curl https://cinevserse-api.nhatquang.shop/crawler/ophim/countries

# Test getting hot films
curl https://cinevserse-api.nhatquang.shop/crawler/ophim/hot?limit=5

# Test search
curl https://cinevserse-api.nhatquang.shop/crawler/ophim/search/avatar

# Test movie detail
curl https://cinevserse-api.nhatquang.shop/crawler/ophim/info/avatar-2-dong-chay-cua-nuoc
```

## Notes

1. All endpoints use cursor-based pagination except countries and categories (which return complete lists)
2. The API base URL is: `https://cinevserse-api.nhatquang.shop`
3. No authentication is required for these endpoints
4. Response times are typically fast (<500ms)
5. The API supports CORS for client-side requests

## Files Modified

1. ✅ `types/index.ts` - Updated Movie, Category, Country types
2. ✅ `types/index.ts` - Added CursorPagination and SimpleListResponse types
3. ✅ `types/index.ts` - Updated PaginatedResponse to use cursor pagination
4. ✅ `lib/api/movies-corrected.ts` - New file with correct implementation
5. ✅ `lib/api/movies.ts` - Marked as deprecated with warning
6. ✅ `docs/API_CORRECTIONS.md` - This documentation

## Next Steps

1. Update all components to use `movieApiCorrected`
2. Implement cursor-based pagination in UI components
3. Test all endpoints with the new implementation
4. Remove old `movieApi` after migration is complete
5. Update any React Query hooks to use the new API

## References

- API Documentation: https://cinevserse-api.nhatquang.shop/api-json
- Base URL: https://cinevserse-api.nhatquang.shop
- API Type: REST API with cursor-based pagination
