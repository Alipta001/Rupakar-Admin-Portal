'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Payout } from '@/types/finance'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatINR } from '@/lib/utils/formatters'
import { useGetPayoutsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function PayoutTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetPayoutsQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading artisan settlement payouts from backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load payouts"
        message="Could not retrieve settlement records from finance service."
        onRetry={refetch}
      />
    )
  }

  const rawList = Array.isArray(data?.items)
    ? data.items
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
    ? data
    : []

  const payouts: Payout[] = rawList.map((p: any) => {
    let uiStatus: Payout['status'] = 'Ready to process'
    if (p.status === 'COMPLETED' || p.status === 'Completed') uiStatus = 'Completed'
    else if (p.status === 'PROCESSING' || p.status === 'Processing') uiStatus = 'Processing'
    else if (p.status === 'FAILED' || p.status === 'Failed') uiStatus = 'Failed'

    return {
      id: p.id || p._id || '',
      payoutNumber: p.payoutNumber || `PO-${(p.id || p._id || '').slice(-6).toUpperCase()}`,
      vendorName: p.vendorName || p.vendorId?.name || 'Artisan Partner',
      grossAmount: p.grossAmount ?? p.amount ?? 0,
      commissionAmount: p.commissionAmount ?? 0,
      netPayable: p.netPayable ?? p.amount ?? 0,
      formattedNetPayable: formatINR(p.netPayable ?? p.amount ?? 0),
      status: uiStatus,
      bankAccountLast4: p.bankAccountLast4 || (p.bankAccount?.accountNumber ? String(p.bankAccount.accountNumber).slice(-4) : '****'),
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
    }
  })

  const columns: Column<Payout>[] = [
    {
      header: 'Payout Ref',
      className: 'primary-cell',
      cell: (p) => (
        <>
          <strong>{p.payoutNumber}</strong>
          <span className="subtle">Bank ending in {p.bankAccountLast4}</span>
        </>
      ),
    },
    {
      header: 'Vendor',
      cell: (p) => p.vendorName,
    },
    {
      header: 'Gross Sales',
      cell: (p) => formatINR(p.grossAmount),
    },
    {
      header: 'Commission Deducted',
      cell: (p) => <span className="subtle">{formatINR(p.commissionAmount)}</span>,
    },
    {
      header: 'Net Payable',
      cell: (p) => <strong>{formatINR(p.netPayable)}</strong>,
    },
    {
      header: 'Status',
      cell: (p) => <StatusBadge status={p.status} />,
    },
  ]

  return (
    <DataTable<Payout>
      columns={columns}
      data={payouts}
      keyExtractor={(p) => p.id}
      searchPlaceholder="Search payouts by vendor or reference..."
      onSearchChange={setSearchQuery}
      searchFilter={(p, query) =>
        p.payoutNumber.toLowerCase().includes(query.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(query.toLowerCase())
      }
    />
  )
}
