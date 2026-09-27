import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { VendorStatus } from '@/types/vendor'

export function VendorStatusBadge({ status }: { status: VendorStatus | string }) {
  return <StatusBadge status={status} />
}
