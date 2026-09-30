'use client'

import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { Invoice } from '@/types/finance'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatINR, formatDate } from '@/lib/utils/formatters'
import { useGetInvoicesQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetInvoicesQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading generated invoices and packing slips..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load invoices"
        message="Could not retrieve invoice records from server. Please check backend connection."
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

  const invoices: Invoice[] = rawList.map((inv: any) => ({
    id: inv.id || inv._id || '',
    invoiceNumber: inv.invoiceNumber || `INV-${(inv.id || inv._id || '').slice(-6).toUpperCase()}`,
    type: (inv.type || 'Customer') as Invoice['type'],
    orderNumber: inv.orderNumber ? `#${inv.orderNumber}` : `#RP-${(inv.orderId || inv._id || '').slice(-6).toUpperCase()}`,
    recipientName: inv.recipientName || inv.customerName || inv.vendorName || 'Recipient',
    amount: inv.amount ?? inv.total ?? 0,
    formattedAmount: formatINR(inv.amount ?? inv.total ?? 0),
    status: (inv.status === 'GENERATED' || inv.status === 'Generated' ? 'Generated' : 'Pending') as Invoice['status'],
    generatedDate: inv.createdAt ? formatDate(inv.createdAt) : 'Recent',
    downloadUrl: inv.downloadUrl || inv.pdfUrl,
  }))

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      className: 'primary-cell',
      cell: (inv) => (
        <>
          <strong>{inv.invoiceNumber}</strong>
          <span className="subtle">{inv.orderNumber}</span>
        </>
      ),
    },
    {
      header: 'Type',
      cell: (inv) => inv.type,
    },
    {
      header: 'Recipient',
      cell: (inv) => inv.recipientName,
    },
    {
      header: 'Amount',
      cell: (inv) => <strong>{formatINR(inv.amount)}</strong>,
    },
    {
      header: 'Status',
      cell: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: '',
      cell: (inv) => (
        <a
          href={inv.downloadUrl || `/api/v1/invoices/${inv.id}/download`}
          target="_blank"
          rel="noopener noreferrer"
          className="button secondary"
          style={{ padding: '4px 8px', fontSize: '10px', textDecoration: 'none' }}
        >
          <Download size={12} /> PDF
        </a>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Finance / Invoices"
        title="Invoices & Packing Slips"
        description="Inspect customer tax invoices, vendor commission statements, and shipment packing slips."
      />
      <DataTable<Invoice>
        columns={columns}
        data={invoices}
        keyExtractor={(inv) => inv.id}
        searchPlaceholder="Search invoices by number, order, or recipient..."
        onSearchChange={setSearchQuery}
        searchFilter={(inv, query) =>
          inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
          inv.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
          inv.recipientName.toLowerCase().includes(query.toLowerCase())
        }
      />
    </>
  )
}
