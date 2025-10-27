import { Suspense } from 'react'
import { Metadata } from 'next'
import { SearchResults } from '@/components/search/search-results'
import { SearchFilters } from '@/components/search/search-filters'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SearchPageProps {
  searchParams: {
    q?: string
    category?: string
    country?: string
    year?: string
    type?: string
    quality?: string
    page?: string
  }
}

export const metadata: Metadata = {
  title: 'Search Movies | CineVerse',
  description: 'Search for your favorite movies and TV shows on CineVerse',
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  const filters = {
    category: searchParams.category?.split(',') || [],
    country: searchParams.country?.split(',') || [],
    year: searchParams.year || '',
    type: searchParams.type || '',
    quality: searchParams.quality || '',
    page: parseInt(searchParams.page || '1'),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
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

            <div className="grid lg:grid-cols-4 gap-8">
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
      </main>
      
      <Footer />
    </div>
  )
}