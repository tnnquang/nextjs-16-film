import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { MovieDetailContent } from '@/components/movies/movie-detail-content'
import { RelatedMovies } from '@/components/movies/related-movies'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { movieApi } from '@/lib/api/movies'

interface MoviePageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  try {
    const response = await movieApi.getMovieBySlug(params.slug)
    const movie = response.data
    
    if (!movie) {
      return {
        title: 'Movie Not Found'
      }
    }

    return {
      title: `${movie.name} (${movie.year}) | CineVerse`,
      description: movie.content.slice(0, 160),
      openGraph: {
        title: movie.name,
        description: movie.content,
        images: [
          {
            url: movie.poster_url,
            width: 500,
            height: 750,
            alt: movie.name,
          },
        ],
      },
      keywords: [
        movie.name,
        movie.origin_name,
        ...movie.category.map(cat => cat.name),
        ...movie.country.map(country => country.name),
        'movie',
        'streaming',
        'watch online'
      ],
    }
  } catch (error) {
    return {
      title: 'Movie Not Found'
    }
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  try {
    const response = await movieApi.getMovieBySlug(params.slug)
    
    if (!response.data) {
      notFound()
    }

    const movie = response.data

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner className="h-96" />}>
            <MovieDetailContent movie={movie} />
          </Suspense>
          
          <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <RelatedMovies 
                categories={movie.category} 
                excludeId={movie._id}
              />
            </Suspense>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  } catch (error) {
    notFound()
  }
}