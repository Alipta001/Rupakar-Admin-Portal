'use client'

import React from 'react'
import { Filter, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ProductTable } from '@/components/products/product-table'

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commerce / Products"
        title="Products"
        description="Moderate, approve, and manage artisan catalog submissions."
        actions={
          <>
            <button type="button" className="button secondary">
              <Filter size={16} /> Filters
            </button>
            <button type="button" className="button primary">
              <Plus size={16} /> Add product
            </button>
          </>
        }
      />
      <ProductTable />
    </>
  )
}
