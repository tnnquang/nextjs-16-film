import { Metadata } from 'next'
import Link from 'next/link'
import { Film } from 'lucide-react'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: `Thể Loại - ${APP_NAME}`,
  description: 'Khám phá các thể loại phim đa dạng',
}

export default async function CategoriesPage() {
  const categories = await movieApiCorrected.getCategories()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thể Loại Phim</h1>
        <p className="text-muted-foreground">
          Khám phá {categories.length} thể loại phim đa dạng
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={ROUTES.CATEGORY_DETAIL(category.slug)}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
