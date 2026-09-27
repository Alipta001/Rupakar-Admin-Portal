import React from 'react'

export interface StatusBadgeProps {
  status: string
  tone?: 'success' | 'warning' | 'info' | 'neutral' | 'danger'
  className?: string
}

export function StatusBadge({ status, tone, className = '' }: StatusBadgeProps) {
  let resolvedTone = tone

  if (!resolvedTone) {
    const s = status.toLowerCase()
    if (s === 'delivered' || s === 'approved' || s === 'active' || s === 'completed' || s === 'captured' || s === 'in stock') {
      resolvedTone = 'success'
    } else if (s === 'processing' || s === 'under review' || s === 'pending' || s === 'low stock' || s === 'ready to process') {
      resolvedTone = 'warning'
    } else if (s === 'shipped' || s === 'confirmed') {
      resolvedTone = 'info'
    } else if (s === 'suspended' || s === 'rejected' || s === 'out of stock' || s === 'failed' || s === 'cancelled') {
      resolvedTone = 'neutral' // Falls back cleanly or styled
    } else {
      resolvedTone = 'neutral'
    }
  }

  return (
    <span className={`status status-${resolvedTone} ${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  )
}
