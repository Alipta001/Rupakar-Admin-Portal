'use client'

import React from 'react'
import { Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { CommissionTable } from '@/components/finance/commission-table'

export default function CommissionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Finance / Commissions"
        title="Commissions"
        description="Audit marketplace commission splits calculated via Product, Vendor, Category, or Global rules."
        actions={
          <button type="button" className="button secondary">
            <Filter size={16} /> Filters
          </button>
        }
      />
      <CommissionTable />
    </>
  )
}
