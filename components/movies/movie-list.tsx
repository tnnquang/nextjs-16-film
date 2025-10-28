import Image from 'next/image'
import Link from 'next/link'
import { Play, Calendar, Clock, Star, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Movie } from '@/types'
import { getImageUrl, truncateText } from '@/lib/utils'

interface MovieListProps {
  movies: Movie[]
}

export function MovieList({ movies }: MovieListProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No movies found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {movies.map((movie) => (
        <Card key={movie._id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex">
              {/* Poster */}
              <div className="relative w-32 h-48 flex-shrink-0">
                <Image
                  src={getImageUrl(movie.poster_url)}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                
                {/* Quality Badge */}
                {movie.quality && (
                  <Badge 
                    className="absolute top-2 left-2 bg-black/80 text-white text-xs"
                    variant="secondary"
                  >
                    {movie.quality}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    {/* Title and Year */}
                    <div>
                      <Link href={`/movies/${movie.slug}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                          {movie.name}
                        </h3>
                      </Link>
                      {movie.origin_name && movie.origin_name !== movie.name && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {movie.origin_name}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{movie.year}</span>
                      </div>
                      
                      {movie.time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{movie.time}</span>
                        </div>
                      )}
                      
                      {movie.episode_current && (
                        <div className="flex items-center space-x-1">
                          <span>Episodes: {movie.episode_current}</span>
                          {movie.episode_total && movie.episode_total !== movie.episode_current && (
                            <span>/ {movie.episode_total}</span>
                          )}
                        </div>
                      )}
                      
                      {movie.country.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <span>{movie.country.slice(0, 2).map(c => c.name).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                      {movie.category.slice(0, 4).map((category) => (
                        <Link key={category._id} href={`/categories/${category.slug}`}>
                          <Badge variant="outline" className="text-xs hover:bg-primary/20">
                            {category.name}
                          </Badge>
                        </Link>
                      ))}
                      {movie.category.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{movie.category.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncateText(movie.content, 150)}
                    </p>

                    {/* Status and Language */}
                    <div className="flex items-center space-x-2">
                      <Badge variant={movie.status === 'completed' ? 'default' : 'secondary'}>
                        {movie.status}
                      </Badge>
                      <Badge variant="outline">
                        {movie.lang}
                      </Badge>
                      <Badge variant="outline">
                        {movie.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" asChild>
                      <Link href={`/watch/${movie.slug}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/movies/${movie.slug}`}>
                        Info
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}