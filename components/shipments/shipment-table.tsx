'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Search, RefreshCw, Truck } from 'lucide-react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Shipment } from '@/types/shipment'
import { ShipmentStatusBadge } from './shipment-status-badge'
import { ShipmentDetailModal } from './shipment-detail-modal'
import { formatDateTime } from '@/lib/utils/formatters'
import { useGetShipmentsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'READY_TO_SHIP', label: 'Ready to Ship' },
  { value: 'PICKUP_REQUESTED', label: 'Pickup Requested' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'DELIVERY_FAILED', label: 'Delivery Failed' },
  { value: 'RTO_INITIATED', label: 'RTO Initiated' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function ShipmentTable() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  const { data, isLoading, error, refetch, isFetching } = useGetShipmentsQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading shipments from Rupakar delivery system..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load shipments"
        message="Could not retrieve carrier shipments. Please verify backend connection."
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

  const shipments: Shipment[] = rawList.map((s: any) => ({
    id: s.id || s._id || '',
    shipmentNumber: s.shipmentNumber || `SHP-${(s.id || s._id || '').slice(-6).toUpperCase()}`,
    orderId: s.orderId?._id || s.orderId || '',
    orderNumber: s.orderId?.orderNumber || s.orderNumber || (typeof s.orderId === 'string' ? `#${s.orderId.slice(-6).toUpperCase()}` : '—'),
    vendorOrderId: s.vendorOrderId?._id || s.vendorOrderId || '',
    vendorId: s.vendorId?._id || s.vendorId || '',
    vendorName: s.vendorId?.storeName || s.vendorId?.businessName || s.vendorName || 'Artisan Seller',
    carrier: s.carrier || s.provider || 'Delhivery',
    service: s.service || 'STANDARD',
    trackingNumber: s.trackingNumber || s.awb || '—',
    trackingUrl: s.trackingUrl || '',
    labelUrl: s.labelUrl || '',
    status: s.status || 'CREATED',
    pickupStatus: s.pickupStatus || 'PENDING',
    pickupScheduledAt: s.pickupScheduledAt,
    estimatedDeliveryDate: s.estimatedDeliveryDate,
    deliveredAt: s.deliveredAt,
    shippingCost: s.shippingCost || 0,
    packageDetails: s.packageDetails || {
      weight: s.weight || 0.5,
      length: s.length || 15,
      width: s.width || 10,
      height: s.height || 5,
    },
    pickupAddress: s.pickupAddress,
    deliveryAddress: s.deliveryAddress,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }))

  const filteredShipments = shipments.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.shipmentNumber.toLowerCase().includes(q) ||
      (item.orderNumber && item.orderNumber.toLowerCase().includes(q)) ||
      (item.trackingNumber && item.trackingNumber.toLowerCase().includes(q)) ||
      item.carrier.toLowerCase().includes(q) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(q))
    )
  })

  const columns: Column<Shipment>[] = [
    {
      header: 'Shipment',
      className: 'primary-cell',
      cell: (item) => (
        <div style={{ cursor: 'pointer' }} onClick={() => setSelectedShipment(item)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={15} style={{ color: 'var(--color-primary, #6366f1)' }} />
            <strong>{item.shipmentNumber}</strong>
          </div>
          <span className="subtle">{item.createdAt ? formatDateTime(item.createdAt) : 'Recent'}</span>
        </div>
      ),
    },
    {
      header: 'Order Ref',
      cell: (item) => (
        <div>
          <span>{item.orderNumber}</span>
          <span className="subtle">{item.vendorName}</span>
        </div>
      ),
    },
    {
      header: 'Carrier & Service',
      cell: (item) => (
        <div>
          <span style={{ fontWeight: 600 }}>{item.carrier}</span>
          <span className="subtle">{item.service}</span>
        </div>
      ),
    },
    {
      header: 'AWB / Tracking',
      cell: (item) => (
        <div>
          {item.trackingNumber && item.trackingNumber !== '—' ? (
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {item.trackingNumber}
            </span>
          ) : (
            <span className="subtle">Pending AWB</span>
          )}
        </div>
      ),
    },
    {
      header: 'Pickup Status',
      cell: (item) => {
        const pStatus = (item.pickupStatus || 'PENDING').toUpperCase()
        const color =
          pStatus === 'PICKED_UP'
            ? '#10b981'
            : pStatus === 'SCHEDULED' || pStatus === 'REQUESTED'
            ? '#3b82f6'
            : pStatus === 'FAILED'
            ? '#ef4444'
            : '#6b7280'
        return (
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: `${color}15`,
              color,
              fontWeight: 600,
            }}
          >
            {pStatus.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      header: 'Status',
      cell: (item) => <ShipmentStatusBadge status={item.status} />,
    },
    {
      header: '',
      cell: (item) => (
        <button
          type="button"
          className="row-more"
          onClick={() => setSelectedShipment(item)}
          aria-label="View shipment details"
        >
          <MoreHorizontal size={17} />
        </button>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flex: '1 1 300px', maxWidth: '400px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by AWB, Shipment #, Order, Carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #e5e7eb)',
              backgroundColor: 'var(--input-bg, #ffffff)',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #e5e7eb)',
              backgroundColor: 'var(--input-bg, #ffffff)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #e5e7eb)',
              backgroundColor: 'transparent',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        emptyMessage="No shipments found matching the criteria."
      />

      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onSuccess={() => {
            refetch()
            setSelectedShipment(null)
          }}
        />
      )}
    </div>
  )
}
