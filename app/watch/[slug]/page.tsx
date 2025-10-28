import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { VideoPlayer } from '@/components/video/video-player'
import { MovieInfo } from '@/components/movies/movie-info'
import { EpisodeList } from '@/components/video/episode-list'
import { RelatedMovies } from '@/components/movies/related-movies'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { MovieDetail, EpisodeData } from '@/types'

interface WatchPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    ep?: string
    t?: string // timestamp for resume
  }>
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const movie = await movieApiCorrected.getMovieBySlug(slug)

    if (!movie) {
      return {
        title: 'Movie Not Found',
      }
    }

    return {
      title: `Watch ${movie.name} | CineVerse`,
      description: `Watch ${movie.name} (${movie.year}) online in high quality on CineVerse`,
      openGraph: {
        title: `Watch ${movie.name}`,
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
    }
  } catch (error) {
    return {
      title: 'Movie Not Found',
    }
  }
}

// Separate component for content that needs data fetching
async function WatchPageContent({
  slug,
  episodeSlug,
  resumeTime,
}: {
  slug: string
  episodeSlug?: string
  resumeTime: number
}) {
  const movie = await movieApiCorrected.getMovieBySlug(slug)

  if (!movie) {
    notFound()
  }

  console.log('movie >> ', movie)

  // Find the selected episode or default to first episode
  const selectedEpisode = episodeSlug
    ? movie.episodes?.flatMap((server) => server.server_data).find((ep) => ep.slug === episodeSlug)
    : movie.episodes?.[0]?.server_data?.[0]

  return (
    <>
      {/* Video Player Section */}
      <div className="relative">
        <VideoPlayer movie={movie} episode={selectedEpisode} resumeTime={resumeTime} />
      </div>

      {/* Content Section */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              <MovieInfo movie={movie} />

              {/* Episodes */}
              {movie.episodes && movie.episodes.length > 0 && (
                <EpisodeList
                  episodes={movie.episodes}
                  movieSlug={movie.slug}
                  selectedEpisode={selectedEpisode}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RelatedMovies categories={movie.category} excludeId={movie._id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Wrapper to handle async params
async function WatchPageWrapper({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ep?: string; t?: string }>
}) {
  const { slug } = await params
  const { ep: episodeSlug, t: timeParam } = await searchParams
  const resumeTime = timeParam ? parseInt(timeParam) : 0

  return <WatchPageContent slug={slug} episodeSlug={episodeSlug} resumeTime={resumeTime} />
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-black">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <WatchPageWrapper params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
