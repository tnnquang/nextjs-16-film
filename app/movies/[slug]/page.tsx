import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { MovieDetailContent } from '@/components/movies/movie-detail-content'
import { RelatedMovies } from '@/components/movies/related-movies'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'

interface MoviePageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const response = await movieApiCorrected.getMovieBySlug(slug)
    const movie = response

    if (!movie) {
      return {
        title: 'Movie Not Found',
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
        ...movie.category.map((cat) => cat.name),
        ...movie.country.map((country) => country.name),
        'movie',
        'streaming',
        'watch online',
      ],
    }
  } catch (error) {
    return {
      title: 'Movie Not Found',
    }
  }
}

// Separate component for content that needs data fetching
async function MoviePageContent({ slug }: { slug: string }) {
  const response = await movieApiCorrected.getMovieBySlug(slug)

  if (!response) {
    notFound()
  }

  const movie = response

  return (
    <>
      <MovieDetailContent movie={movie} />

      <div className="container mx-auto px-4 py-8">
        <RelatedMovies categories={movie.category} excludeId={movie._id} />
      </div>
    </>
  )
}

// Wrapper to handle async params
async function MoviePageWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <MoviePageContent slug={slug} />
}

export default function MoviePage({ params }: MoviePageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner className="h-96" />}>
          <MoviePageWrapper params={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
