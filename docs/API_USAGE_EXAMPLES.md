# API Usage Examples

Complete examples for using the corrected Cineverse API.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Pagination](#pagination)
3. [Filtering & Search](#filtering--search)
4. [React Query Integration](#react-query-integration)
5. [Component Examples](#component-examples)

## Basic Usage

### Get Movie Details

```typescript
import movieApi from '@/lib/api/movies-corrected'

async function getMovieDetails(slug: string) {
  try {
    const movie = await movieApi.getMovieBySlug(slug)
    console.log(movie.name)
    console.log(movie.poster_url)
    console.log(movie.view) // View count
    console.log(movie.category) // Array of categories
  } catch (error) {
    console.error('Failed to fetch movie:', error)
  }
}

// Usage
getMovieDetails('avatar-2-dong-chay-cua-nuoc')
```

### Get Hot/Trending Movies

```typescript
async function getTrendingMovies() {
  const response = await movieApi.getHotFilms(10)
  
  console.log('Total items:', response.totalItems)
  console.log('Has more:', response.hasNextPage)
  
  response.data.forEach(movie => {
    console.log(`${movie.name} - ${movie.view} views`)
  })
}
```

### Get All Categories and Countries

```typescript
async function getFilters() {
  const [categories, countries] = await Promise.all([
    movieApi.getCategories(),
    movieApi.getCountries()
  ])
  
  console.log('Categories:', categories.length)
  console.log('Countries:', countries.length)
  
  return { categories, countries }
}
```

## Pagination

### Forward Pagination (Next Page)

```typescript
import { CursorPagination } from '@/types'

async function loadMoviesWithPagination() {
  let currentCursor: CursorPagination | null = null
  let page = 1
  
  while (true) {
    const params = currentCursor ? {
      lastView: currentCursor.view,
      lastCreatedAt: currentCursor.createdAt,
      lastId: currentCursor.id
    } : {}
    
    const response = await movieApi.getHotFilms(20, params)
    
    console.log(`Page ${page}:`, response.data.length, 'movies')
    
    if (!response.hasNextPage) {
      console.log('No more pages')
      break
    }
    
    currentCursor = response.nextCursor
    page++
    
    // Stop after 3 pages for example
    if (page > 3) break
  }
}
```

### Using Pagination Manager

```typescript
import { CursorPaginationManager } from '@/lib/api/migration-helper'

async function paginateWithManager() {
  const manager = new CursorPaginationManager()
  let currentPage = 1
  
  // Load first page
  let response = await movieApi.getHotFilms(20)
  manager.updateFromResponse(response, currentPage)
  
  console.log('Page 1:', response.data.length)
  
  // Load next page if available
  if (response.hasNextPage) {
    currentPage++
    const nextParams = manager.getNextPageParams()
    
    if (nextParams) {
      response = await movieApi.getHotFilms(20, nextParams)
      manager.updateFromResponse(response, currentPage)
      console.log('Page 2:', response.data.length)
    }
  }
  
  // Go back to previous page
  if (response.hasPrevPage) {
    const prevParams = manager.getPrevPageParams()
    
    if (prevParams) {
      response = await movieApi.getHotFilms(20, prevParams)
      console.log('Back to page 1:', response.data.length)
    }
  }
}
```

## Filtering & Search

### Search by Keyword

```typescript
async function searchMovies(keyword: string) {
  const response = await movieApi.searchFilms(keyword)
  
  console.log(`Found ${response.totalItems} movies for "${keyword}"`)
  
  response.data.forEach(movie => {
    console.log(`- ${movie.name} (${movie.year})`)
  })
  
  return response
}

// Usage
searchMovies('avatar')
```

### Filter by Category

```typescript
async function getActionMovies() {
  const response = await movieApi.getFilmsByCategory('hanh-dong', {
    limit: 20
  })
  
  console.log('Action movies:', response.totalItems)
  return response.data
}
```

### Filter by Country

```typescript
async function getKoreanMovies() {
  const response = await movieApi.getFilmsByCountry('han-quoc', {
    limit: 20
  })
  
  console.log('Korean movies:', response.totalItems)
  return response.data
}
```

### Filter by Type

```typescript
async function getMoviesByType(type: 'single' | 'series' | 'hoathinh' | 'tvshows') {
  const response = await movieApi.getFilmsByType(type, {
    limit: 20
  })
  
  return response.data
}

// Usage
const series = await getMoviesByType('series')
const movies = await getMoviesByType('single')
const anime = await getMoviesByType('hoathinh')
const tvShows = await getMoviesByType('tvshows')
```

### Advanced Filter

```typescript
async function advancedFilter() {
  const response = await movieApi.filterFilms({
    keyword: 'action',
    categories: ['hanh-dong', 'phieu-luu'],
    countries: ['au-my', 'han-quoc'],
    types: ['single'],
    limit: 20
  })
  
  return response.data
}
```

### Filter by Year

```typescript
async function getMoviesByYear(year: number) {
  const response = await movieApi.getFilmsByYear(year, {
    limit: 20
  })
  
  console.log(`Movies from ${year}:`, response.totalItems)
  return response.data
}

// Get movies from 2024
getMoviesByYear(2024)
```

### Filter by Actor

```typescript
async function getMoviesByActor(actorName: string) {
  const response = await movieApi.getFilmsByActor(actorName, {
    limit: 20
  })
  
  console.log(`Movies with ${actorName}:`, response.totalItems)
  return response.data
}

// Usage
getMoviesByActor('Tom Cruise')
```

## React Query Integration

### Basic Movie Query

```typescript
import { useQuery } from '@tanstack/react-query'
import movieApi from '@/lib/api/movies-corrected'

function useMovie(slug: string) {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: () => movieApi.getMovieBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Usage in component
function MovieDetail({ slug }: { slug: string }) {
  const { data: movie, isLoading, error } = useMovie(slug)
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading movie</div>
  if (!movie) return null
  
  return (
    <div>
      <h1>{movie.name}</h1>
      <img src={movie.poster_url} alt={movie.name} />
      <p>{movie.content}</p>
    </div>
  )
}
```

### Paginated Movies Query

```typescript
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CursorPaginationManager } from '@/lib/api/migration-helper'

function useHotMovies() {
  const [page, setPage] = useState(1)
  const paginationManager = useMemo(() => new CursorPaginationManager(), [])
  
  const query = useQuery({
    queryKey: ['movies', 'hot', page],
    queryFn: async () => {
      const params = page === 1 
        ? {} 
        : (paginationManager.getNextPageParams() || {})
      
      const response = await movieApi.getHotFilms(20, params)
      paginationManager.updateFromResponse(response, page)
      
      return response
    },
    keepPreviousData: true,
  })
  
  const handleNextPage = () => {
    if (query.data?.hasNextPage) {
      setPage(p => p + 1)
    }
  }
  
  const handlePrevPage = () => {
    if (query.data?.hasPrevPage && page > 1) {
      setPage(p => p - 1)
    }
  }
  
  return {
    ...query,
    page,
    handleNextPage,
    handlePrevPage,
  }
}

// Usage in component
function HotMovies() {
  const { data, isLoading, page, handleNextPage, handlePrevPage } = useHotMovies()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h2>Hot Movies - Page {page}</h2>
      <div className="grid">
        {data?.data.map(movie => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
      
      <div className="pagination">
        <button 
          onClick={handlePrevPage} 
          disabled={!data?.hasPrevPage || page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {data?.totalPages}</span>
        <button 
          onClick={handleNextPage} 
          disabled={!data?.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

### Categories Query

```typescript
function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => movieApi.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour (categories don't change often)
  })
}

// Usage
function CategoryFilter() {
  const { data: categories, isLoading } = useCategories()
  
  if (isLoading) return <div>Loading categories...</div>
  
  return (
    <select>
      <option value="">All Categories</option>
      {categories?.map(cat => (
        <option key={cat._id} value={cat.slug}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
```

### Search Query with Debounce

```typescript
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'

function useMovieSearch(initialQuery = '') {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(searchQuery, 500)
  
  const query = useQuery({
    queryKey: ['movies', 'search', debouncedQuery],
    queryFn: () => movieApi.searchFilms(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  })
  
  return {
    ...query,
    searchQuery,
    setSearchQuery,
  }
}

// Usage
function SearchMovies() {
  const { data, isLoading, searchQuery, setSearchQuery } = useMovieSearch()
  
  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search movies..."
      />
      
      {isLoading && <div>Searching...</div>}
      
      {data && (
        <div>
          <p>Found {data.totalItems} results</p>
          <div className="grid">
            {data.data.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## Component Examples

### Complete Movie List Component

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import movieApi from '@/lib/api/movies-corrected'
import { CursorPaginationManager } from '@/lib/api/migration-helper'
import { MovieCard } from '@/components/movies/movie-card'
import { Pagination } from '@/components/ui/pagination'

export function MovieList({ type }: { type: 'hot' | 'series' | 'single' | 'hoathinh' }) {
  const [page, setPage] = useState(1)
  const paginationManager = useMemo(() => new CursorPaginationManager(), [])
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', type, page],
    queryFn: async () => {
      const params = page === 1 
        ? {} 
        : (paginationManager.getNextPageParams() || {})
      
      let response
      switch (type) {
        case 'hot':
          response = await movieApi.getHotFilms(20, params)
          break
        case 'series':
        case 'single':
        case 'hoathinh':
          response = await movieApi.getFilmsByType(type, { ...params, limit: 20 })
          break
      }
      
      paginationManager.updateFromResponse(response, page)
      return response
    },
    keepPreviousData: true,
  })
  
  if (error) {
    return <div className="text-red-500">Error loading movies</div>
  }
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 aspect-[2/3] rounded" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.data.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
          
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages || 1}
            hasNextPage={data?.hasNextPage || false}
            hasPrevPage={data?.hasPrevPage || false}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
```

### Filter Component

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import movieApi from '@/lib/api/movies-corrected'
import { Select } from '@/components/ui/select'

interface FilterProps {
  onFilterChange: (filters: {
    category?: string
    country?: string
    year?: number
    type?: string
  }) => void
}

export function MovieFilters({ onFilterChange }: FilterProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => movieApi.getCategories(),
  })
  
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => movieApi.getCountries(),
  })
  
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
  const types = [
    { value: 'single', label: 'Single' },
    { value: 'series', label: 'Series' },
    { value: 'hoathinh', label: 'Anime' },
    { value: 'tvshows', label: 'TV Shows' },
  ]
  
  return (
    <div className="flex gap-4 flex-wrap">
      <Select onValueChange={(value: string) => onFilterChange({ category: value })}>
        <option value="">All Categories</option>
        {categories?.map(cat => (
          <option key={cat._id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </Select>
      
      <Select onValueChange={(value: string) => onFilterChange({ country: value })}>
        <option value="">All Countries</option>
        {countries?.map(country => (
          <option key={country._id} value={country.slug || ''}>
            {country.name}
          </option>
        ))}
      </Select>
      
      <Select onValueChange={(value: string) => onFilterChange({ year: parseInt(value) })}>
        <option value="">All Years</option>
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
      
      <Select onValueChange={(value: string) => onFilterChange({ type: value })}>
        <option value="">All Types</option>
        {types.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
```

## Best Practices

1. **Cache Aggressively**: Categories and countries rarely change, cache them for a long time
2. **Use Debounce**: Debounce search inputs to avoid excessive API calls
3. **Handle Pagination**: Always check `hasNextPage` and `hasPrevPage` before navigation
4. **Error Handling**: Always handle errors gracefully
5. **Loading States**: Show skeleton loaders for better UX
6. **Keep Previous Data**: Use `keepPreviousData` in React Query for smooth pagination
7. **Type Safety**: Use TypeScript types from `@/types` for type safety

## Common Pitfalls

1. ❌ **Don't use page numbers directly** - Use cursors instead
2. ❌ **Don't ignore `hasNextPage`** - Check before loading more
3. ❌ **Don't forget to reset pagination** - Reset when filters change
4. ❌ **Don't call API on every keystroke** - Use debounce for search
5. ❌ **Don't hardcode pagination state** - Use PaginationManager

## Performance Tips

1. Use React Query's caching effectively
2. Implement virtual scrolling for large lists
3. Lazy load images with appropriate placeholders
4. Prefetch next page when user reaches 80% of current page
5. Use `staleTime` and `cacheTime` appropriately in React Query
