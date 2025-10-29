'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { truncateText } from '@/lib/utils'
import { APP_NAME, BLUR_IMAGE, ROUTES } from '@/lib/constants'
import { Movie } from '@/types'
import { useState, useEffect } from 'react'

interface HeroSectionClientProps {
  movies: Movie[]
}

export function HeroSectionClient({ movies }: HeroSectionClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (movies.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length)
    }, 6000) // Change slide every 6 seconds

    return () => clearInterval(timer)
  }, [movies.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const currentMovie = movies[currentSlide]

  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentMovie.thumb_url || currentMovie.poster_url}
          alt={currentMovie.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL={currentMovie.blurDataURL || BLUR_IMAGE}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6 text-white">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{currentMovie.year}</Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {currentMovie.quality}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {currentMovie.lang}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold md:text-6xl">{currentMovie.name}</h1>

              {currentMovie.origin_name && currentMovie.origin_name !== currentMovie.name && (
                <p className="text-xl text-gray-300">{currentMovie.origin_name}</p>
              )}
            </div>

            <p className="text-lg leading-relaxed text-gray-200">
              {truncateText(currentMovie.content, 200)}
            </p>

            <div className="flex items-center space-x-2 text-sm text-gray-300">
              {currentMovie.category?.slice(0, 3).map((cat) => (
                <span key={cat._id} className="rounded bg-white/10 px-2 py-1">
                  {cat.name}
                </span>
              ))}
            </div>

            <div className="flex space-x-4">
              <Button size="lg" asChild>
                <Link href={ROUTES.WATCH(currentMovie.slug)}>
                  <Play className="mr-2 h-5 w-5" />
                  Xem Ngay
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href={ROUTES.MOVIE_DETAIL(currentMovie.slug)}>
                  <Info className="mr-2 h-5 w-5" />
                  Chi Tiết
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {movies.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 transform text-white hover:bg-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 transform text-white hover:bg-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform space-x-2">
            {movies.map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
