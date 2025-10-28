'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MovieListClient } from '@/components/movies/movie-list-client'
import { MOVIE_TYPES, MOVIE_TYPE_LABELS } from '@/lib/constants'

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState<string>(MOVIE_TYPES.SINGLE)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh Sách Phim</h1>
        <p className="text-muted-foreground">
          Khám phá hàng ngàn bộ phim chất lượng cao
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value={MOVIE_TYPES.SINGLE}>
            {MOVIE_TYPE_LABELS[MOVIE_TYPES.SINGLE]}
          </TabsTrigger>
          <TabsTrigger value={MOVIE_TYPES.SERIES}>
            {MOVIE_TYPE_LABELS[MOVIE_TYPES.SERIES]}
          </TabsTrigger>
          <TabsTrigger value={MOVIE_TYPES.ANIME}>
            {MOVIE_TYPE_LABELS[MOVIE_TYPES.ANIME]}
          </TabsTrigger>
          <TabsTrigger value={MOVIE_TYPES.TV_SHOWS}>
            {MOVIE_TYPE_LABELS[MOVIE_TYPES.TV_SHOWS]}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={MOVIE_TYPES.SINGLE}>
          <MovieListClient type={MOVIE_TYPES.SINGLE} />
        </TabsContent>

        <TabsContent value={MOVIE_TYPES.SERIES}>
          <MovieListClient type={MOVIE_TYPES.SERIES} />
        </TabsContent>

        <TabsContent value={MOVIE_TYPES.ANIME}>
          <MovieListClient type={MOVIE_TYPES.ANIME} />
        </TabsContent>

        <TabsContent value={MOVIE_TYPES.TV_SHOWS}>
          <MovieListClient type={MOVIE_TYPES.TV_SHOWS} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
