import React from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { ReturnStatus } from '@/types/return'

const STATUS_LABELS: Record<string, { label: string; tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger' }> = {
  REQUESTED: { label: 'Requested', tone: 'info' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'warning' },
  APPROVED: { label: 'Approved', tone: 'info' },
  RETURN_RECEIVED: { label: 'Received by Seller', tone: 'info' },
  INSPECTION_PENDING: { label: 'Inspection Pending', tone: 'warning' },
  INSPECTION_PASSED: { label: 'Inspection Passed', tone: 'success' },
  INSPECTION_FAILED: { label: 'Inspection Failed', tone: 'danger' },
  DISPOSITION_PENDING: { label: 'Disposition Pending', tone: 'warning' },
  DISPOSITION_COMPLETED: { label: 'Disposition Completed', tone: 'success' },
  DISPUTED: { label: 'Disputed', tone: 'danger' },
  APPROVED_FOR_REFUND: { label: 'Approved for Refund', tone: 'success' },
  REFUND_PENDING: { label: 'Refund Pending', tone: 'warning' },
  REFUND_PROCESSING: { label: 'Refund Processing', tone: 'warning' },
  REFUNDED: { label: 'Refunded', tone: 'success' },
  REFUND_FAILED: { label: 'Refund Failed', tone: 'danger' },
  MANUAL_PAYOUT_PENDING: { label: 'Manual Payout Pending', tone: 'warning' },
  MANUAL_PAYOUT_PROCESSING: { label: 'Manual Payout Processing', tone: 'info' },
  REPLACEMENT_PENDING: { label: 'Replacement Pending', tone: 'info' },
  REPLACEMENT_SHIPPED: { label: 'Replacement Shipped', tone: 'info' },
  REPLACEMENT_DELIVERED: { label: 'Replacement Delivered', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'neutral' },
  REJECTED_AFTER_INSPECTION: { label: 'Rejected (Inspection)', tone: 'neutral' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
}

export function ReturnStatusBadge({ status }: { status: ReturnStatus | string }) {
  const config = STATUS_LABELS[status] || { label: status, tone: 'neutral' }
  return <StatusBadge status={config.label} tone={config.tone} />
}
