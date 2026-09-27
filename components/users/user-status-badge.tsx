import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserStatus } from '@/types/user'

export function UserStatusBadge({ status }: { status: UserStatus | string }) {
  return <StatusBadge status={status} />
}
