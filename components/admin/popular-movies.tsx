'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Star, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getImageUrl } from '@/lib/utils'

// Mock popular movies data
const mockPopularMovies = [
  {
    id: '1',
    name: 'The Dark Knight',
    poster_url: '/placeholder-movie.jpg',
    views: 125400,
    rating: 9.2,
    trend: '+15%'
  },
  {
    id: '2',
    name: 'Inception',
    poster_url: '/placeholder-movie.jpg',
    views: 98300,
    rating: 8.8,
    trend: '+8%'
  },
  {
    id: '3',
    name: 'Interstellar',
    poster_url: '/placeholder-movie.jpg',
    views: 87600,
    rating: 8.9,
    trend: '+12%'
  },
  {
    id: '4',
    name: 'The Avengers',
    poster_url: '/placeholder-movie.jpg',
    views: 76200,
    rating: 8.1,
    trend: '+5%'
  },
  {
    id: '5',
    name: 'Pulp Fiction',
    poster_url: '/placeholder-movie.jpg',
    views: 65800,
    rating: 9.0,
    trend: '+3%'
  }
]

export function PopularMovies() {
  return (
    <div className="space-y-4">
      {mockPopularMovies.map((movie, index) => (
        <div key={movie.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-primary bg-primary/10 rounded-full">
              {index + 1}
            </span>
          </div>
          
          <div className="relative w-12 h-16 flex-shrink-0">
            <Image
              src={getImageUrl(movie.poster_url)}
              alt={movie.name}
              fill
              className="object-cover rounded"
              sizes="48px"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Link href={`/movies/${movie.id}`}>
              <h4 className="font-medium text-sm hover:text-primary transition-colors truncate">
                {movie.name}
              </h4>
            </Link>
            
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{(movie.views / 1000).toFixed(1)}K</span>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>{movie.rating}</span>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                {movie.trend}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}