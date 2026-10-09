'use client'

import React from 'react'
import Link from 'next/link'
import { Filter, Store, MapPin } from 'lucide-react'
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
            <Link href="/vendors/pickup-locations" className="button secondary">
              <MapPin size={16} /> Pickup Locations
            </Link>
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
