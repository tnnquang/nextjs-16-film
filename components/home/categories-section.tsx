'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronRight, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { movieApi } from '@/lib/api/movies'
import { CACHE_KEYS, CACHE_TIME } from '@/lib/constants'

export function CategoriesSection() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.CATEGORIES],
    queryFn: () => movieApi.getCategories(),
    staleTime: CACHE_TIME.VERY_LONG,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Browse by Category</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !response?.data) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Browse by Category</h2>
        <div className="text-center py-12 text-muted-foreground">
          Failed to load categories. Please try again later.
        </div>
      </section>
    )
  }

  const categories = response.data.slice(0, 12)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Browse by Category</h2>
        <Button variant="outline" asChild>
          <Link href="/categories">
            View All Categories
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Link href={`/categories/${category.slug}`}>
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Film className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}