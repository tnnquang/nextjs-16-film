'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MovieCard } from './movie-card'
import { Movie } from '@/types'
import { cn } from '@/lib/utils'

interface MovieCarouselProps {
  movies: Movie[]
  title?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MovieCarousel({ 
  movies, 
  title,
  size = 'md',
  className 
}: MovieCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No movies found.
      </div>
    )
  }

  return (
    <div className={cn('relative group', className)}>
      {title && (
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
      )}
      
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto scrollbar-none pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie._id} className="flex-none">
            <MovieCard 
              movie={movie} 
              size={size}
              className="w-48"
            />
          </div>
        ))}
      </div>
    </div>
  )
}