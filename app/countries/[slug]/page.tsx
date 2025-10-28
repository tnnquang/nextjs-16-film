import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { APP_NAME, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { MovieGrid } from '@/components/movies/movie-grid'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CountryPagination } from '@/components/countries/country-pagination'

interface CountryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { slug } = await params
  const countries = await movieApiCorrected.getCountries()
  const country = countries.find((c) => c.slug === slug || c._id === slug)

  if (!country) {
    return {
      title: 'Không tìm thấy',
    }
  }

  return {
    title: `Phim ${country.name} - ${APP_NAME}`,
    description: `Xem phim ${country.name} mới nhất, chất lượng cao`,
  }
}

// Separate component for content that needs data fetching
async function CountryPageContent({ slug, page }: { slug: string; page: number }) {
  const countries = await movieApiCorrected.getCountries()
  const country = countries.find((c) => c.slug === slug || c._id === slug)

  if (!country) {
    notFound()
  }

  // Get movies for this country
  const response = await movieApiCorrected.getFilmsByCountry(slug, {
    limit: DEFAULT_PAGE_SIZE,
  })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-4">
        {country.flagLogo && (
          <img
            src={country.flagLogo}
            alt={country.name}
            className="w-18 h-12 rounded object-cover shadow-md"
          />
        )}
        <div>
          <h1 className="mb-1 text-3xl font-bold">Phim {country.name}</h1>
          <p className="text-muted-foreground">{response.totalItems} phim</p>
        </div>
      </div>

      <MovieGrid movies={response.data} />

      {response.totalPages > 1 && (
        <div className="mt-8">
          <CountryPagination currentPage={page} totalPages={response.totalPages} />
        </div>
      )}
    </div>
  )
}

// Wrapper to handle async params
async function CountryPageWrapper({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)

  return <CountryPageContent slug={slug} page={page} />
}

export default function CountryPage({ params, searchParams }: CountryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <LoadingSpinner className="h-96" />
        </div>
      }
    >
      <CountryPageWrapper params={params} searchParams={searchParams} />
    </Suspense>
  )
}
