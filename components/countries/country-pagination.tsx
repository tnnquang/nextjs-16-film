'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/ui/pagination'

interface CountryPaginationProps {
  currentPage: number
  totalPages: number
}

export function CountryPagination({ currentPage, totalPages }: CountryPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
  )
}
