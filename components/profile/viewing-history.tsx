'use client'

import { useState } from 'react'
import { Calendar, Clock, Trash2, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getImageUrl, formatDate } from '@/lib/utils'

// Mock viewing history data
const mockViewingHistory = [
  {
    id: '1',
    movie: {
      _id: '1',
      name: 'The Dark Knight',
      slug: 'the-dark-knight',
      poster_url: '/placeholder-movie.jpg',
      year: 2008,
      time: '152 minutes'
    },
    watchedAt: '2024-01-15T20:30:00Z',
    progress: 100,
    episode: '1/1',
    resumePosition: 0
  },
  {
    id: '2',
    movie: {
      _id: '2',
      name: 'Inception',
      slug: 'inception',
      poster_url: '/placeholder-movie.jpg',
      year: 2010,
      time: '148 minutes'
    },
    watchedAt: '2024-01-14T19:15:00Z',
    progress: 75,
    episode: '1/1',
    resumePosition: 6660 // 111 minutes in seconds
  },
  // Add more mock data...
]

export function ViewingHistory() {
  const [history, setHistory] = useState(mockViewingHistory)

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  const clearAllHistory = () => {
    setHistory([])
  }

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Viewing History ({history.length})</CardTitle>
          {history.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllHistory}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  {/* Movie Poster */}
                  <div className="relative w-16 h-24 flex-shrink-0">
                    <Image
                      src={getImageUrl(item.movie.poster_url)}
                      alt={item.movie.name}
                      fill
                      className="object-cover rounded"
                      sizes="64px"
                    />
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <Link href={`/movies/${item.movie.slug}`}>
                        <h3 className="font-medium hover:text-primary transition-colors">
                          {item.movie.name}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{item.movie.year}</span>
                        <span>•</span>
                        <span>{item.movie.time}</span>
                        <span>•</span>
                        <span>Episode {item.episode}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {item.progress === 100 ? 'Completed' : `${item.progress}% watched`}
                        </span>
                        {item.resumePosition > 0 && (
                          <span className="text-muted-foreground">
                            Resume at {formatWatchTime(item.resumePosition)}
                          </span>
                        )}
                      </div>
                      <Progress value={item.progress} className="h-1" />
                    </div>

                    {/* Watch Date */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.watchedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    {item.progress < 100 && (
                      <Button size="sm" asChild>
                        <Link href={`/watch/${item.movie.slug}?t=${item.resumePosition}`}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Resume
                        </Link>
                      </Button>
                    )}
                    
                    <Button size="sm" asChild>
                      <Link href={`/watch/${item.movie.slug}`}>
                        Watch Again
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromHistory(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No viewing history yet. Start watching some movies!
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