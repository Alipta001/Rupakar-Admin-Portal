'use client'

import React, { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Order } from '@/types/order'
import { OrderStatusBadge } from './order-status-badge'
import { OrderFilters } from './order-filters'
import { OrderDetailModal } from './order-detail'
import { formatINR } from '@/lib/utils/formatters'
import { useGetOrdersQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function OrderTable() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error, refetch } = useGetOrdersQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading orders from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load orders"
        message="Could not retrieve marketplace orders. Please verify backend connection."
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

  const orders: Order[] = rawList.map((o: any) => {

    let uiStatus: Order['status'] = 'Processing'
    const s = String(o.status || '').toUpperCase()
    if (s === 'PENDING') uiStatus = 'Pending'
    else if (s === 'CONFIRMED') uiStatus = 'Confirmed'
    else if (s === 'PROCESSING') uiStatus = 'Processing'
    else if (s === 'SHIPPED') uiStatus = 'Shipped'
    else if (s === 'DELIVERED') uiStatus = 'Delivered'
    else if (s === 'CANCELLED') uiStatus = 'Cancelled'
    else if (s === 'REFUNDED') uiStatus = 'Refunded'

    const firstItem = o.items?.[0]
    const itemSummary = firstItem
      ? `${firstItem.productName || firstItem.title || 'Artisan item'}${o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}`
      : 'Order item'

    const vendorName =
      firstItem?.vendorName ||
      firstItem?.productSnapshot?.vendorName ||
      o.vendorName ||
      'Artisan Guild'

    const customerName =
      o.customerName ||
      o.customerId?.name ||
      o.shippingAddressSnapshot?.name ||
      'Customer'

    const customerEmail =
      o.customerEmail ||
      o.customerId?.email ||
      o.shippingAddressSnapshot?.email ||
      ''

    return {
      id: o.id || o._id || '',
      orderNumber: o.orderNumber ? `#${o.orderNumber}` : `#RP-${(o.id || o._id || '').slice(-6).toUpperCase()}`,
      customer: customerName,
      customerEmail,
      customerPhone: o.customerPhone || o.shippingAddressSnapshot?.phone,
      itemSummary,
      vendor: vendorName,
      amount: o.total ?? 0,
      formattedAmount: formatINR(o.total ?? 0),
      status: uiStatus,
      paymentStatus: (o.paymentStatus === 'PAID' ? 'Paid' : o.paymentStatus === 'FAILED' ? 'Failed' : 'Pending') as Order['paymentStatus'],
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
      shippingAddress: o.shippingAddressSnapshot?.address1,
      itemsCount: o.items?.length || 1,
    }
  })

  const columns: Column<Order>[] = [
    {
      header: 'Order',
      className: 'primary-cell',
      cell: (order) => (
        <div style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
          <strong>{order.orderNumber}</strong>
          <span className="subtle">{order.date}</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (order) => (
        <>
          <span>{order.customer}</span>
          <span className="subtle">{order.itemSummary}</span>
        </>
      ),
    },
    {
      header: 'Vendor',
      cell: (order) => order.vendor,
    },
    {
      header: 'Amount',
      cell: (order) => <strong>{formatINR(order.amount)}</strong>,
    },
    {
      header: 'Status',
      cell: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      header: '',
      cell: (order) => (
        <button
          type="button"
          className="row-more"
          onClick={() => setSelectedOrder(order)}
          aria-label="View order detail"
        >
          <MoreHorizontal size={17} />
        </button>
      ),
    },
  ]

  return (
    <>
      <DataTable<Order>
        columns={columns}
        data={orders}
        keyExtractor={(order) => order.id}
        searchPlaceholder="Search orders by number, customer, or vendor..."
        filterControls={
          <OrderFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        }
        onSearchChange={setSearchQuery}
        searchFilter={(order, query) =>
          order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
          order.customer.toLowerCase().includes(query.toLowerCase()) ||
          order.vendor.toLowerCase().includes(query.toLowerCase()) ||
          order.itemSummary.toLowerCase().includes(query.toLowerCase())
        }
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  )
}
