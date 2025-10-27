'use client'

import { useState } from 'react'
import { MovieGrid } from '@/components/movies/movie-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock watch later data - same structure as favorite movies
const mockWatchLater: any[] = [
  // Add mock movies for watch later list
]

export function WatchLater() {
  const [watchLater] = useState(mockWatchLater)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Watch Later ({watchLater.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {watchLater.length > 0 ? (
            <MovieGrid movies={watchLater} columns={4} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Your watch later list is empty.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/movies">Browse Movies</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}