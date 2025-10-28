/**
 * Migration Helper for transitioning from old API to new API
 * 
 * This helper provides utilities to convert between old page-based pagination
 * and new cursor-based pagination
 */

import { PaginatedResponse, CursorPagination } from '@/types'

/**
 * Convert cursor-based response to legacy page-based format
 * Useful for components that haven't been migrated yet
 */
export function toLegacyPagination<T>(
  cursorResponse: PaginatedResponse<T>,
  currentPage: number = 1,
  itemsPerPage: number = 20
) {
  return {
    items: cursorResponse.data,
    pagination: {
      currentPage,
      totalPages: cursorResponse.totalPages,
      totalItems: cursorResponse.totalItems,
      itemsPerPage
    }
  }
}

/**
 * Store cursor information for pagination state management
 */
export interface PaginationState {
  currentPage: number
  cursors: Map<number, CursorPagination>
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Create a pagination state manager for cursor-based pagination
 */
export class CursorPaginationManager {
  private cursors: Map<number, CursorPagination> = new Map()
  private currentPage: number = 1
  
  constructor() {
    // Initialize with page 1
    this.cursors.set(1, { view: undefined, createdAt: undefined, id: undefined })
  }

  /**
   * Update state with new response
   */
  updateFromResponse(response: PaginatedResponse<any>, pageNumber: number) {
    this.currentPage = pageNumber
    
    // Store next cursor for next page
    if (response.nextCursor) {
      this.cursors.set(pageNumber + 1, response.nextCursor)
    }
    
    // Store prev cursor for previous page
    if (response.prevCursor) {
      this.cursors.set(pageNumber - 1, response.prevCursor)
    }
  }

  /**
   * Get cursor for a specific page
   */
  getCursor(pageNumber: number): CursorPagination | undefined {
    return this.cursors.get(pageNumber)
  }

  /**
   * Get next page parameters
   */
  getNextPageParams(): { 
    lastView?: number
    lastCreatedAt?: string
    lastId?: string
  } | null {
    const cursor = this.cursors.get(this.currentPage + 1)
    if (!cursor) return null
    
    return {
      lastView: cursor.view,
      lastCreatedAt: cursor.createdAt,
      lastId: cursor.id
    }
  }

  /**
   * Get previous page parameters
   */
  getPrevPageParams(): {
    firstView?: number
    firstCreatedAt?: string
    firstId?: string
  } | null {
    const cursor = this.cursors.get(this.currentPage - 1)
    if (!cursor) return null
    
    return {
      firstView: cursor.view,
      firstCreatedAt: cursor.createdAt,
      firstId: cursor.id
    }
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.cursors.clear()
    this.currentPage = 1
    this.cursors.set(1, { view: undefined, createdAt: undefined, id: undefined })
  }

  /**
   * Get current page number
   */
  getCurrentPage(): number {
    return this.currentPage
  }
}

/**
 * Helper hook for React components using cursor pagination
 * Usage example:
 * 
 * ```tsx
 * const paginationManager = useMemo(() => new CursorPaginationManager(), [])
 * const [page, setPage] = useState(1)
 * 
 * const { data, isLoading } = useQuery({
 *   queryKey: ['movies', 'hot', page],
 *   queryFn: async () => {
 *     const params = page === 1 
 *       ? {} 
 *       : (paginationManager.getNextPageParams() || {})
 *     
 *     const response = await movieApi.getHotFilms(20, params)
 *     paginationManager.updateFromResponse(response, page)
 *     return response
 *   }
 * })
 * 
 * const handleNext = () => {
 *   if (data?.hasNextPage) setPage(p => p + 1)
 * }
 * ```
 */
export function createPaginationHelper() {
  return new CursorPaginationManager()
}

/**
 * Convert old search filters to new filter format
 */
export function convertFiltersToNewFormat(oldFilters: {
  page?: number
  limit?: number
  category?: string[]
  country?: string[]
  year?: string
  type?: string
  quality?: string
  sortBy?: string
  sortOrder?: string
}) {
  return {
    limit: oldFilters.limit || 20,
    categories: oldFilters.category,
    countries: oldFilters.country,
    types: oldFilters.type ? [oldFilters.type] : undefined,
    // Note: Cursor-based pagination doesn't use page numbers
    // Callers should use cursors from previous responses
  }
}

/**
 * Helper to extract slug from various URL formats
 */
export function extractSlugFromUrl(url: string): string {
  // Remove leading/trailing slashes
  const cleaned = url.replace(/^\/+|\/+$/g, '')
  
  // If it's already a slug, return it
  if (!cleaned.includes('/')) {
    return cleaned
  }
  
  // Extract from paths like /movies/[slug] or /watch/[slug]
  const parts = cleaned.split('/')
  return parts[parts.length - 1]
}

/**
 * Helper to build cursor params from response
 */
export function buildCursorParams(
  cursor: CursorPagination | null,
  direction: 'next' | 'prev'
): Record<string, any> {
  if (!cursor) return {}
  
  if (direction === 'next') {
    return {
      lastView: cursor.view,
      lastCreatedAt: cursor.createdAt,
      lastId: cursor.id
    }
  } else {
    return {
      firstView: cursor.view,
      firstCreatedAt: cursor.createdAt,
      firstId: cursor.id
    }
  }
}

/**
 * Type guard to check if response is cursor-based
 */
export function isCursorPaginated<T>(
  response: any
): response is PaginatedResponse<T> {
  return (
    response &&
    Array.isArray(response.data) &&
    'nextCursor' in response &&
    'prevCursor' in response &&
    'hasNextPage' in response &&
    'hasPrevPage' in response
  )
}

/**
 * Type guard to check if response is legacy page-based
 */
export function isLegacyPaginated<T>(
  response: any
): response is { items: T[]; pagination: any } {
  return (
    response &&
    Array.isArray(response.items) &&
    'pagination' in response &&
    typeof response.pagination === 'object'
  )
}
