'use client'

import React from 'react'
import { Filter, Store } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { VendorTable } from '@/components/vendors/vendor-table'

export default function VendorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Marketplace / Vendors"
        title="Vendors"
        description="Oversee artisan onboarding, verification, and gross merchandise value."
        actions={
          <>
            <button type="button" className="button secondary">
              <Filter size={16} /> Filters
            </button>
            <button type="button" className="button primary">
              <Store size={16} /> Onboard vendor
            </button>
          </>
        }
      />
      <VendorTable />
    </>
  )
}
