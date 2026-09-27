'use client'

import React from 'react'

export interface VendorFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function VendorFilters({ statusFilter, onStatusChange }: VendorFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        className="select-button"
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        style={{ appearance: 'none', paddingRight: '24px', cursor: 'pointer' }}
      >
        <option value="ALL">All statuses</option>
        <option value="Approved">Approved</option>
        <option value="Under review">Under review</option>
        <option value="Suspended">Suspended</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
  )
}
