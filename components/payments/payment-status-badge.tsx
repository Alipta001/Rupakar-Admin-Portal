import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { PaymentGatewayStatus } from '@/types/payment'

export function PaymentStatusBadge({ status }: { status: PaymentGatewayStatus | string }) {
  return <StatusBadge status={status} />
}
