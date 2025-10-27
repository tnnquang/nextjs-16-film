import { MovieCard } from './movie-card'
import { Movie } from '@/types'
import { cn } from '@/lib/utils'

interface MovieGridProps {
  movies: Movie[]
  columns?: 2 | 3 | 4 | 5 | 6
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MovieGrid({ 
  movies, 
  columns = 4,
  size = 'md',
  className 
}: MovieGridProps) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No movies found.
      </div>
    )
  }

  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[columns],
      className
    )}>
      {movies.map((movie) => (
        <MovieCard 
          key={movie._id} 
          movie={movie} 
          size={size}
        />
      ))}
    </div>
  )
}