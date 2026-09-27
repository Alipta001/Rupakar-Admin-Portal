'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface UserFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function UserFilters({ statusFilter, onStatusChange }: UserFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        className="select-button"
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        style={{ appearance: 'none', paddingRight: '24px', cursor: 'pointer' }}
      >
        <option value="ALL">All statuses</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
        <option value="Pending">Pending</option>
      </select>
    </div>
  )
}
