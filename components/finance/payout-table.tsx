'use client'

import React, { useState, useMemo } from 'react'
import { Payout } from '@/types/finance'
import { formatINR, formatDateTime, formatDate } from '@/lib/utils/formatters'
import { useGetPayoutsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { ManualPayoutModal } from '@/components/finance/manual-payout-modal'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Calendar,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'

interface PayoutTableProps {
  onRefresh?: () => void
}

export function PayoutTable({ onRefresh }: PayoutTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useGetPayoutsQuery()

  const rawList = Array.isArray(data?.items)
    ? data.items
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
    ? data
    : []

  const payouts: Payout[] = useMemo(() => {
    return rawList.map((p: any) => {
      let normStatus: string = (p.rawStatus || p.status || 'READY').toUpperCase()
      if (normStatus === 'COMPLETED') normStatus = 'PAID'

      let uiStatus: Payout['status'] = 'Ready to process'
      if (normStatus === 'PAID') uiStatus = 'Completed'
      else if (normStatus === 'PROCESSING') uiStatus = 'Processing'
      else if (normStatus === 'FAILED') uiStatus = 'Failed'
      else if (normStatus === 'ON_HOLD') uiStatus = 'On hold'

      const bank = p.bankSnapshot || p.bankAccount || {}
      const maskedAcc =
        bank.accountNumberMasked ||
        (bank.accountNumber ? `••••${String(bank.accountNumber).slice(-4)}` : '••••')

      const dateStr = p.processedAt || p.paidAt || p.createdAt || p.date

      return {
        id: p.id || p._id || '',
        payoutNumber:
          p.payoutNumber || `PO-${(p.id || p._id || '').slice(-6).toUpperCase()}`,
        vendorName:
          p.vendorName ||
          p.vendorId?.storeName ||
          p.vendorId?.name ||
          p.vendorId?.businessName ||
          'Artisan Partner',
        vendorId: p.vendorId?._id || p.vendorId || undefined,
        grossAmount: p.grossAmount ?? p.amount ?? 0,
        commissionAmount: p.commissionAmount ?? 0,
        netPayable: p.netPayable ?? p.amount ?? 0,
        formattedNetPayable: formatINR(p.netPayable ?? p.amount ?? 0),
        status: uiStatus,
        bankAccountLast4: maskedAcc.slice(-4),
        bankSnapshot: {
          accountHolderName: bank.accountHolderName || p.vendorName,
          accountNumberMasked: maskedAcc,
          ifsc: bank.ifsc,
          bankName: bank.bankName,
        },
        referenceId: p.referenceId || p.paymentReference || p.providerTransferId || p.utr,
        rawStatus: normStatus,
        provider: p.provider || 'MANUAL_BANK_TRANSFER',
        failureReason: p.failureReason,
        processedAt: p.processedAt || p.paidAt,
        date: dateStr ? formatDateTime(dateStr) : 'Recent',
      }
    })
  }, [rawList])

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        p.rawStatus === statusFilter ||
        (statusFilter === 'READY' && (p.rawStatus === 'READY' || p.rawStatus === 'CREATED'))

      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        p.payoutNumber.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        (p.referenceId ? p.referenceId.toLowerCase().includes(q) : false)

      return matchesStatus && matchesQuery
    })
  }, [payouts, statusFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredPayouts.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedPayouts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPayouts.slice(start, start + pageSize)
  }, [filteredPayouts, currentPage, pageSize])

  if (isLoading) {
    return <LoadingState message="Loading payout ledger from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load payouts"
        message="Could not retrieve payout records. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const renderStatusBadge = (rawStatus: string) => {
    switch (rawStatus) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckCircle2 size={12} /> PAID
          </span>
        )
      case 'READY':
      case 'CREATED':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={12} /> READY
          </span>
        )
      case 'PROCESSING':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#e0f2fe',
              color: '#0369a1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={12} /> PROCESSING
          </span>
        )
      case 'FAILED':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#fee2e2',
              color: '#b91c1c',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <AlertCircle size={12} /> FAILED
          </span>
        )
      case 'ON_HOLD':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={12} /> ON HOLD
          </span>
        )
      case 'REVERSED':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#f3e8ff',
              color: '#7e22ce',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <RotateCcw size={12} /> REVERSED
          </span>
        )
      default:
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#f3f4f6',
              color: '#4b5563',
              whiteSpace: 'nowrap',
            }}
          >
            {rawStatus}
          </span>
        )
    }
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e7ded2',
        borderRadius: '12px',
        overflow: 'hidden',
        marginTop: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header & Controls */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0ede9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#27231f' }}>
            Settlement Payout History
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#827b72' }}>
            Authoritative audit trail of all manual bank transfers, UTR references, and statuses.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              border: '1px solid #d4cdc5',
              borderRadius: '6px',
              background: '#ffffff',
              width: '240px',
            }}
          >
            <Search size={14} style={{ color: '#827b72', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search ref, vendor, UTR..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                width: '100%',
                color: '#27231f',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} style={{ color: '#827b72' }} />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#827b72', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '6px 10px',
                border: '1px solid #d4cdc5',
                borderRadius: '6px',
                fontSize: '12px',
                background: '#ffffff',
                color: '#27231f',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>

          <span style={{ fontSize: '12px', color: '#827b72', marginLeft: '6px' }}>
            {filteredPayouts.length} {filteredPayouts.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {/* Table Container with Responsive Horizontal Scroll */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            width: '100%',
            minWidth: '1050px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '12px',
          }}
        >
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #e9e5df' }}>
              <th style={{ padding: '12px 14px', width: '14%', minWidth: '135px', fontWeight: 600, color: '#827b72' }}>
                PAYOUT REF
              </th>
              <th style={{ padding: '12px 14px', width: '18%', minWidth: '170px', fontWeight: 600, color: '#827b72' }}>
                VENDOR
              </th>
              <th style={{ padding: '12px 14px', width: '10%', minWidth: '100px', fontWeight: 600, color: '#827b72' }}>
                GROSS SALES
              </th>
              <th style={{ padding: '12px 14px', width: '11%', minWidth: '110px', fontWeight: 600, color: '#827b72' }}>
                COMMISSION
              </th>
              <th style={{ padding: '12px 14px', width: '12%', minWidth: '115px', fontWeight: 600, color: '#827b72' }}>
                NET DISBURSED
              </th>
              <th style={{ padding: '12px 14px', width: '11%', minWidth: '115px', fontWeight: 600, color: '#827b72' }}>
                METHOD
              </th>
              <th style={{ padding: '12px 14px', width: '10%', minWidth: '100px', fontWeight: 600, color: '#827b72' }}>
                STATUS
              </th>
              <th style={{ padding: '12px 14px', width: '14%', minWidth: '150px', fontWeight: 600, color: '#827b72' }}>
                UTR & TIMESTAMP
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayouts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px 14px', textAlign: 'center', color: '#827b72' }}>
                  No payout records matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedPayouts.map((p) => {
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #f3efea',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Payout Ref */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <strong style={{ fontSize: '13px', color: '#27231f', display: 'block' }}>
                        {p.payoutNumber}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#827b72', display: 'block', marginTop: '2px' }}>
                        {p.bankSnapshot?.bankName || 'Bank'} ending in {p.bankAccountLast4}
                      </span>
                    </td>

                    {/* Vendor */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', maxWidth: '200px' }}>
                      <strong style={{ fontSize: '13px', color: '#27231f', display: 'block', overflowWrap: 'anywhere' }}>
                        {p.vendorName}
                      </strong>
                      {p.vendorId && (
                        <span style={{ fontSize: '11px', color: '#827b72', display: 'block', marginTop: '2px' }}>
                          ID: {String(p.vendorId).slice(-6)}
                        </span>
                      )}
                    </td>

                    {/* Gross Sales */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', color: '#524b42' }}>
                      {formatINR(p.grossAmount)}
                    </td>

                    {/* Commission */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', color: '#827b72' }}>
                      {formatINR(p.commissionAmount)}
                    </td>

                    {/* Net Disbursed */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <strong style={{ color: '#27231f', fontSize: '13px' }}>
                        {formatINR(p.netPayable)}
                      </strong>
                    </td>

                    {/* Method */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#524b42',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          display: 'inline-block',
                          padding: '2px 6px',
                          background: '#f5f3ef',
                          borderRadius: '4px',
                        }}
                      >
                        {p.provider ? p.provider.replaceAll('_', ' ') : 'MANUAL BANK TRANSFER'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      {renderStatusBadge(p.rawStatus || 'READY')}
                    </td>

                    {/* UTR / Date */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      {p.rawStatus === 'PAID' ? (
                        <div>
                          <div
                            style={{
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: '#15803d',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={12} /> {p.referenceId || 'CONFIRMED'}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#827b72',
                              marginTop: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Calendar size={11} /> {p.date}
                          </div>
                        </div>
                      ) : p.rawStatus === 'READY' || p.rawStatus === 'CREATED' ? (
                        <button
                          type="button"
                          className="button primary"
                          style={{
                            fontSize: '11px',
                            padding: '5px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#8a5327',
                            color: '#ffffff',
                            fontWeight: 600,
                          }}
                          onClick={() => setSelectedPayout(p)}
                        >
                          <ArrowUpRight size={13} /> Disburse (UTR)
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#827b72' }}>
                          {p.date || p.rawStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #f0ede9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#827b72',
          }}
        >
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 8px',
                border: '1px solid #d4cdc5',
                borderRadius: '5px',
                background: '#ffffff',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1,
                fontSize: '11px',
                color: '#27231f',
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 8px',
                border: '1px solid #d4cdc5',
                borderRadius: '5px',
                background: '#ffffff',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1,
                fontSize: '11px',
                color: '#27231f',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Manual Payout Modal */}
      <ManualPayoutModal
        isOpen={Boolean(selectedPayout)}
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        onSuccess={() => {
          refetch()
          if (onRefresh) onRefresh()
        }}
      />
    </div>
  )
}
