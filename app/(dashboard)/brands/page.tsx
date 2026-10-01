'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { useGetBrandsQuery, useCreateBrandMutation, useUpdateBrandMutation, useDeleteBrandMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { Brand } from '@/types/category'

export default function BrandsPage() {
  const { data: rawBrands, isLoading, error, refetch } = useGetBrandsQuery()
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation()
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation()
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation()
  const [showModal, setShowModal] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [brandSlug, setBrandSlug] = useState('')
  const [brandDesc, setBrandDesc] = useState('')

  if (isLoading) {
    return <LoadingState message="Loading artisan guilds and brands from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load brands"
        message="Could not retrieve brands from API. Please verify backend connection."
        onRetry={refetch}
      />
    )
  }

  const rawList = Array.isArray(rawBrands)
    ? rawBrands
    : Array.isArray((rawBrands as any)?.items)
    ? (rawBrands as any).items
    : Array.isArray((rawBrands as any)?.data)
    ? (rawBrands as any).data
    : []

  const brands: Brand[] = rawList.map((b: any) => ({
    id: b.id || b._id || '',
    name: b.name || '',
    slug: b.slug || '',
    description: b.description || 'Master artisan guild / producer label',
    productsCount: b.productsCount || 0,
    isActive: b.isActive !== false && b.status !== 'INACTIVE',
  }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandName) return
    try {
      await createBrand({
        name: brandName,
        slug: brandSlug || brandName.toLowerCase().replace(/\s+/g, '-'),
        description: brandDesc,
      }).unwrap()
      setShowModal(false)
      setBrandName('')
      setBrandSlug('')
      setBrandDesc('')
    } catch (err) {
      console.error('Failed to create brand:', err)
    }
  }

  const handleToggleArchive = async (b: Brand) => {
    try {
      const nextStatus = b.isActive ? 'INACTIVE' : 'ACTIVE'
      await updateBrand({ id: b.id, data: { status: nextStatus } as any }).unwrap()
    } catch (err: any) {
      console.error('Failed to update brand status:', err)
      alert(err?.data?.message || err?.message || 'Failed to update brand status')
    }
  }

  const handleDelete = async (b: Brand) => {
    if (!window.confirm(`Are you sure you want to delete brand "${b.name}"?`)) return
    try {
      await deleteBrand(b.id).unwrap()
    } catch (err: any) {
      console.error('Failed to delete brand:', err)
      alert(err?.data?.message || err?.message || 'Failed to delete brand')
    }
  }

  const columns: Column<Brand>[] = [
    {
      header: 'Brand / Guild',
      className: 'primary-cell',
      cell: (b) => (
        <>
          <strong>{b.name}</strong>
          <span className="subtle">/{b.slug}</span>
        </>
      ),
    },
    {
      header: 'Description',
      cell: (b) => b.description || '—',
    },
    {
      header: 'Catalog Count',
      cell: (b) => <strong>{b.productsCount || 0} products</strong>,
    },
    {
      header: 'Status',
      cell: (b) => <StatusBadge status={b.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      header: '',
      cell: (b) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="button secondary sm"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => handleToggleArchive(b)}
            disabled={isUpdating}
          >
            {b.isActive ? 'Archive' : 'Activate'}
          </button>
          <button
            type="button"
            className="button secondary sm"
            style={{ fontSize: '11px', padding: '4px 10px', color: '#b91c1c', borderColor: '#fca5a5' }}
            onClick={() => handleDelete(b)}
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Commerce / Brands"
        title="Brands & Guilds"
        description="Manage regional artisan cooperatives, master craft labels, and producer brands."
        actions={
          <button type="button" className="button primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Register brand
          </button>
        }
      />
      <DataTable<Brand>
        columns={columns}
        data={brands}
        keyExtractor={(b) => b.id}
        searchPlaceholder="Search brands by name or description..."
        searchFilter={(b, query) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          (b.description || '').toLowerCase().includes(query.toLowerCase())
        }
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
          <div className="panel" style={{ width: '420px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>Register Brand / Guild</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Brand Name
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Slug (Optional)
                <input
                  type="text"
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Description / Guild Tradition
                <textarea
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
