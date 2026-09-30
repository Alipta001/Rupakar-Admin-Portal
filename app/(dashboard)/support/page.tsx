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
import { SupportTicketDetailModal } from '@/components/support/support-ticket-detail'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error, refetch } = useGetSupportTicketsQuery({
    search: searchQuery || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
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

  const tickets: SupportTicket[] = rawList.map((t: any) => {
    const id = t.id || t._id || ''
    const userName =
      typeof t.userId === 'object' && t.userId !== null
        ? t.userId.fullName || t.userId.name || 'User'
        : t.userName || t.user?.name || 'User'
    const vendorName =
      typeof t.vendorId === 'object' && t.vendorId !== null
        ? t.vendorId.businessName || t.vendorId.storeName
        : t.vendorName

    return {
      id,
      ticketNumber: t.ticketNumber || `TCK-${id.slice(-6).toUpperCase()}`,
      subject: t.subject || 'Support Request',
      category: t.category || 'General',
      userName: vendorName ? `${userName} (${vendorName})` : userName,
      priority: (t.priority || 'MEDIUM') as SupportTicket['priority'],
      status: (t.status || 'OPEN') as SupportTicket['status'],
      createdAt: t.createdAt || new Date().toISOString(),
    }
  })

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }
      case 'HIGH':
        return { background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74' }
      case 'LOW':
        return { background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }
      default:
        return { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
    }
  }

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket # & Subject',
      className: 'primary-cell',
      cell: (t) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setSelectedTicketId(t.id)
            setModalOpen(true)
          }}
        >
          <strong style={{ display: 'block', color: 'var(--primary)' }}>{t.ticketNumber}</strong>
          <span className="subtle" style={{ display: 'block', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.subject}
          </span>
        </div>
      ),
    },
    {
      header: 'Requester',
      cell: (t) => (
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{t.userName}</span>
          <span className="subtle" style={{ fontSize: '11px' }}>{t.category}</span>
        </div>
      ),
    },
    {
      header: 'Priority',
      cell: (t) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            ...getPriorityBadgeStyle(t.priority),
          }}
        >
          {t.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (t) => (
        <StatusBadge
          status={
            t.status === 'RESOLVED'
              ? 'Delivered'
              : t.status === 'IN_PROGRESS'
              ? 'Processing'
              : t.status === 'CLOSED'
              ? 'Cancelled'
              : 'Pending'
          }
        />
      ),
    },
    {
      header: 'Date',
      cell: (t) => <span className="subtle">{formatDateTime(t.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (t) => (
        <button
          type="button"
          className="button secondary"
          style={{ padding: '4px 10px', fontSize: '11px' }}
          onClick={() => {
            setSelectedTicketId(t.id)
            setModalOpen(true)
          }}
        >
          Manage
        </button>
      ),
    },
  ]

  const filterControls = (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="select-button"
        style={{ fontSize: '12px', height: '36px', padding: '0 8px' }}
      >
        <option value="ALL">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="select-button"
        style={{ fontSize: '12px', height: '36px', padding: '0 8px' }}
      >
        <option value="ALL">All Categories</option>
        <option value="PRODUCTS">Products & Catalog</option>
        <option value="ORDERS">Orders & Shipping</option>
        <option value="FINANCE">Finance & Payouts</option>
        <option value="VERIFICATION">Verification & KYC</option>
        <option value="STORE">Store & Account</option>
        <option value="POLICIES">Policies</option>
        <option value="OTHER">Other</option>
      </select>
    </div>
  )

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
        filterControls={filterControls}
        searchFilter={(t, query) =>
          (t.ticketNumber || '').toLowerCase().includes(query.toLowerCase()) ||
          t.subject.toLowerCase().includes(query.toLowerCase()) ||
          (t.userName || '').toLowerCase().includes(query.toLowerCase())
        }
      />

      <SupportTicketDetailModal
        ticketId={selectedTicketId}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedTicketId(null)
          refetch()
        }}
      />
    </>
  )
}

