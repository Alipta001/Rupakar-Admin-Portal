'use client'

import React from 'react'
import { Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PayoutTable } from '@/components/finance/payout-table'

export default function PayoutsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Finance / Payouts"
        title="Payouts"
        description="Review vendor bank settlements, payable balances, and disbursement status."
        actions={
          <button type="button" className="button secondary">
            <Filter size={16} /> Filters
          </button>
        }
      />
      <PayoutTable />
    </>
  )
}
