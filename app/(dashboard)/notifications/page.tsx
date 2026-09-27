'use client'

import React, { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { AdminNotification } from '@/types/notification'
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: rawNotifications, isLoading, error, refetch } = useGetNotificationsQuery()
  const [markRead] = useMarkNotificationReadMutation()

  if (isLoading) {
    return <LoadingState message="Loading administrative alerts and notifications..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load notifications"
        message="Could not retrieve admin notifications. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const notifications: AdminNotification[] = (rawNotifications || []).map((n: any) => ({
    id: n.id || n._id || '',
    title: n.title || 'System Notification',
    message: n.message || '',
    type: n.type || 'SYSTEM',
    read: n.read || n.isRead || false,
    createdAt: n.createdAt || new Date().toISOString(),
  }))

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => markRead(n.id).unwrap())
      )
    } catch (err) {
      console.error('Failed to mark notifications read:', err)
    }
  }

  const columns: Column<AdminNotification>[] = [
    {
      header: 'Notification',
      className: 'primary-cell',
      cell: (n) => (
        <>
          <strong>{n.title}</strong>
          <span className="subtle">{n.message}</span>
        </>
      ),
    },
    {
      header: 'Category',
      cell: (n) => n.type,
    },
    {
      header: 'Time',
      cell: (n) => <span className="subtle">{new Date(n.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: 'Status',
      cell: (n) => (
        <StatusBadge
          status={n.read ? 'Delivered' : 'Processing'}
          tone={n.read ? 'neutral' : 'info'}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Operations / Alerts"
        title="Notifications"
        description="Review critical operational alerts, system messages, and transaction signals."
        actions={
          <button type="button" className="button secondary" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark all read
          </button>
        }
      />
      <DataTable<AdminNotification>
        columns={columns}
        data={notifications}
        keyExtractor={(n) => n.id}
        searchPlaceholder="Search notifications..."
        onSearchChange={setSearchQuery}
        searchFilter={(n, query) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.message.toLowerCase().includes(query.toLowerCase())
        }
      />
    </>
  )
}
