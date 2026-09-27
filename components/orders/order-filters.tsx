'use client'

import React from 'react'

export interface OrderFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function OrderFilters({ statusFilter, onStatusChange }: OrderFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        className="select-button"
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        style={{ appearance: 'none', paddingRight: '24px', cursor: 'pointer' }}
      >
        <option value="ALL">All statuses</option>
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  )
}
