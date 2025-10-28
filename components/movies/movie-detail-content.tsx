'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Heart, Share2, Download, Star, Calendar, Clock, Globe, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { MovieDetail } from '@/types'
import { getImageUrl, formatDate, truncateText } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface MovieDetailContentProps {
  movie: MovieDetail
}

export function MovieDetailContent({ movie }: MovieDetailContentProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: `${movie.name} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.name,
          text: movie.content.slice(0, 100),
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copied',
        description: 'Movie link has been copied to clipboard.'
      })
    }
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-[600px] overflow-hidden">
        <Image
          src={getImageUrl(movie.poster_url, 'original')}
          alt={movie.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Poster */}
              <div className="lg:col-span-3">
                <div className="relative w-64 h-96 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={getImageUrl(movie.poster_url)}
                    alt={movie.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-9 text-white space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{movie.year}</Badge>
                    <Badge variant="outline" className="text-white border-white/20">
                      {movie.quality}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/20">
                      {movie.lang}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/20">
                      {movie.type}
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl lg:text-6xl font-bold">{movie.name}</h1>
                  
                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <p className="text-xl text-gray-300">{movie.origin_name}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.year}</span>
                  </div>
                  
                  {movie.time && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{movie.time}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Film className="h-4 w-4" />
                    <span>{movie.episode_current} / {movie.episode_total}</span>
                  </div>
                  
                  {movie.country.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>{movie.country.map(c => c.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                <p className="text-lg text-gray-200 leading-relaxed max-w-3xl">
                  {movie.content}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {movie.category.map((category) => (
                    <Link key={category._id} href={`/categories/${category.slug}`}>
                      <Badge variant="outline" className="text-white border-white/20 hover:bg-white/10">
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href={`/watch/${movie.slug}`}>
                      <Play className="mr-2 h-5 w-5" />
                      Watch Now
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleFavorite}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleShare}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="episodes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="space-y-4">
            {movie.episodes && movie.episodes.length > 0 ? (
              <div className="space-y-6">
                {movie.episodes.map((server, serverIndex) => (
                  <Card key={serverIndex}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">{server.server_name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {server.server_data.map((episode, episodeIndex) => (
                          <Button
                            key={episodeIndex}
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/watch/${movie.slug}?ep=${episode.slug}`}>
                              {episode.name}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No episodes available at the moment.
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Original Title</h4>
                      <p>{movie.origin_name}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Year</h4>
                      <p>{movie.year}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                      <Badge variant="outline">{movie.status}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Quality</h4>
                      <Badge>{movie.quality}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Language</h4>
                      <p>{movie.lang}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                      <p>{movie.time || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Episodes</h4>
                      <p>{movie.episode_current} / {movie.episode_total}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Countries</h4>
                      <div className="flex flex-wrap gap-1">
                        {movie.country.map((country) => (
                          <Badge key={country._id} variant="outline">
                            {country.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.category.map((category) => (
                      <Link key={category._id} href={`/categories/${category.slug}`}>
                        <Badge variant="secondary" className="hover:bg-primary/20">
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Synopsis</h4>
                  <p className="text-sm leading-relaxed">{movie.content}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cast" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {movie.actor && movie.actor.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Cast</h3>
                    <div className="space-y-2">
                      {movie.actor.map((actor, index) => (
                        <div key={index} className="text-sm">
                          {actor}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {movie.director && movie.director.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Director</h3>
                    <div className="space-y-2">
                      {movie.director.map((director, index) => (
                        <div key={index} className="text-sm">
                          {director}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {(!movie.actor || movie.actor.length === 0) && (!movie.director || movie.director.length === 0) && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Cast and crew information not available.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}