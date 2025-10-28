import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Clock, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Movie } from '@/types'
import { getImageUrl, truncateText, formatYear } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MovieCardProps {
  movie: Movie
  size?: 'sm' | 'md' | 'lg'
  showOverlay?: boolean
  className?: string
}

export function MovieCard({ movie, size = 'md', showOverlay = true, className }: MovieCardProps) {
  const sizeClasses = {
    sm: 'w-32 h-48',
    md: 'w-48 h-72',
    lg: 'w-56 h-84',
  }

  return (
    <Card className={cn('movie-card', className)}>
      <div className="relative overflow-hidden rounded-t-lg">
        <div className={cn('relative', sizeClasses[size])}>
          <Image
            src={getImageUrl(movie.poster_url)}
            alt={movie.name}
            fill
            className="movie-card-image"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Quality Badge */}
          {movie.quality && (
            <Badge className="absolute left-2 top-2 bg-black/80 text-white" variant="secondary">
              {movie.quality}
            </Badge>
          )}

          {/* Year Badge */}
          {movie.year && (
            <Badge className="absolute right-2 top-2 bg-black/80 text-white" variant="outline">
              {movie.year}
            </Badge>
          )}

          {/* Overlay */}
          {showOverlay && (
            <div className="movie-card-overlay">
              <div className="movie-card-content">
                <div className="mb-4 flex items-center justify-center">
                  <Button size="sm" asChild>
                    <Link href={`/watch/${movie.slug}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Watch
                    </Link>
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="line-clamp-2 text-sm font-semibold">{movie.name}</h3>

                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <p className="line-clamp-1 text-xs text-gray-300">{movie.origin_name}</p>
                  )}

                  <div className="flex items-center space-x-2 text-xs">
                    {movie.episode_current && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{movie.episode_current}</span>
                      </div>
                    )}

                    {movie.year && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{movie.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-3">
        <Link href={`/movies/${movie.slug}`} className="block">
          <h3 className="hover:text-primary line-clamp-2 text-sm font-medium transition-colors">
            {movie.name}
          </h3>

          {movie.origin_name && movie.origin_name !== movie.name && (
            <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">{movie.origin_name}</p>
          )}

          <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
            <span>{movie.year}</span>
            {movie.episode_current && <span>{movie.episode_current}</span>}
          </div>

          {movie.category && movie.category.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {movie.category.slice(0, 2).map((cat) => (
                <Badge key={cat._id} variant="outline" className="px-1 py-0 text-xs">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  )
}
