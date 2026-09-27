'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Product } from '@/types/product'
import { ProductStatusBadge } from './product-status-badge'
import { ProductActions } from './product-actions'
import { ProductFilters } from './product-filters'
import { ProductDetailModal } from './product-detail'
import { formatINR } from '@/lib/utils/formatters'
import {
  useGetProductsQuery,
  useApproveProductMutation,
  useRejectProductMutation,
  usePublishProductMutation,
  useUnpublishProductMutation,
  useArchiveProductMutation,
  useDeleteProductMutation,
} from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function ProductTable() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  const [approveProduct] = useApproveProductMutation()
  const [rejectProduct] = useRejectProductMutation()
  const [publishProduct] = usePublishProductMutation()
  const [unpublishProduct] = useUnpublishProductMutation()
  const [archiveProduct] = useArchiveProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap()
      await refetch()
      if (selectedProduct && (selectedProduct.id === productId || (selectedProduct as any)._id === productId)) {
        setSelectedProduct(null)
      }
    } catch (err: any) {
      console.error('Failed to delete rejected product:', err)
      const errorMsg = err?.data?.message || err?.error || err?.message || 'Failed to delete product'
      alert(errorMsg)
    }
  }

  const handleUpdateStatus = async (productId: string, status: string) => {
    try {
      if (status === 'Approved') {
        await approveProduct({ id: productId }).unwrap()
      } else if (status === 'Rejected') {
        await rejectProduct({ id: productId, reason: 'Does not meet artisan standards' }).unwrap()
      } else if (status === 'Published') {
        await publishProduct({ id: productId }).unwrap()
      } else if (status === 'Unpublished') {
        await unpublishProduct({ id: productId }).unwrap()
      } else if (status === 'Archived') {
        await archiveProduct({ id: productId }).unwrap()
      }
      await refetch()
      if (selectedProduct && (selectedProduct.id === productId || (selectedProduct as any)._id === productId)) {
        setSelectedProduct((prev: any) => {
          if (!prev) return null
          const nextStatus =
            status === 'Published'
              ? 'Published'
              : status === 'Approved'
              ? 'Approved'
              : status === 'Rejected'
              ? 'Rejected'
              : status === 'Archived'
              ? 'Archived'
              : status === 'Unpublished'
              ? 'Unpublished'
              : prev.status
          const nextMod =
            status === 'Published'
              ? 'PUBLISHED'
              : status === 'Approved'
              ? 'APPROVED'
              : status === 'Rejected'
              ? 'REJECTED'
              : status === 'Archived'
              ? 'ARCHIVED'
              : status === 'Unpublished'
              ? 'UNPUBLISHED'
              : prev.moderationStatus
          return {
            ...prev,
            status: nextStatus,
            moderationStatus: nextMod,
            isPublished: status === 'Published',
          }
        })
      }
    } catch (err: any) {
      console.error('Failed to update product moderation state:', err)
      const errorMsg =
        err?.data?.message || err?.error || err?.message || 'Failed to update product status'
      alert(errorMsg)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading catalog products from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load products"
        message="Could not retrieve marketplace catalog. Please check backend connection."
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

  const products: Product[] = rawList.map((p: any) => {
    const rawUpper = String(p.status || '').toUpperCase().replace(/\s+/g, '_')
    let uiStatus: Product['status'] = 'Under review'
    if (rawUpper === 'PUBLISHED') uiStatus = 'Published'
    else if (rawUpper === 'APPROVED') uiStatus = 'Approved'
    else if (rawUpper === 'REJECTED') uiStatus = 'Rejected'
    else if (rawUpper === 'DRAFT') uiStatus = 'Draft'
    else if (rawUpper === 'ARCHIVED') uiStatus = 'Archived'
    else if (rawUpper === 'UNPUBLISHED') uiStatus = 'Unpublished'
    else if (rawUpper === 'EDITED') uiStatus = 'Edited'
    else if (rawUpper === 'SUBMITTED' || rawUpper === 'UNDER_REVIEW') uiStatus = 'Under review'

    return {
      ...p,
      id: p.id || p._id || '',
      sku: p.sku || `SKU-${(p.id || p._id || '').slice(-6).toUpperCase()}`,
      title: p.title || p.name || 'Artisan Craft Item',
      vendorName: p.vendorName || p.vendor?.businessName || p.vendor?.storeName || p.vendorId?.name || 'Artisan Guild',
      category: p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : 'Handicrafts'),
      price: p.price ?? 0,
      formattedPrice: formatINR(p.price ?? 0),
      stock: p.stock ?? p.availableStock ?? p.inventory?.available ?? 0,
      status: uiStatus,
      moderationStatus: p.status,
      allowedTransitions: p.allowedTransitions,
      isPublished: p.isPublished,
      thumbnail: p.thumbnail || p.image || p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : undefined),
    }
  })

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      className: 'primary-cell',
      cell: (product) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setSelectedProductId(product.id)
            setSelectedProduct(product)
          }}
        >
          <strong>{product.title}</strong>
          <span className="subtle">SKU: {product.sku}</span>
        </div>
      ),
    },
    {
      header: 'Vendor & Category',
      cell: (product) => (
        <>
          <span>{product.vendorName}</span>
          <span className="subtle">{typeof product.category === 'string' ? product.category : product.category?.name}</span>
        </>
      ),
    },
    {
      header: 'Price',
      cell: (product) => <strong>{formatINR(product.price)}</strong>,
    },
    {
      header: 'Status',
      cell: (product) => <ProductStatusBadge status={product.status} />,
    },
    {
      header: '',
      cell: (product) => (
        <ProductActions
          productId={product.id}
          status={product.status}
          moderationStatus={product.moderationStatus}
          allowedTransitions={product.allowedTransitions}
          onUpdateStatus={handleUpdateStatus}
          onDeleteProduct={handleDeleteProduct}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable<Product>
        columns={columns}
        data={products}
        keyExtractor={(product) => product.id}
        searchPlaceholder="Search products by title, vendor, or category..."
        filterControls={
          <ProductFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        }
        onSearchChange={setSearchQuery}
        searchFilter={(product, query) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.vendorName.toLowerCase().includes(query.toLowerCase()) ||
          (typeof product.category === 'string' && product.category.toLowerCase().includes(query.toLowerCase()))
        }
      />

      <ProductDetailModal
        productId={selectedProductId}
        product={selectedProduct}
        isOpen={Boolean(selectedProductId || selectedProduct)}
        onClose={() => {
          setSelectedProductId(null)
          setSelectedProduct(null)
        }}
        onApprove={(id) => handleUpdateStatus(id, 'Approved')}
        onReject={(id) => handleUpdateStatus(id, 'Rejected')}
        onPublish={(id) => handleUpdateStatus(id, 'Published')}
        onUnpublish={(id) => handleUpdateStatus(id, 'Unpublished')}
        onArchive={(id) => handleUpdateStatus(id, 'Archived')}
        onDelete={handleDeleteProduct}
      />
    </>
  )
}
