'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { movieApi } from '@/lib/api/movies'
import { getImageUrl, truncateText } from '@/lib/utils'
import { CACHE_KEYS, CACHE_TIME } from '@/lib/constants'

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const { data: featuredResponse, isLoading } = useQuery({
    queryKey: [CACHE_KEYS.MOVIES, 'featured'],
    queryFn: () => movieApi.getFeaturedMovies(),
    staleTime: CACHE_TIME.MEDIUM,
  })

  const featuredMovies = featuredResponse?.data?.items?.slice(0, 5) || []

  useEffect(() => {
    if (featuredMovies.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length)
    }, 6000) // Change slide every 6 seconds

    return () => clearInterval(timer)
  }, [featuredMovies.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)
  }

  if (isLoading) {
    return (
      <section className="relative h-[600px] bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-64 bg-muted rounded mx-auto"></div>
            <div className="h-6 w-96 bg-muted rounded mx-auto"></div>
            <div className="flex space-x-4 justify-center">
              <div className="h-12 w-32 bg-muted rounded"></div>
              <div className="h-12 w-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredMovies.length === 0) {
    return (
      <section className="relative h-[600px] hero-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">Welcome to CineVerse</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and stream the latest movies and TV shows in high quality
          </p>
          <div className="flex space-x-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/movies">Browse Movies</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">Explore Categories</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const currentMovie = featuredMovies[currentSlide]

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(currentMovie.poster_url, 'original')}
          alt={currentMovie.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6 text-white">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{currentMovie.year}</Badge>
                <Badge variant="outline" className="text-white border-white/20">
                  {currentMovie.quality}
                </Badge>
                <Badge variant="outline" className="text-white border-white/20">
                  {currentMovie.lang}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold">
                {currentMovie.name}
              </h1>
              
              {currentMovie.origin_name && currentMovie.origin_name !== currentMovie.name && (
                <p className="text-xl text-gray-300">{currentMovie.origin_name}</p>
              )}
            </div>

            <p className="text-lg text-gray-200 leading-relaxed">
              {truncateText(currentMovie.content, 200)}
            </p>

            <div className="flex items-center space-x-2 text-sm text-gray-300">
              {currentMovie.category?.slice(0, 3).map((cat) => (
                <span key={cat.id} className="px-2 py-1 bg-white/10 rounded">
                  {cat.name}
                </span>
              ))}
            </div>

            <div className="flex space-x-4">
              <Button size="lg" asChild>
                <Link href={`/watch/${currentMovie.slug}`}>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link href={`/movies/${currentMovie.slug}`}>
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {featuredMovies.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
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