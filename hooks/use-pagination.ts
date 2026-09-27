'use client'

import { useMemo, useState } from 'react'

export interface UsePaginationOptions {
  totalItems: number
  initialPage?: number
  pageSize?: number
}

export function usePagination({
  totalItems,
  initialPage = 1,
  pageSize = 10,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize))
  }, [totalItems, pageSize])

  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const nextPage = () => goToPage(safePage + 1)
  const prevPage = () => goToPage(safePage - 1)

  return {
    currentPage: safePage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    canNextPage: safePage < totalPages,
    canPrevPage: safePage > 1,
  }
}
