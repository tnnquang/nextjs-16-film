'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MovieGrid } from '@/components/movies/movie-grid'
import { MovieList } from '@/components/movies/movie-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination } from '@/components/ui/pagination'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { SearchFilters as SearchFiltersType } from '@/types'
import { CACHE_TTL } from '@/lib/constants'
import { buildQueryString } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface SearchResultsProps {
  query: string
  filters: SearchFiltersType & { page: number }
}

export function SearchResults({ query, filters }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'view' | 'created' | 'modified'>('modified')
  const router = useRouter()

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['movies', 'search', query, filters, sortBy],
    queryFn: async () => {
      if (query.trim()) {
        return await movieApiCorrected.searchFilms(query)
      } else {
        return await movieApiCorrected.getHotFilms(20)
      }
    },
    staleTime: CACHE_TTL.SEARCH,
  })

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    const params = buildQueryString({
      q: query,
      ...Object.fromEntries(
        Object.entries(newFilters).filter(([_, value]) => 
          value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)
        )
      )
    })
    router.push(`/search?${params}`)
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'name' | 'year' | 'view' | 'created' | 'modified')
  }

  if (isLoading) {
    return <LoadingSpinner className="h-96" />
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Something went wrong while searching. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  const movies = response?.data || []
  const totalPages = response?.totalPages || 1
  const currentPage = filters.page || 1
  const totalItems = response?.totalItems || 0

  if (movies.length === 0 && query) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-semibold">No results found</h3>
        <p className="text-muted-foreground">
          We couldn't find any movies matching "{query}". Try adjusting your search or filters.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Suggestions:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check your spelling</li>
            <li>• Try different keywords</li>
            <li>• Use fewer filters</li>
            <li>• Browse by category instead</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            {totalItems > 0 && (
              <>
                Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalItems)} of {totalItems} results
              </>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modified">Latest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="view">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {movies.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <MovieGrid movies={movies} columns={4} />
          ) : (
            <MovieList movies={movies} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}