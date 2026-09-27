'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Coupon } from '@/types/coupon'
import { useGetCouponsQuery, useCreateCouponMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetCouponsQuery({
    search: searchQuery || undefined,
  })

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation()
  const [showModal, setShowModal] = useState(false)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState(10)
  const [usageLimit, setUsageLimit] = useState(500)

  if (isLoading) {
    return <LoadingState message="Loading discount coupons from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load coupons"
        message="Could not retrieve marketing coupons. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const coupons: Coupon[] = (data?.items || []).map((c: any) => ({
    id: c.id || c._id || '',
    code: c.code || '',
    description: c.description,
    discountType: (c.discountType || 'PERCENTAGE') as Coupon['discountType'],
    discountValue: c.discountValue ?? 10,
    usageCount: c.usageCount ?? 0,
    usageLimit: c.usageLimit ?? 1000,
    isActive: c.isActive !== false,
  }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    try {
      await createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        usageLimit: Number(usageLimit),
        isActive: true,
      }).unwrap()
      setShowModal(false)
      setCode('')
    } catch (err) {
      console.error('Failed to create coupon:', err)
    }
  }

  const columns: Column<Coupon>[] = [
    {
      header: 'Coupon Code',
      className: 'primary-cell',
      cell: (c) => (
        <>
          <strong>{c.code}</strong>
          <span className="subtle">
            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
          </span>
        </>
      ),
    },
    {
      header: 'Type',
      cell: (c) => c.discountType,
    },
    {
      header: 'Usage',
      cell: (c) => `${c.usageCount} / ${c.usageLimit || '∞'} redemptions`,
    },
    {
      header: 'Status',
      cell: (c) => <StatusBadge status={c.isActive ? 'Active' : 'Inactive'} />,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Commerce / Marketing"
        title="Coupons & Promotions"
        description="Configure discount codes, cart redemption limits, and vendor-specific campaigns."
        actions={
          <button type="button" className="button primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create coupon
          </button>
        }
      />
      <DataTable<Coupon>
        columns={columns}
        data={coupons}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search coupons by code..."
        onSearchChange={setSearchQuery}
        searchFilter={(c, query) => c.code.toLowerCase().includes(query.toLowerCase())}
      />

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>Create Coupon</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Coupon Code
                <input
                  type="text"
                  required
                  placeholder="e.g. HERITAGE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Discount Type
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Flat (₹)</option>
                </select>
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Discount Value
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Usage Limit
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
