'use client'

import React, { useState } from 'react'
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { AuthenticityRecord } from '@/types/authenticity'
import { useGetAuthenticityRecordsQuery, useVerifyAuthenticityRecordMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function AuthenticityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetAuthenticityRecordsQuery({
    search: searchQuery || undefined,
  })

  const [verifyRecord, { isLoading: isVerifying }] = useVerifyAuthenticityRecordMutation()

  if (isLoading) {
    return <LoadingState message="Loading GI and artisan authenticity records..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load authenticity records"
        message="Could not retrieve artisan verification status. Please check backend connection."
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

  const certs: AuthenticityRecord[] = rawList.map((c: any) => {
    const artisan = c.artisanName || c.artisan || c.vendorName || '—'
    const certNumber = c.certificateNumber || c.certCode || '—'
    const giTag = c.giTagNumber || c.craftSource || '—'
    const region = c.region || '—'
    const district = c.district || '—'
    const rawStatus = String(c.status || c.uiStatus || '').toUpperCase()
    const status: AuthenticityRecord['status'] =
      rawStatus === 'VERIFIED' || rawStatus === 'APPROVED'
        ? 'VERIFIED'
        : rawStatus === 'REJECTED'
        ? 'REJECTED'
        : 'PENDING'

    return {
      id: c.id || c._id || '',
      productId: c.productId || c.id || c._id || '',
      productTitle: c.productTitle || c.title || 'Artisan Craft Item',
      productSku: c.sku || c.productSku || '—',
      vendorId: c.vendorId || '',
      vendorName: c.vendorName || artisan,
      artisanName: artisan,
      region,
      district,
      certificateNumber: certNumber,
      giTagNumber: giTag,
      status,
      createdAt: c.createdAt || new Date().toISOString(),
    }
  })

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await verifyRecord({ id, status }).unwrap()
    } catch (err) {
      console.error('Failed to verify authenticity record:', err)
    }
  }

  const columns: Column<AuthenticityRecord>[] = [
    {
      header: 'Certificate Code',
      className: 'primary-cell',
      cell: (c) => (
        <>
          <strong>{c.certificateNumber}</strong>
          <span className="subtle">{c.productTitle}</span>
        </>
      ),
    },
    {
      header: 'Artisan & Origin',
      cell: (c) => (
        <>
          <span>{c.artisanName}</span>
          <span className="subtle">
            {c.region !== '—' || c.district !== '—'
              ? [c.region, c.district].filter((x) => x && x !== '—').join(', ')
              : '—'}
          </span>
        </>
      ),
    },
    {
      header: 'GI / Craft Source',
      cell: (c) => c.giTagNumber,
    },
    {
      header: 'Verification Status',
      cell: (c) => <StatusBadge status={c.status === 'VERIFIED' ? 'Approved' : c.status === 'REJECTED' ? 'Rejected' : 'Under review'} />,
    },
    {
      header: '',
      cell: (c) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {c.status !== 'VERIFIED' && (
            <button
              type="button"
              className="button secondary"
              style={{ padding: '4px 8px', fontSize: '10px', color: '#45815a' }}
              onClick={() => handleVerify(c.id, 'VERIFIED')}
              disabled={isVerifying}
            >
              <CheckCircle2 size={12} /> Verify
            </button>
          )}
          {c.status !== 'REJECTED' && (
            <button
              type="button"
              className="button secondary"
              style={{ padding: '4px 8px', fontSize: '10px', color: '#c93b2b' }}
              onClick={() => handleVerify(c.id, 'REJECTED')}
              disabled={isVerifying}
            >
              <XCircle size={12} /> Reject
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Marketplace / Trust & Heritage"
        title="Authenticity & GI Verification"
        description="Verify artisan certificates, Geographical Indications (GI), and QR-verifiable proof of craft."
      />
      <DataTable<AuthenticityRecord>
        columns={columns}
        data={certs}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search certificates by code, artisan, or craft..."
        onSearchChange={setSearchQuery}
        searchFilter={(c, query) =>
          (c.certificateNumber || '').toLowerCase().includes(query.toLowerCase()) ||
          (c.artisanName || '').toLowerCase().includes(query.toLowerCase()) ||
          (c.productTitle || '').toLowerCase().includes(query.toLowerCase())
        }
      />
    </>
  )
}
