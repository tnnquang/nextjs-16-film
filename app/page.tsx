import { Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedMovies } from '@/components/home/featured-movies'
import { TrendingMovies } from '@/components/home/trending-movies'
import { NewMovies } from '@/components/home/new-movies'
import { CategoriesSection } from '@/components/home/categories-section'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  return (
    <main className="flex-1">
      <Suspense fallback={<div className="h-[600px] flex items-center justify-center"><LoadingSpinner /></div>}>
        <HeroSection />
      </Suspense>
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedMovies />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TrendingMovies />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <NewMovies />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <CategoriesSection />
        </Suspense>
      </div>
    </main>
  )
}