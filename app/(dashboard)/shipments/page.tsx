'use client'

import React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ShipmentTable } from '@/components/shipments/shipment-table'

export default function ShipmentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commerce / Shipments"
        title="Shipments"
        description="Monitor carriers, tracking, AWBs, and delivery exceptions across all sellers."
      />
      <ShipmentTable />
    </>
  )
}
