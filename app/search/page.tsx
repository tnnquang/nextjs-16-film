import { Suspense } from 'react'
import { Metadata } from 'next'
import { SearchResults } from '@/components/search/search-results'
import { SearchFilters } from '@/components/search/search-filters'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    country?: string
    year?: string
    type?: string
    quality?: string
    page?: string
  }>
}

export const metadata: Metadata = {
  title: 'Search Movies | CineVerse',
  description: 'Search for your favorite movies and TV shows on CineVerse',
}

// Wrapper to handle async searchParams
async function SearchPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    country?: string
    year?: string
    type?: string
    quality?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const filters = {
    category: params.category?.split(',') || [],
    country: params.country?.split(',') || [],
    year: params.year || '',
    type: params.type || '',
    quality: params.quality || '',
    page: parseInt(params.page || '1'),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {query ? `Search results for "${query}"` : 'Search Movies'}
          </h1>
          {query && (
            <p className="text-muted-foreground mt-2">
              Find movies and TV shows matching your search
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <SearchFilters currentFilters={filters} query={query} />
            </Suspense>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner className="h-96" />}>
              <SearchResults query={query} filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-8">
              <LoadingSpinner className="h-96" />
            </div>
          }
        >
          <SearchPageWrapper searchParams={searchParams} />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
