import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  onPageChange?: (page: number) => void
  showFirstLast?: boolean
  siblingCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate start and end for middle pages
      const start = Math.max(2, currentPage - siblingCount)
      const end = Math.min(totalPages - 1, currentPage + siblingCount)
      
      // Add ellipsis if there's a gap after first page
      if (start > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if there's a gap before last page
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pages = generatePageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* First Page Button */}
      {showFirstLast && currentPage > 1 && onPageChange && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="hidden sm:inline-flex"
        >
          First
        </Button>
      )}

      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1 || !onPageChange}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <Button
              key={pageNumber}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange?.(pageNumber)}
              disabled={!onPageChange}
              className={cn(
                'min-w-[36px]',
                isActive && 'pointer-events-none'
              )}
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages || !onPageChange}
      >
        <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page Button */}
      {showFirstLast && currentPage < totalPages && onPageChange && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:inline-flex"
        >
          Last
        </Button>
      )}
    </div>
  )
}