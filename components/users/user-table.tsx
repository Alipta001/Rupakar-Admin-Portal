'use client'

import React, { useState } from 'react'
import { DataTable, Column } from '@/components/shared/data-table'
import { User } from '@/types/user'
import { UserStatusBadge } from './user-status-badge'
import { UserActions } from './user-actions'
import { UserFilters } from './user-filters'
import { formatINR, formatDate } from '@/lib/utils/formatters'
import { useGetUsersQuery, useUpdateUserStatusMutation } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export function UserTable() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error, refetch } = useGetUsersQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  const [updateUserStatus] = useUpdateUserStatusMutation()

  const handleToggleStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus({
        id: userId,
        status: newStatus.toUpperCase(),
      }).unwrap()
    } catch (err) {
      console.error('Failed to update user status:', err)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading customers from Rupakar API..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load customer list"
        message="Could not retrieve customers from backend. Please verify your connection."
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

  const users: User[] = rawList.map((u: any) => ({

    id: u.id || u._id || '',
    name: u.name || 'Customer',
    email: u.email || '',
    phone: u.phone,
    ordersCount: u.ordersCount ?? 0,
    totalSpent: u.totalSpent ?? 0,
    status: (u.status === 'ACTIVE' || u.status === 'Active' ? 'Active' : 'Suspended') as User['status'],
    verified: u.verified ?? true,
    registeredDate: u.registeredDate || u.createdAt ? formatDate(u.registeredDate || u.createdAt) : 'Recent',
  }))

  const columns: Column<User>[] = [
    {
      header: 'Customer',
      className: 'primary-cell',
      cell: (user) => (
        <>
          <strong>{user.name}</strong>
          <span className="subtle">{user.email}</span>
        </>
      ),
    },
    {
      header: 'Orders',
      cell: (user) => `${user.ordersCount} orders`,
    },
    {
      header: 'Lifetime Spend',
      cell: (user) => <strong>{formatINR(user.totalSpent)}</strong>,
    },
    {
      header: 'Status',
      cell: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      header: '',
      cell: (user) => (
        <UserActions
          userId={user.id}
          status={user.status}
          onToggleStatus={handleToggleStatus}
        />
      ),
    },
  ]

  return (
    <DataTable<User>
      columns={columns}
      data={users}
      keyExtractor={(user) => user.id}
      searchPlaceholder="Search customers by name or email..."
      filterControls={
        <UserFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      }
      onSearchChange={setSearchQuery}
      searchFilter={(user, query) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      }
    />
  )
}
