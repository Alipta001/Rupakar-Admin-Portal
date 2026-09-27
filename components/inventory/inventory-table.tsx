'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { InventoryItem } from '@/types/inventory'
import { InventoryFilters } from './inventory-filters'
import { StatusBadge } from '@/components/shared/status-badge'
import { useGetInventoryQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function InventoryTable() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error, refetch } = useGetInventoryQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading live warehouse and artisan inventory..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load inventory"
        message="Could not retrieve inventory levels from backend. Please verify connection."
        onRetry={refetch}
      />
    )
  }

  const items: InventoryItem[] = (data?.items || []).map((item: any) => {
    let uiStatus: InventoryItem['status'] = 'In Stock'
    if (item.availableStock <= 0) uiStatus = 'Out of Stock'
    else if (item.availableStock <= (item.safetyThreshold || 5)) uiStatus = 'Low Stock'

    return {
      id: item.id || item._id || '',
      productId: item.productId || '',
      productTitle: item.productTitle || item.title || 'Artisan Product',
      sku: item.sku || `SKU-${(item.id || item._id || '').slice(-6).toUpperCase()}`,
      vendorName: item.vendorName || 'Artisan Guild',
      category: item.category || 'Handicrafts',
      availableStock: item.availableStock ?? item.available ?? 0,
      reservedStock: item.reservedStock ?? item.reserved ?? 0,
      safetyThreshold: item.safetyThreshold ?? 5,
      status: uiStatus,
      lastUpdated: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Today',
    }
  })

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item',
      className: 'primary-cell',
      cell: (item) => (
        <>
          <strong>{item.productTitle}</strong>
          <span className="subtle">SKU: {item.sku}</span>
        </>
      ),
    },
    {
      header: 'Vendor',
      cell: (item) => (
        <>
          <span>{item.vendorName}</span>
          <span className="subtle">{item.category}</span>
        </>
      ),
    },
    {
      header: 'Available Stock',
      cell: (item) => <strong>{item.availableStock} units</strong>,
    },
    {
      header: 'Reserved',
      cell: (item) => `${item.reservedStock} units`,
    },
    {
      header: 'Status',
      cell: (item) => <StatusBadge status={item.status} />,
    },
  ]

  return (
    <DataTable<InventoryItem>
      columns={columns}
      data={items}
      keyExtractor={(item) => item.id}
      searchPlaceholder="Search inventory by title, SKU, or vendor..."
      filterControls={
        <InventoryFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      }
      onSearchChange={setSearchQuery}
      searchFilter={(item, query) =>
        item.productTitle.toLowerCase().includes(query.toLowerCase()) ||
        item.sku.toLowerCase().includes(query.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(query.toLowerCase())
      }
    />
  )
}
