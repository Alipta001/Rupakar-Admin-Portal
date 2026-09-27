'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { useGetCategoriesQuery, useCreateCategoryMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { Category } from '@/types/category'

export default function CategoriesPage() {
  const { data: rawCategories, isLoading, error, refetch } = useGetCategoriesQuery()
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [showModal, setShowModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')

  if (isLoading) {
    return <LoadingState message="Loading craft categories from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load categories"
        message="Could not retrieve categories. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const rawList = Array.isArray(rawCategories)
    ? rawCategories
    : Array.isArray((rawCategories as any)?.items)
    ? (rawCategories as any).items
    : Array.isArray((rawCategories as any)?.data)
    ? (rawCategories as any).data
    : []

  const categories: Category[] = rawList.map((cat: any) => ({
    id: cat.id || cat._id || '',
    name: cat.name || '',
    slug: cat.slug || '',
    description: cat.description || 'Heritage handicraft collection',
    productsCount: cat.productsCount || 0,
    isActive: cat.isActive !== false,
  }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName) return
    try {
      await createCategory({
        name: newCatName,
        slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, '-'),
        description: newCatDesc,
      }).unwrap()
      setShowModal(false)
      setNewCatName('')
      setNewCatSlug('')
      setNewCatDesc('')
    } catch (err) {
      console.error('Failed to create category:', err)
    }
  }

  const columns: Column<Category>[] = [
    {
      header: 'Category',
      className: 'primary-cell',
      cell: (cat) => (
        <>
          <strong>{cat.name}</strong>
          <span className="subtle">/{cat.slug}</span>
        </>
      ),
    },
    {
      header: 'Description',
      cell: (cat) => cat.description || '—',
    },
    {
      header: 'Catalog Count',
      cell: (cat) => <strong>{cat.productsCount || 0} items</strong>,
    },
    {
      header: 'Status',
      cell: (cat) => <StatusBadge status={cat.isActive ? 'Active' : 'Inactive'} />,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Commerce / Categories"
        title="Categories"
        description="Organize artisan crafts, geographical indications, and product taxonomies."
        actions={
          <button type="button" className="button primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add category
          </button>
        }
      />
      <DataTable<Category>
        columns={columns}
        data={categories}
        keyExtractor={(cat) => cat.id}
        searchPlaceholder="Search categories by name or description..."
        searchFilter={(cat, query) =>
          cat.name.toLowerCase().includes(query.toLowerCase()) ||
          (cat.description || '').toLowerCase().includes(query.toLowerCase())
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
            <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>Add Category</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Category Name
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Slug (Optional)
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>
                Description
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
