'use client'

import React from 'react'
import { Filter, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { UserTable } from '@/components/users/user-table'

export default function UsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Marketplace / Customers"
        title="Customers"
        description="Review customer accounts, activity, verification, and spending."
        actions={
          <>
            <button type="button" className="button secondary">
              <Filter size={16} /> Filters
            </button>
            <button type="button" className="button primary">
              <UserPlus size={16} /> Add customer
            </button>
          </>
        }
      />
      <UserTable />
    </>
  )
}
