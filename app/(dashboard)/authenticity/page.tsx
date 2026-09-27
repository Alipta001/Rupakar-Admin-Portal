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

  const certs: AuthenticityRecord[] = rawList.map((c: any) => ({
    id: c.id || c._id || '',
    productId: c.productId || '',
    productTitle: c.productTitle || c.title || 'Artisan Craft Item',
    productSku: c.sku || `SKU-${(c.id || c._id || '').slice(-6).toUpperCase()}`,
    vendorId: c.vendorId || '',
    vendorName: c.vendorName || 'Artisan Guild',
    artisanName: c.artisanName || c.vendorName || 'Master Craftsman',
    region: c.region || c.state || 'West Bengal',
    district: c.district || 'Heritage Cluster',
    certificateNumber: c.certificateNumber || `AUTH-GI-${(c.id || c._id || '').slice(-5).toUpperCase()}`,
    giTagNumber: c.giTagNumber || 'GI-Certified',
    status: (c.status === 'VERIFIED' ? 'VERIFIED' : c.status === 'REJECTED' ? 'REJECTED' : 'PENDING') as AuthenticityRecord['status'],
    createdAt: c.createdAt || new Date().toISOString(),
  }))

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
          <span className="subtle">{c.region}, {c.district}</span>
        </>
      ),
    },
    {
      header: 'GI / Craft Source',
      cell: (c) => c.giTagNumber || 'State Handloom Certified',
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
