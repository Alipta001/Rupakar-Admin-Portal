'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Payout } from '@/types/finance'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatINR } from '@/lib/utils/formatters'
import { useGetPayoutsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

import { ManualPayoutModal } from '@/components/finance/manual-payout-modal'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

export function PayoutTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
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
    if (p.status === 'COMPLETED' || p.status === 'Completed' || p.rawStatus === 'PAID') uiStatus = 'Completed'
    else if (p.status === 'PROCESSING' || p.status === 'Processing' || p.rawStatus === 'PROCESSING') uiStatus = 'Processing'
    else if (p.status === 'FAILED' || p.status === 'Failed' || p.rawStatus === 'FAILED') uiStatus = 'Failed'

    return {
      id: p.id || p._id || '',
      payoutNumber: p.payoutNumber || `PO-${(p.id || p._id || '').slice(-6).toUpperCase()}`,
      vendorName: p.vendorName || p.vendorId?.name || p.vendorId?.businessName || 'Artisan Partner',
      vendorId: p.vendorId?._id || p.vendorId || undefined,
      grossAmount: p.grossAmount ?? p.amount ?? 0,
      commissionAmount: p.commissionAmount ?? 0,
      netPayable: p.netPayable ?? p.amount ?? 0,
      formattedNetPayable: formatINR(p.netPayable ?? p.amount ?? 0),
      status: uiStatus,
      bankAccountLast4: p.bankAccountLast4 || (p.bankSnapshot?.accountNumberMasked ? p.bankSnapshot.accountNumberMasked.slice(-4) : (p.bankAccount?.accountNumber ? String(p.bankAccount.accountNumber).slice(-4) : '****')),
      bankSnapshot: p.bankSnapshot,
      referenceId: p.referenceId || p.paymentReference,
      rawStatus: p.rawStatus || p.status,
      provider: p.provider,
      failureReason: p.failureReason,
      processedAt: p.processedAt,
      date: p.createdAt || p.date ? new Date(p.createdAt || p.date).toLocaleDateString() : 'Recent',
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
    {
      header: 'Bank Reference / UTR',
      cell: (p) => {
        if (p.status === 'Completed') {
          return (
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#166534', fontWeight: 500 }}>
              {p.referenceId || 'PAID'}
            </span>
          )
        }
        if (p.status === 'Ready to process') {
          return (
            <button
              type="button"
              className="button primary"
              style={{ fontSize: '11px', padding: '4px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setSelectedPayout(p)}
            >
              <ArrowUpRight size={13} /> Confirm Transfer
            </button>
          )
        }
        return <span className="subtle">{p.status}</span>
      },
    },
  ]

  return (
    <>
      <DataTable<Payout>
        columns={columns}
        data={payouts}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search payouts by vendor or reference..."
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
        }}
      />
    </>
  )
}
