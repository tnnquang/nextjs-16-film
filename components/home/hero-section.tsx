import Image from 'next/image'
import Link from 'next/link'
import { Play, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { truncateText } from '@/lib/utils'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { getBlurDataURL } from '@/lib/image'
import { Movie } from '@/types'
import { HeroSectionClient } from './hero-section-client'

export async function HeroSection() {
  const featuredMovies = await movieApiCorrected.getFeaturedMovies(5)

  if (!featuredMovies || featuredMovies.length === 0) {
    return (
      <section className="hero-gradient relative flex min-h-[600px] items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">Chào mừng đến {APP_NAME}</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Khám phá và xem phim, chương trình truyền hình mới nhất với chất lượng cao
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href={ROUTES.MOVIES}>Xem Phim</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={ROUTES.CATEGORIES}>Thể Loại</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const moviesWithBlur = await Promise.all(
    featuredMovies.map(async (movie) => {
      const imageUrl = movie.thumb_url || movie.poster_url
      const blurDataURL = await getBlurDataURL(imageUrl)
      return { ...movie, blurDataURL }
    })
  )

  return <HeroSectionClient movies={moviesWithBlur} />
}

