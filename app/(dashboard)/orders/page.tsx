'use client'

import React from 'react'
import { Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { OrderTable } from '@/components/orders/order-table'

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commerce / Orders"
        title="Orders"
        description="Monitor multi-vendor fulfillment, delivery status, and payments."
        actions={
          <button type="button" className="button secondary">
            <Filter size={16} /> Filters
          </button>
        }
      />
      <OrderTable />
    </>
  )
}
