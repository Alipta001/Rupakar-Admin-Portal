'use client'

import React from 'react'

export interface ProductFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function ProductFilters({ statusFilter, onStatusChange }: ProductFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        className="select-button"
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        style={{ appearance: 'none', paddingRight: '24px', cursor: 'pointer' }}
      >
        <option value="ALL">All statuses</option>
        <option value="Published">Published</option>
        <option value="Approved">Approved</option>
        <option value="Under review">Under review</option>
        <option value="Unpublished">Unpublished</option>
        <option value="Processing">Processing</option>
        <option value="Rejected">Rejected</option>
        <option value="Archived">Archived</option>
      </select>
    </div>
  )
}
