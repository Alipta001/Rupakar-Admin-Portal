'use client'

import React, { useState } from 'react'
import { CheckCircle2, Star, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Review } from '@/types/review'
import { useGetReviewsQuery, useUpdateReviewStatusMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetReviewsQuery({
    search: searchQuery || undefined,
  })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateReviewStatusMutation()

  if (isLoading) {
    return <LoadingState message="Loading customer reviews from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load reviews"
        message="Could not retrieve product reviews. Please verify backend connection."
        onRetry={refetch}
      />
    )
  }

  const reviews: Review[] = (data?.items || []).map((r: any) => ({
    id: r.id || r._id || '',
    productId: r.productId || '',
    productTitle: r.productTitle || r.product?.title || 'Artisan Craft',
    userId: r.userId || '',
    customerName: r.customerName || r.user?.name || 'Customer',
    rating: r.rating ?? 5,
    comment: r.comment || r.review || '',
    status: (r.status === 'APPROVED' ? 'APPROVED' : r.status === 'REJECTED' ? 'REJECTED' : 'PENDING') as Review['status'],
    createdAt: r.createdAt || new Date().toISOString(),
  }))

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateStatus({ id, status }).unwrap()
    } catch (err) {
      console.error('Failed to moderate review:', err)
    }
  }

  const columns: Column<Review>[] = [
    {
      header: 'Customer & Product',
      className: 'primary-cell',
      cell: (r) => (
        <>
          <strong>{r.customerName}</strong>
          <span className="subtle">{r.productTitle}</span>
        </>
      ),
    },
    {
      header: 'Rating',
      cell: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#c5846c', fontWeight: 600 }}>
          <Star size={12} fill="#c5846c" /> {r.rating}.0
        </span>
      ),
    },
    {
      header: 'Review Excerpt',
      cell: (r) => (
        <span style={{ maxWidth: '280px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {r.comment}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <StatusBadge
          status={r.status === 'APPROVED' ? 'Approved' : r.status === 'REJECTED' ? 'Rejected' : 'Under review'}
        />
      ),
    },
    {
      header: '',
      cell: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {r.status !== 'APPROVED' && (
            <button
              type="button"
              className="button secondary"
              style={{ padding: '4px 6px', fontSize: '10px', color: '#45815a' }}
              onClick={() => handleModerate(r.id, 'APPROVED')}
              disabled={isUpdating}
              title="Approve review"
            >
              <CheckCircle2 size={13} />
            </button>
          )}
          {r.status !== 'REJECTED' && (
            <button
              type="button"
              className="button secondary"
              style={{ padding: '4px 6px', fontSize: '10px', color: '#c93b2b' }}
              onClick={() => handleModerate(r.id, 'REJECTED')}
              disabled={isUpdating}
              title="Reject review"
            >
              <XCircle size={13} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Marketplace / Moderation"
        title="Product Reviews"
        description="Moderate customer product ratings, feedback, and verified purchase reviews."
      />
      <DataTable<Review>
        columns={columns}
        data={reviews}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search reviews by customer, product, or comment..."
        onSearchChange={setSearchQuery}
        searchFilter={(r, query) =>
          (r.customerName || '').toLowerCase().includes(query.toLowerCase()) ||
          (r.productTitle || '').toLowerCase().includes(query.toLowerCase()) ||
          r.comment.toLowerCase().includes(query.toLowerCase())
        }
      />
    </>
  )
}
