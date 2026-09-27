import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { OrderStatus } from '@/types/order'

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  return <StatusBadge status={status} />
}
