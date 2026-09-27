import React from 'react'
import { Box } from 'lucide-react'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  icon = <Box size={28} />,
  action,
}: EmptyStateProps) {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      color: '#827b72',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: '#f2ebe5',
        color: '#a45138',
        display: 'grid',
        placeItems: 'center',
      }}>
        {icon}
      </div>
      <div>
        <strong style={{ display: 'block', fontSize: '14px', color: '#342e28' }}>{title}</strong>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#827b72' }}>{description}</p>
      </div>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  )
}
