'use client'

import { useState } from 'react'
import { Grid, List, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MovieGrid } from '@/components/movies/movie-grid'
import { MovieList } from '@/components/movies/movie-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock favorite movies data
const mockFavoriteMovies = [
  {
    _id: '1',
    name: 'The Dark Knight',
    slug: 'the-dark-knight',
    origin_name: 'The Dark Knight',
    poster_url: '/placeholder-movie.jpg',
    thumb_url: '/placeholder-movie.jpg',
    year: 2008,
    category: [{ _id: '1', name: 'Action', slug: 'action' }],
    country: [{ _id: '1', name: 'USA', slug: 'usa' }],
    type: 'single' as const,
    status: 'completed' as const,
    chieurap: false,
    time: '152 minutes',
    episode_current: '1/1',
    episode_total: '1',
    quality: 'HD',
    lang: 'English',
    notify: '',
    showtimes: '',
    trailer_url: '',
    content: 'Batman faces the Joker in this epic superhero film.',
    actor: ['Christian Bale', 'Heath Ledger'],
    director: ['Christopher Nolan'],
    created: { time: '2023-01-01' },
    modified: { time: '2023-01-01' },
    view: 0,
    sub_docquyen: false,
    is_copyright: false,
    imdb: {
      id: '',
      vote_average: 0,
      vote_count: 0,
    },
    tmdb: {
      type: null,
      id: '',
      season: null,
      vote_average: 0,
      vote_count: 0,
    },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  // Add more mock movies...
]

export function FavoriteMovies() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('added')

  const filteredMovies = mockFavoriteMovies.filter(
    (movie) =>
      movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.origin_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Favorite Movies ({mockFavoriteMovies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="added">Recently Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-md border">
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

          {/* Movies Display */}
          {filteredMovies.length > 0 ? (
            viewMode === 'grid' ? (
              <MovieGrid movies={filteredMovies} columns={4} />
            ) : (
              <MovieList movies={filteredMovies} />
            )
          ) : searchQuery ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No favorite movies found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                You haven't added any movies to your favorites yet.
              </p>
              <Button className="mt-4" asChild>
                <a href="/movies">Browse Movies</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
