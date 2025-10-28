'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { CursorPaginationManager } from '@/lib/api/migration-helper'
import { MovieGrid } from './movie-grid'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

interface MovieListClientProps {
  type: string
}

export function MovieListClient({ type }: MovieListClientProps) {
  const [page, setPage] = useState(1)
  const paginationManager = useMemo(() => new CursorPaginationManager(), [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', type, page],
    queryFn: async () => {
      const params = page === 1 
        ? {} 
        : (paginationManager.getNextPageParams() || {})
      
      const response = await movieApiCorrected.getFilmsByType(type, { 
        ...params, 
        limit: DEFAULT_PAGE_SIZE 
      })
      
      paginationManager.updateFromResponse(response, page)
      return response
    },
    placeholderData: (previousData) => previousData,
  })

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Không thể tải danh sách phim</p>
      </div>
    )
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!data?.data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có phim nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <MovieGrid movies={data.data} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Trang {page} / {data.totalPages} - Tổng {data.totalItems} phim
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => p - 1)}
            disabled={!data.hasPrevPage || page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={!data.hasNextPage}
          >
            Sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
