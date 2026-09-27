'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Payment } from '@/types/payment'
import { PaymentStatusBadge } from './payment-status-badge'
import { formatINR } from '@/lib/utils/formatters'
import { useGetPaymentsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function PaymentTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetPaymentsQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading payment transactions from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load payments"
        message="Could not retrieve transactions from payment gateway records."
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

  const payments: Payment[] = rawList.map((p: any) => ({
    id: p.id || p._id || '',
    orderId: p.orderId || p.order?._id || '',
    orderNumber: p.orderNumber || (p.order?.orderNumber ? `#${p.order.orderNumber}` : `#RP-${(p.id || p._id || '').slice(-6).toUpperCase()}`),
    customer: p.customerName || p.customerId?.name || 'Customer',
    amount: p.amount ?? 0,
    formattedAmount: formatINR(p.amount ?? 0),
    gateway: (p.method === 'COD' || p.gateway === 'Cash on Delivery' ? 'Cash on Delivery' : 'Razorpay') as Payment['gateway'],
    gatewayTransactionId: p.transactionId || p.paymentId || p.razorpayPaymentId || `pay_${(p.id || p._id || '').slice(-8)}`,
    status: (p.status === 'CAPTURED' || p.status === 'SUCCESS' || p.status === 'PAID' ? 'Captured' : p.status === 'FAILED' ? 'Failed' : 'Pending') as Payment['status'],
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
  }))

  const columns: Column<Payment>[] = [
    {
      header: 'Transaction ID',
      className: 'primary-cell',
      cell: (payment) => (
        <>
          <strong>{payment.gatewayTransactionId || payment.id}</strong>
          <span className="subtle">{payment.orderNumber}</span>
        </>
      ),
    },
    {
      header: 'Customer',
      cell: (payment) => payment.customer,
    },
    {
      header: 'Gateway',
      cell: (payment) => payment.gateway,
    },
    {
      header: 'Amount',
      cell: (payment) => <strong>{formatINR(payment.amount)}</strong>,
    },
    {
      header: 'Status',
      cell: (payment) => <PaymentStatusBadge status={payment.status} />,
    },
    {
      header: 'Date',
      cell: (payment) => <span className="subtle">{payment.date}</span>,
    },
  ]

  return (
    <DataTable<Payment>
      columns={columns}
      data={payments}
      keyExtractor={(payment) => payment.id}
      searchPlaceholder="Search payments by order or transaction ID..."
      onSearchChange={setSearchQuery}
      searchFilter={(payment, query) =>
        payment.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        payment.customer.toLowerCase().includes(query.toLowerCase()) ||
        (payment.gatewayTransactionId || '').toLowerCase().includes(query.toLowerCase())
      }
    />
  )
}
