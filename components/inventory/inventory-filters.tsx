'use client'

import React from 'react'

export interface InventoryFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function InventoryFilters({ statusFilter, onStatusChange }: InventoryFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        className="select-button"
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        style={{ appearance: 'none', paddingRight: '24px', cursor: 'pointer' }}
      >
        <option value="ALL">All stock levels</option>
        <option value="In Stock">In Stock</option>
        <option value="Low Stock">Low Stock</option>
        <option value="Out of Stock">Out of Stock</option>
      </select>
    </div>
  )
}
