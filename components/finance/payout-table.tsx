'use client'

import React, { useState, useMemo } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Payout } from '@/types/finance'
import { formatINR } from '@/lib/utils/formatters'
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
  ShieldAlert,
  Calendar,
  Filter,
} from 'lucide-react'

interface PayoutTableProps {
  onRefresh?: () => void
}

export function PayoutTable({ onRefresh }: PayoutTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)

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
        referenceId: p.referenceId || p.paymentReference || p.utr,
        rawStatus: normStatus,
        provider: p.provider || 'MANUAL_BANK_TRANSFER',
        failureReason: p.failureReason,
        processedAt: p.processedAt || p.paidAt,
        date: p.processedAt
          ? new Date(p.processedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : p.createdAt || p.date
          ? new Date(p.createdAt || p.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent',
      }
    })
  }, [rawList])

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (statusFilter !== 'ALL' && p.rawStatus !== statusFilter) {
        return false
      }
      return true
    })
  }, [payouts, statusFilter])

  if (isLoading) {
    return <LoadingState message="Loading vendor settlement payout history..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load payouts"
        message="Could not retrieve payout records from finance service."
        onRetry={refetch}
      />
    )
  }

  const renderStatusBadge = (rawStatus: string) => {
    switch (rawStatus) {
      case 'PAID':
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
            }}
          >
            <CheckCircle2 size={12} /> PAID
          </span>
        )
      case 'READY':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#92400e',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
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
              background: '#e0e7ff',
              color: '#4338ca',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={12} /> PROCESSING
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
            }}
          >
            <AlertCircle size={12} /> FAILED
          </span>
        )
      case 'ON_HOLD':
      case 'ON HOLD':
        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              background: '#ffedd5',
              color: '#c2410c',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldAlert size={12} /> ON HOLD
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
            }}
          >
            {rawStatus}
          </span>
        )
    }
  }

  const columns: Column<Payout>[] = [
    {
      header: 'Payout Ref',
      className: 'primary-cell',
      cell: (p) => (
        <div>
          <strong style={{ fontSize: '13px', color: '#27231f' }}>{p.payoutNumber}</strong>
          <span className="subtle" style={{ fontSize: '11px', color: '#827b72' }}>
            {p.bankSnapshot?.bankName || 'Bank'} ending in {p.bankAccountLast4}
          </span>
        </div>
      ),
    },
    {
      header: 'Vendor Name',
      cell: (p) => (
        <div>
          <strong style={{ fontSize: '13px', color: '#27231f' }}>{p.vendorName}</strong>
          {p.vendorId && (
            <span style={{ fontSize: '11px', color: '#827b72', display: 'block' }}>
              ID: {String(p.vendorId).slice(-6)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Gross Sales',
      cell: (p) => formatINR(p.grossAmount),
    },
    {
      header: 'Commission Deducted',
      cell: (p) => <span style={{ color: '#827b72' }}>{formatINR(p.commissionAmount)}</span>,
    },
    {
      header: 'Net Disbursed',
      cell: (p) => (
        <strong style={{ color: '#27231f', fontSize: '14px' }}>
          {formatINR(p.netPayable)}
        </strong>
      ),
    },
    {
      header: 'Status',
      cell: (p) => renderStatusBadge(p.rawStatus || 'READY'),
    },
    {
      header: 'UTR / Reference & Date',
      cell: (p) => {
        if (p.rawStatus === 'PAID') {
          return (
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#166534',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={13} /> {p.referenceId || 'CONFIRMED'}
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
          )
        }
        if (p.rawStatus === 'READY') {
          return (
            <button
              type="button"
              className="button primary"
              style={{
                fontSize: '11px',
                padding: '5px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => setSelectedPayout(p)}
            >
              <ArrowUpRight size={13} /> Disburse (UTR)
            </button>
          )
        }
        return <span style={{ fontSize: '11px', color: '#827b72' }}>{p.rawStatus}</span>
      },
    },
  ]

  return (
    <div
      className="panel"
      style={{
        background: '#ffffff',
        border: '1px solid #e7ded2',
        borderRadius: '10px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#27231f' }}>
            Settlement Payout History
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#827b72' }}>
            Complete audit trail of all manual bank transfers, UTR references, and statuses.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#827b72', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
      </div>

      <DataTable<Payout>
        columns={columns}
        data={filteredPayouts}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search payouts by vendor name, payout ref, or UTR..."
        onSearchChange={setSearchQuery}
        searchFilter={(p, query) =>
          p.payoutNumber.toLowerCase().includes(query.toLowerCase()) ||
          p.vendorName.toLowerCase().includes(query.toLowerCase()) ||
          (p.referenceId ? p.referenceId.toLowerCase().includes(query.toLowerCase()) : false)
        }
      />

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
