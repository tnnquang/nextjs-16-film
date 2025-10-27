import Link from 'next/link'
import { Calendar, Clock, Globe, Film, Star, Heart, Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MovieDetail } from '@/types'

interface MovieInfoProps {
  movie: MovieDetail
}

export function MovieInfo({ movie }: MovieInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{movie.name}</CardTitle>
            {movie.origin_name && movie.origin_name !== movie.name && (
              <p className="text-lg text-muted-foreground">{movie.origin_name}</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Heart className="mr-2 h-4 w-4" />
              Add to Favorites
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{movie.year}</span>
          </div>
          
          {movie.time && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{movie.time}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Film className="h-4 w-4 text-muted-foreground" />
            <span>{movie.episode_current}</span>
            {movie.episode_total && movie.episode_total !== movie.episode_current && (
              <span>/ {movie.episode_total}</span>
            )}
          </div>
          
          {movie.country.length > 0 && (
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{movie.country.map(c => c.name).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{movie.quality}</Badge>
          <Badge variant="outline">{movie.lang}</Badge>
          <Badge variant="outline">{movie.type}</Badge>
          <Badge variant={movie.status === 'completed' ? 'default' : 'secondary'}>
            {movie.status}
          </Badge>
          {movie.chieurap && (
            <Badge variant="outline">Cinema Release</Badge>
          )}
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold mb-2">Genres</h4>
          <div className="flex flex-wrap gap-2">
            {movie.category.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Badge variant="secondary" className="hover:bg-primary/20 cursor-pointer">
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Synopsis */}
        <div>
          <h4 className="font-semibold mb-2">Synopsis</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {movie.content}
          </p>
        </div>

        {/* Cast and Crew */}
        {(movie.actor?.length > 0 || movie.director?.length > 0) && (
          <>
            <Separator />
            
            <div className="grid md:grid-cols-2 gap-6">
              {movie.director && movie.director.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Director</h4>
                  <div className="space-y-1">
                    {movie.director.map((director, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {director}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {movie.actor && movie.actor.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Cast</h4>
                  <div className="space-y-1">
                    {movie.actor.slice(0, 10).map((actor, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {actor}
                      </p>
                    ))}
                    {movie.actor.length > 10 && (
                      <p className="text-sm text-muted-foreground">
                        +{movie.actor.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Additional Info */}
        <Separator />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Release Year:</span>
            <p>{movie.year}</p>
          </div>
          
          <div>
            <span className="font-medium text-muted-foreground">Language:</span>
            <p>{movie.lang}</p>
          </div>
          
          <div>
            <span className="font-medium text-muted-foreground">Quality:</span>
            <p>{movie.quality}</p>
          </div>
          
          <div>
            <span className="font-medium text-muted-foreground">Type:</span>
            <p className="capitalize">{movie.type}</p>
          </div>
        </div>

        {/* Show times if available */}
        {movie.showtimes && (
          <>
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Showtimes</h4>
              <p className="text-sm text-muted-foreground">{movie.showtimes}</p>
            </div>
          </>
        )}

        {/* Trailer if available */}
        {movie.trailer_url && (
          <>
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Trailer</h4>
              <Button variant="outline" asChild>
                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                  <Film className="mr-2 h-4 w-4" />
                  Watch Trailer
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}