'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T, index: number) => React.ReactNode
  className?: string
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  searchPlaceholder?: string
  searchable?: boolean
  searchFilter?: (item: T, query: string) => boolean
  filterControls?: React.ReactNode
  pageSize?: number
  emptyMessage?: string
  onSearchChange?: (query: string) => void
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = 'Search...',
  searchable = true,
  searchFilter,
  filterControls,
  pageSize = 10,
  emptyMessage = 'No records found',
  onSearchChange,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const safeData = Array.isArray(data) ? data : []

  const filtered = React.useMemo(() => {
    if (!query.trim()) return safeData
    if (searchFilter) return safeData.filter(item => searchFilter(item, query))
    return safeData.filter(item =>
      Object.values(item as Record<string, unknown>).some(val =>
        String(val).toLowerCase().includes(query.toLowerCase())
      )
    )
  }, [safeData, query, searchFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize)

  return (
    <section className="panel listing-panel">
      {(searchable || filterControls) && (
        <div className="listing-toolbar">
          {searchable && (
            <div className="search-box">
              <Search size={16} />
              <input
                placeholder={searchPlaceholder}
                value={query}
                onChange={e => {
                  const val = e.target.value
                  setQuery(val)
                  setPage(1)
                  onSearchChange?.(val)
                }}
              />
              {query && (
                <button type="button" onClick={() => {
                  setQuery('')
                  onSearchChange?.('')
                }}>
                  <X size={15} />
                </button>
              )}
            </div>
          )}
          {filterControls}
          <span className="toolbar-count">
            {filtered.length} of {safeData.length} results
          </span>
        </div>
      )}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px 10px', color: '#9d958b' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr key={keyExtractor(item, rowIndex)}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={col.className}>
                      {col.cell
                        ? col.cell(item, rowIndex)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="pagination">
          <span>
            Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
          </span>
          <div>
            <button
              type="button"
              className="page-button"
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              if (totalPages > 6 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                return null
              }
              return (
                <button
                  key={p}
                  type="button"
                  className={`page-button ${p === currentPage ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            })}
            <button
              type="button"
              className="page-button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
