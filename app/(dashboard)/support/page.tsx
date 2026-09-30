'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { SupportTicket } from '@/types/support'
import { formatDateTime } from '@/lib/utils/formatters'
import { useGetSupportTicketsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetSupportTicketsQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading support tickets from helpdesk system..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load support tickets"
        message="Could not retrieve tickets from support API. Please verify backend connection."
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

  const tickets: SupportTicket[] = rawList.map((t: any) => ({
    id: t.id || t._id || '',
    ticketNumber: t.ticketNumber || `TCK-${(t.id || t._id || '').slice(-6).toUpperCase()}`,
    subject: t.subject || 'Support Request',
    category: t.category || 'General',
    userName: t.userName || t.user?.name || t.vendorName || 'User',
    priority: (t.priority || 'MEDIUM') as SupportTicket['priority'],
    status: (t.status || 'OPEN') as SupportTicket['status'],
    createdAt: t.createdAt || new Date().toISOString(),
  }))

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket # & Subject',
      className: 'primary-cell',
      cell: (t) => (
        <>
          <strong>{t.ticketNumber}</strong>
          <span className="subtle">{t.subject}</span>
        </>
      ),
    },
    {
      header: 'Requester',
      cell: (t) => (
        <>
          <span>{t.userName}</span>
          <span className="subtle">{t.category}</span>
        </>
      ),
    },
    {
      header: 'Priority',
      cell: (t) => <strong>{t.priority}</strong>,
    },
    {
      header: 'Status',
      cell: (t) => <StatusBadge status={t.status === 'RESOLVED' ? 'Delivered' : t.status === 'IN_PROGRESS' ? 'Processing' : 'Pending'} />,
    },
    {
      header: 'Date',
      cell: (t) => <span className="subtle">{formatDateTime(t.createdAt)}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Operations / Helpdesk"
        title="Support Tickets"
        description="Address inquiries, dispute resolutions, and operational assistance for buyers and artisans."
      />
      <DataTable<SupportTicket>
        columns={columns}
        data={tickets}
        keyExtractor={(t) => t.id}
        searchPlaceholder="Search tickets by number, requester, or subject..."
        onSearchChange={setSearchQuery}
        searchFilter={(t, query) =>
          (t.ticketNumber || '').toLowerCase().includes(query.toLowerCase()) ||
          t.subject.toLowerCase().includes(query.toLowerCase()) ||
          (t.userName || '').toLowerCase().includes(query.toLowerCase())
        }
      />
    </>
  )
}
