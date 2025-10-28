'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronRight, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { CACHE_TTL, ROUTES } from '@/lib/constants'

export function CategoriesSection() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => movieApiCorrected.getCategories(),
    staleTime: CACHE_TTL.CATEGORIES,
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Thể Loại</h2>
        <LoadingSpinner className="h-32" />
      </section>
    )
  }

  if (error || !categories.length) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thể Loại</h2>
        <Button variant="outline" asChild>
          <Link href={ROUTES.CATEGORIES}>
            Xem Tất Cả
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {categories.slice(0, 12).map((category) => (
          <Card key={category._id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Link href={ROUTES.CATEGORY_DETAIL(category.slug)}>
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