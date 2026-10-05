import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { ShipmentStatus } from '@/types/shipment'

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus | string }) {
  return <StatusBadge status={status} />
}
