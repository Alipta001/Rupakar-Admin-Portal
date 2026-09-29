'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { PayoutSummaryCards } from '@/components/finance/payout-summary-cards'
import { VendorsReadyTable } from '@/components/finance/vendors-ready-table'
import { NonEligibleVendorsTable } from '@/components/finance/non-eligible-vendors-table'
import { PayoutTable } from '@/components/finance/payout-table'

export default function PayoutsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <PageHeader
        eyebrow="Finance / Settlements"
        title="Vendor Payouts & Settlements"
        description="Review vendor ledger payables, verify bank details, and execute manual bank transfer settlements with UTR confirmation."
      />
      <PayoutSummaryCards key={`summary-${refreshKey}`} />
      <VendorsReadyTable onPayoutSuccess={handleRefresh} key={`ready-${refreshKey}`} />
      <NonEligibleVendorsTable key={`not-ready-${refreshKey}`} />
      <PayoutTable onRefresh={handleRefresh} key={`table-${refreshKey}`} />
    </div>
  )
}
