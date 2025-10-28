import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { APP_NAME, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { MovieGrid } from '@/components/movies/movie-grid'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CategoryPagination } from '@/components/categories/category-pagination'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await movieApiCorrected.getCategories()
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return {
      title: 'Không tìm thấy',
    }
  }

  return {
    title: `${category.name} - ${APP_NAME}`,
    description: `Xem phim ${category.name} mới nhất, chất lượng cao`,
  }
}

// Separate component for content that needs data fetching
async function CategoryPageContent({ slug, page }: { slug: string; page: number }) {
  const categories = await movieApiCorrected.getCategories()
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  // Get movies for this category
  const response = await movieApiCorrected.getFilmsByCategory(slug, {
    limit: DEFAULT_PAGE_SIZE,
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground">{response.totalItems} phim</p>
      </div>

      <MovieGrid movies={response.data} />

      {response.totalPages > 1 && (
        <div className="mt-8">
          <CategoryPagination currentPage={page} totalPages={response.totalPages} />
        </div>
      )}
    </div>
  )
}

// Wrapper to handle async params
async function CategoryPageWrapper({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)

  return <CategoryPageContent slug={slug} page={page} />
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <LoadingSpinner className="h-96" />
        </div>
      }
    >
      <CategoryPageWrapper params={params} searchParams={searchParams} />
    </Suspense>
  )
}
