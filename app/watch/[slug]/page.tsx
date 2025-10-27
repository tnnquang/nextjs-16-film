import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { VideoPlayer } from '@/components/video/video-player'
import { MovieInfo } from '@/components/movies/movie-info'
import { EpisodeList } from '@/components/video/episode-list'
import { RelatedMovies } from '@/components/movies/related-movies'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { movieApi } from '@/lib/api/movies'

interface WatchPageProps {
  params: {
    slug: string
  }
  searchParams: {
    ep?: string
    t?: string // timestamp for resume
  }
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  try {
    const response = await movieApi.getMovieBySlug(params.slug)
    const movie = response.data
    
    if (!movie) {
      return {
        title: 'Movie Not Found'
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
      title: 'Movie Not Found'
    }
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  try {
    const response = await movieApi.getMovieBySlug(params.slug)
    
    if (!response.data) {
      notFound()
    }

    const movie = response.data
    const episodeSlug = searchParams.ep
    const resumeTime = searchParams.t ? parseInt(searchParams.t) : 0

    // Find the selected episode or default to first episode
    const selectedEpisode = episodeSlug 
      ? movie.episodes?.flatMap(server => server.server_data)
          .find(ep => ep.slug === episodeSlug)
      : movie.episodes?.[0]?.server_data?.[0]

    return (
      <div className="min-h-screen bg-black">
        {/* Video Player Section */}
        <div className="relative">
          <Suspense fallback={
            <div className="aspect-video bg-black flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <VideoPlayer 
              movie={movie}
              episode={selectedEpisode}
              resumeTime={resumeTime}
            />
          </Suspense>
        </div>

        {/* Content Section */}
        <div className="bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <MovieInfo movie={movie} />
                </Suspense>

                {/* Episodes */}
                {movie.episodes && movie.episodes.length > 0 && (
                  <Suspense fallback={<LoadingSpinner />}>
                    <EpisodeList 
                      episodes={movie.episodes}
                      movieSlug={movie.slug}
                      selectedEpisode={selectedEpisode}
                    />
                  </Suspense>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <RelatedMovies 
                    categories={movie.category} 
                    excludeId={movie._id}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}