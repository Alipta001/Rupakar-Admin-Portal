import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProductStatus } from '@/types/product'

export function ProductStatusBadge({ status }: { status: ProductStatus | string }) {
  return <StatusBadge status={status} />
}
