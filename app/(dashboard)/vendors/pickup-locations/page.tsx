'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PickupLocationsTable } from '@/components/vendors/pickup-locations-table'

export default function PickupLocationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Marketplace / Vendors"
        title="Seller Pickup Locations"
        description="Review, approve, deactivate, and archive seller warehouse/workshop pickup locations for Shiprocket logistics."
        actions={
          <Link href="/vendors" className="button secondary">
            <ArrowLeft size={16} /> Back to Vendors
          </Link>
        }
      />
      <PickupLocationsTable />
    </>
  )
}
