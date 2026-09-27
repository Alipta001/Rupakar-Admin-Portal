'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Commission } from '@/types/finance'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatINR } from '@/lib/utils/formatters'
import { useGetCommissionsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function CommissionTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetCommissionsQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading commission ledgers from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load commissions"
        message="Could not retrieve commission calculations. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const commissions: Commission[] = (data?.items || []).map((com: any) => ({
    id: com.id || com._id || '',
    orderNumber: com.orderNumber || (com.orderId ? `#RP-${String(com.orderId).slice(-6).toUpperCase()}` : '#RP-ORD'),
    vendorName: com.vendorName || com.vendorId?.name || 'Artisan Partner',
    productTitle: com.productTitle || 'Marketplace Item',
    rate: com.rate ?? 12,
    amount: com.amount ?? 0,
    formattedAmount: formatINR(com.amount ?? 0),
    ruleSource: (com.ruleSource || 'Category') as Commission['ruleSource'],
    status: (com.status === 'COLLECTED' ? 'Collected' : com.status === 'REVERSED' ? 'Reversed' : 'Pending') as Commission['status'],
    date: com.createdAt ? new Date(com.createdAt).toLocaleDateString() : 'Recent',
  }))

  const columns: Column<Commission>[] = [
    {
      header: 'Order & Product',
      className: 'primary-cell',
      cell: (com) => (
        <>
          <strong>{com.orderNumber}</strong>
          <span className="subtle">{com.productTitle}</span>
        </>
      ),
    },
    {
      header: 'Vendor',
      cell: (com) => com.vendorName,
    },
    {
      header: 'Rate & Source',
      cell: (com) => (
        <>
          <span>{com.rate}%</span>
          <span className="subtle">{com.ruleSource} rule</span>
        </>
      ),
    },
    {
      header: 'Commission Amount',
      cell: (com) => <strong>{formatINR(com.amount)}</strong>,
    },
    {
      header: 'Status',
      cell: (com) => <StatusBadge status={com.status} />,
    },
  ]

  return (
    <DataTable<Commission>
      columns={columns}
      data={commissions}
      keyExtractor={(com) => com.id}
      searchPlaceholder="Search commissions by order or vendor..."
      onSearchChange={setSearchQuery}
      searchFilter={(com, query) =>
        com.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        com.vendorName.toLowerCase().includes(query.toLowerCase()) ||
        com.productTitle.toLowerCase().includes(query.toLowerCase())
      }
    />
  )
}
