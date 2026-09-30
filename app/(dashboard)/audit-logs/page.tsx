'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { AuditLog } from '@/types/audit'
import { formatDateTime } from '@/lib/utils/formatters'
import { useGetAuditLogsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useGetAuditLogsQuery({
    search: searchQuery || undefined,
  })

  if (isLoading) {
    return <LoadingState message="Loading immutable security and mutation audit logs..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load audit logs"
        message="Could not retrieve security audit trails from server."
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

  const logs: AuditLog[] = rawList.map((l: any) => ({
    id: l.id || l._id || '',
    actorName: l.actorName || l.actorId?.name || l.actorEmail || 'Admin',
    actorRole: l.actorRole || 'ADMIN',
    action: l.action || 'ADMIN_ACTION',
    entity: l.entity || l.resource || 'System',
    entityId: l.entityId || l.resourceId || '—',
    createdAt: l.createdAt || new Date().toISOString(),
  }))

  const columns: Column<AuditLog>[] = [
    {
      header: 'Admin & Role',
      className: 'primary-cell',
      cell: (l) => (
        <>
          <strong>{l.actorName}</strong>
          <span className="subtle">{l.actorRole}</span>
        </>
      ),
    },
    {
      header: 'Action',
      cell: (l) => <code>{l.action}</code>,
    },
    {
      header: 'Target Resource',
      cell: (l) => (
        <>
          <span>{l.entity}</span>
          <span className="subtle">{l.entityId}</span>
        </>
      ),
    },
    {
      header: 'Timestamp',
      cell: (l) => <span className="subtle">{formatDateTime(l.createdAt)}</span>,
    },
    {
      header: 'Status',
      cell: () => <StatusBadge status="Completed" />,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Security & Governance"
        title="Audit Logs"
        description="Immutable trail of administrative mutations, approvals, moderation, and finance actions."
      />
      <DataTable<AuditLog>
        columns={columns}
        data={logs}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search audit logs by admin, action, or resource..."
        onSearchChange={setSearchQuery}
        searchFilter={(l, query) =>
          (l.actorName || '').toLowerCase().includes(query.toLowerCase()) ||
          (l.action || '').toLowerCase().includes(query.toLowerCase()) ||
          (l.entityId || '').toLowerCase().includes(query.toLowerCase())
        }
      />
    </>
  )
}
