'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { AdminReturn, ReturnStatus } from '@/types/return'
import { ReturnStatusBadge } from '@/components/returns/return-status-badge'
import { ReturnDetailModal } from '@/components/returns/return-detail-modal'
import { formatINR, formatDate } from '@/lib/utils/formatters'
import { useGetAdminReturnsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All Returns', value: 'ALL' },
  { label: 'Disputed (Urgent)', value: 'DISPUTED' },
  { label: 'Inspection Passed', value: 'INSPECTION_PASSED' },
  { label: 'Inspection Pending', value: 'INSPECTION_PENDING' },
  { label: 'Approved for Refund', value: 'APPROVED_FOR_REFUND' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Replacement Pending', value: 'REPLACEMENT_PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Closed', value: 'CLOSED' },
]

export default function AdminReturnsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReturn, setSelectedReturn] = useState<AdminReturn | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { data, isLoading, error, refetch } = useGetAdminReturnsQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery.trim() || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading returns & dispute arbitrations from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load returns"
        message="Could not retrieve marketplace returns. Please check your admin connection."
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

  const returnsList: AdminReturn[] = rawList.map((r: any) => ({
    ...r,
    _id: r._id || r.id,
    id: r.id || r._id,
  }))

  const disputedCount = returnsList.filter((r) => r.status === 'DISPUTED').length
  const passedCount = returnsList.filter((r) => r.status === 'INSPECTION_PASSED').length

  const handleRowClick = (ret: AdminReturn) => {
    const normalized: AdminReturn = {
      ...ret,
      _id: String(ret._id || ret.id || ''),
      id: String(ret.id || ret._id || ''),
    }
    setSelectedReturn(normalized)
    setIsDetailModalOpen(true)
  }

  const columns: Column<AdminReturn>[] = [
    {
      header: 'Return # / Order',
      className: 'primary-cell',
      cell: (r) => (
        <div>
          <strong style={{ fontSize: '12px' }}>{r.returnNumber}</strong>
          <span className="subtle">
            Order: {r.order?.orderNumber || (r.orderId ? `#${String(r.orderId).slice(-6).toUpperCase()}` : '—')}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (r) => (
        <div>
          <strong>{r.customer?.name || 'Customer'}</strong>
          <span className="subtle">{r.customer?.email || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Vendor',
      cell: (r) => (
        <div>
          <strong>{r.vendor?.storeName || r.vendor?.businessName || 'Artisan Seller'}</strong>
          <span className="subtle">{r.vendor?.email || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Product / Quantity',
      cell: (r) => {
        const first = r.items?.[0]
        const title = first?.productSnapshot?.title || first?.title || first?.productName || 'Handcrafted item'
        const count = r.items?.length || 1
        const qty = r.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1
        return (
          <div>
            <strong>{title}{count > 1 ? ` (+${count - 1} more)` : ''}</strong>
            <span className="subtle">Total returned: {qty} unit(s)</span>
          </div>
        )
      },
    },
    {
      header: 'Reason',
      cell: (r) => (
        <span style={{ fontSize: '11px', color: '#554e47' }}>
          {r.reason}
        </span>
      ),
    },
    {
      header: 'Proportional Refund',
      cell: (r) => {
        const refundAmt = r.refundDetails?.amount ?? r.calculatedRefund?.amount ?? 0
        return (
          <div>
            <strong style={{ color: '#a45138' }}>{formatINR(refundAmt)}</strong>
            <span style={{ display: 'block', fontSize: '9px', color: '#827b72' }}>Authoritative</span>
          </div>
        )
      },
    },
    {
      header: 'Status',
      cell: (r) => <ReturnStatusBadge status={r.status} />,
    },
    {
      header: 'Date',
      cell: (r) => (
        <span style={{ fontSize: '11px', color: '#827b72' }}>
          {formatDate(r.createdAt || r.requestedAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (r) => {
        const isDisputed = r.status === 'DISPUTED'
        const isReadyToResolve =
          r.status === 'INSPECTION_PASSED' ||
          r.status === 'DISPOSITION_PENDING' ||
          r.status === 'DISPOSITION_COMPLETED'
        const isRefundReady =
          r.status === 'APPROVED_FOR_REFUND' ||
          r.status === 'REFUND_PENDING' ||
          r.status === 'REFUND_FAILED' ||
          r.status === 'MANUAL_PAYOUT_PENDING' ||
          r.resolution?.action === 'RETURN_REFUND'

        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleRowClick(r)}
              data-action={isRefundReady ? 'return_refund' : isReadyToResolve ? 'resolve' : isDisputed ? 'arbitrate' : 'view'}
              className={`button ${isDisputed ? 'primary' : isRefundReady ? 'primary' : 'secondary'}`}
              style={{
                padding: '6px 10px',
                fontSize: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(isRefundReady ? { background: '#2d6540', borderColor: '#2d6540', color: '#fff' } : {})
              }}
            >
              {isDisputed ? 'Arbitrate' : isRefundReady ? 'Refund' : isReadyToResolve ? 'Resolve' : 'View'}
            </button>
            <button
              type="button"
              onClick={() => handleRowClick(r)}
              className="button secondary"
              style={{ padding: '6px 8px', fontSize: '10px' }}
              title="Quick preview in modal"
            >
              Quick View
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Commerce / Returns"
        title="Return Management & Arbitration"
        description="Authoritative marketplace return audit, seller inspection dispute arbitration, and final resolution."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {disputedCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fdf2f0',
                  border: '1px solid #f5c2bc',
                  color: '#a45138',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={14} /> {disputedCount} Dispute(s) Awaiting Review
              </div>
            )}
            {passedCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#eaf4eb',
                  border: '1px solid #c2e0c6',
                  color: '#45815a',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={14} /> {passedCount} Ready for Resolution
              </div>
            )}
          </div>
        }
      />

      {/* Filter Tabs / Selectors */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            style={{
              border: `1px solid ${statusFilter === opt.value ? '#a45138' : '#e9e5df'}`,
              background: statusFilter === opt.value ? '#a45138' : '#fff',
              color: statusFilter === opt.value ? '#fff' : '#6d655d',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <DataTable<AdminReturn>
        columns={columns}
        data={returnsList}
        keyExtractor={(r, idx) => r._id || r.id || String(idx)}
        searchPlaceholder="Search by Return #, Order #, customer, or vendor..."
        onSearchChange={setSearchQuery}
        searchFilter={(r, q) => {
          const term = (q || '').toLowerCase()
          return (
            (r.returnNumber || '').toLowerCase().includes(term) ||
            (r.order?.orderNumber || '').toLowerCase().includes(term) ||
            (r.customer?.name || '').toLowerCase().includes(term) ||
            (r.vendor?.storeName || r.vendor?.businessName || '').toLowerCase().includes(term) ||
            (r.reason || '').toLowerCase().includes(term)
          )
        }}
      />

      {/* Detail & Arbitration Modal */}
      <ReturnDetailModal
        returnData={selectedReturn}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedReturn(null)
        }}
        onSuccess={async (updatedDoc?: AdminReturn | null) => {
          if (updatedDoc) {
            setSelectedReturn(updatedDoc)
          }
          try {
            const res = await refetch()
            const raw = res?.data
            if (raw) {
              const list = Array.isArray((raw as any)?.items)
                ? (raw as any).items
                : Array.isArray((raw as any)?.data)
                ? (raw as any).data
                : Array.isArray(raw)
                ? raw
                : []
              const targetId = updatedDoc?._id || updatedDoc?.id || selectedReturn?._id || selectedReturn?.id
              const updated = list.find((r: any) => (r._id || r.id) === targetId)
              if (updated) {
                setSelectedReturn((prev) => ({
                  ...(prev || {}),
                  ...updated,
                  _id: updated._id || updated.id,
                  id: updated.id || updated._id,
                }))
              }
            }
          } catch (err) {
            console.error('Failed to refetch returns after update:', err)
          }
        }}
      />
    </>
  )
}
