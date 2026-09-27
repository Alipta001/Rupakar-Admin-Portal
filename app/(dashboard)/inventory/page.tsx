'use client'

import React from 'react'
import { Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { InventoryTable } from '@/components/inventory/inventory-table'

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commerce / Inventory"
        title="Inventory"
        description="Monitor vendor warehouse stock levels, reservations, and low-stock alerts."
        actions={
          <button type="button" className="button secondary">
            <Filter size={16} /> Filters
          </button>
        }
      />
      <InventoryTable />
    </>
  )
}
