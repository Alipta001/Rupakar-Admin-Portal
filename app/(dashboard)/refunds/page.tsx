'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { Refund } from '@/types/payment'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatINR } from '@/lib/utils/formatters'
import { useGetRefundsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetRefundsQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading refund records from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load refunds"
        message="Could not retrieve refund records. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const refunds: Refund[] = (data?.items || []).map((r: any) => ({
    id: r.id || r._id || '',
    orderId: r.orderId || r.order?._id || '',
    orderNumber: r.orderNumber || (r.order?.orderNumber ? `#${r.order.orderNumber}` : `#RP-${(r.id || r._id || '').slice(-6).toUpperCase()}`),
    customer: r.customerName || r.customerId?.name || 'Customer',
    amount: r.amount ?? 0,
    formattedAmount: formatINR(r.amount ?? 0),
    reason: r.reason || 'Customer requested return/refund',
    status: (r.status === 'COMPLETED' ? 'Completed' : r.status === 'REJECTED' ? 'Rejected' : 'Pending') as Refund['status'],
    gatewayReference: r.gatewayReference || r.refundId || `rfnd_${(r.id || r._id || '').slice(-8)}`,
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
  }))

  const columns: Column<Refund>[] = [
    {
      header: 'Order & Customer',
      className: 'primary-cell',
      cell: (r) => (
        <>
          <strong>{r.orderNumber}</strong>
          <span className="subtle">{r.customer}</span>
        </>
      ),
    },
    {
      header: 'Reason',
      cell: (r) => r.reason,
    },
    {
      header: 'Amount',
      cell: (r) => <strong>{formatINR(r.amount)}</strong>,
    },
    {
      header: 'Gateway Ref',
      cell: (r) => <span className="subtle">{r.gatewayReference || 'Pending gateway response'}</span>,
    },
    {
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Finance / Refunds"
        title="Refunds"
        description="Process, audit, and reconcile marketplace customer refund requests."
      />
      <DataTable<Refund>
        columns={columns}
        data={refunds}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search refunds by order, customer, or reason..."
        onSearchChange={setSearchQuery}
        searchFilter={(r, q) =>
          r.orderNumber.toLowerCase().includes(q.toLowerCase()) ||
          r.customer.toLowerCase().includes(q.toLowerCase()) ||
          r.reason.toLowerCase().includes(q.toLowerCase())
        }
      />
    </>
  )
}
