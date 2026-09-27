'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { Vendor } from '@/types/vendor'
import { VendorStatusBadge } from './vendor-status-badge'
import { VendorActions } from './vendor-actions'
import { VendorFilters } from './vendor-filters'
import { VendorDetailModal } from './vendor-detail'
import { formatINR } from '@/lib/utils/formatters'
import {
  useGetVendorsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useSuspendVendorMutation,
} from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function VendorTable() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error, refetch } = useGetVendorsQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  const [approveVendor] = useApproveVendorMutation()
  const [rejectVendor] = useRejectVendorMutation()
  const [suspendVendor] = useSuspendVendorMutation()

  const handleUpdateStatus = async (vendorId: string, status: string) => {
    try {
      if (status === 'Approved') {
        await approveVendor({ id: vendorId }).unwrap()
      } else if (status === 'Rejected') {
        await rejectVendor({ id: vendorId, reason: 'Admin rejected verification' }).unwrap()
      } else if (status === 'Suspended') {
        await suspendVendor({ id: vendorId, reason: 'Account suspended by administrator' }).unwrap()
      }
    } catch (err) {
      console.error('Failed to update vendor status:', err)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading artisan vendors from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load vendors"
        message="Could not retrieve vendor partners from Rupakar API. Please verify connection."
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

  const vendors: Vendor[] = rawList.map((v: any) => {

    let uiStatus: Vendor['status'] = 'Under review'
    if (v.status === 'APPROVED' || v.status === 'Approved') uiStatus = 'Approved'
    else if (v.status === 'REJECTED' || v.status === 'Rejected') uiStatus = 'Rejected'
    else if (v.status === 'SUSPENDED' || v.status === 'Suspended') uiStatus = 'Suspended'

    return {
      id: v.id || v._id || '',
      code: v.code || `VND-${(v.id || v._id || '').slice(-4).toUpperCase()}`,
      name: v.storeName || v.name || 'Artisan Partner',
      category: v.category || 'Handcrafted Heritage',
      location: v.location || (v.address ? `${v.address.city || ''}, ${v.address.state || ''}` : 'India'),
      ownerName: v.ownerName || v.contactPerson || v.name || 'Partner',
      email: v.email || '',
      phone: v.phone || '',
      status: uiStatus,
      verified: v.verified || v.status === 'APPROVED',
      productsCount: v.productsCount || 0,
      ordersCount: v.ordersCount || 0,
      grossMerchandiseValue: v.grossMerchandiseValue || v.totalGmv || 0,
      formattedGmv: formatINR(v.grossMerchandiseValue || v.totalGmv || 0),
      initials: (v.storeName || v.name || 'AP').slice(0, 2).toUpperCase(),
    }
  })

  const columns: Column<Vendor>[] = [
    {
      header: 'Vendor',
      className: 'primary-cell',
      cell: (vendor) => (
        <div style={{ cursor: 'pointer' }} onClick={() => setSelectedVendor(vendor)}>
          <strong>{vendor.name}</strong>
          <span className="subtle">ID: {vendor.code}</span>
        </div>
      ),
    },
    {
      header: 'Location',
      cell: (vendor) => (
        <>
          <span>{vendor.location}</span>
          <span className="subtle">{vendor.category}</span>
        </>
      ),
    },
    {
      header: 'GMV',
      cell: (vendor) => <strong>{formatINR(vendor.grossMerchandiseValue)}</strong>,
    },
    {
      header: 'Status',
      cell: (vendor) => <VendorStatusBadge status={vendor.status} />,
    },
    {
      header: '',
      cell: (vendor) => (
        <VendorActions
          vendorId={vendor.id}
          status={vendor.status}
          onUpdateStatus={handleUpdateStatus}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable<Vendor>
        columns={columns}
        data={vendors}
        keyExtractor={(vendor) => vendor.id}
        searchPlaceholder="Search vendors by name, craft, or location..."
        filterControls={
          <VendorFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        }
        onSearchChange={setSearchQuery}
        searchFilter={(vendor, query) =>
          vendor.name.toLowerCase().includes(query.toLowerCase()) ||
          vendor.category.toLowerCase().includes(query.toLowerCase()) ||
          vendor.location.toLowerCase().includes(query.toLowerCase())
        }
      />

      <VendorDetailModal
        vendor={selectedVendor}
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
      />
    </>
  )
}
