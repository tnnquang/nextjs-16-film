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

export function MovieCard({ 
  movie, 
  size = 'md', 
  showOverlay = true,
  className 
}: MovieCardProps) {
  const sizeClasses = {
    sm: 'w-32 h-48',
    md: 'w-48 h-72',
    lg: 'w-56 h-84'
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
            <Badge 
              className="absolute top-2 left-2 bg-black/80 text-white"
              variant="secondary"
            >
              {movie.quality}
            </Badge>
          )}

          {/* Year Badge */}
          {movie.year && (
            <Badge 
              className="absolute top-2 right-2 bg-black/80 text-white"
              variant="outline"
            >
              {movie.year}
            </Badge>
          )}

          {/* Overlay */}
          {showOverlay && (
            <div className="movie-card-overlay">
              <div className="movie-card-content">
                <div className="flex items-center justify-center mb-4">
                  <Button size="sm" asChild>
                    <Link href={`/watch/${movie.slug}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Watch
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {movie.name}
                  </h3>
                  
                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <p className="text-xs text-gray-300 line-clamp-1">
                      {movie.origin_name}
                    </p>
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
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {movie.name}
          </h3>
          
          {movie.origin_name && movie.origin_name !== movie.name && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {movie.origin_name}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{movie.year}</span>
            {movie.episode_current && (
              <span>{movie.episode_current}</span>
            )}
          </div>
          
          {movie.category && movie.category.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.category.slice(0, 2).map((cat) => (
                <Badge 
                  key={cat.id} 
                  variant="outline" 
                  className="text-xs px-1 py-0"
                >
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