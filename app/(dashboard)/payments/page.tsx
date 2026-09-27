'use client'

import React from 'react'
import { Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PaymentTable } from '@/components/payments/payment-table'

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Finance / Payments"
        title="Payments"
        description="Track gateway transaction captures, settlements, and failed attempts."
        actions={
          <button type="button" className="button secondary">
            <Filter size={16} /> Filters
          </button>
        }
      />
      <PaymentTable />
    </>
  )
}
