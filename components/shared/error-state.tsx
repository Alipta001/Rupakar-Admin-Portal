import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
}: ErrorStateProps) {
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
        background: '#fbeae8',
        color: '#c93b2b',
        display: 'grid',
        placeItems: 'center',
      }}>
        <AlertCircle size={28} />
      </div>
      <div>
        <strong style={{ display: 'block', fontSize: '14px', color: '#342e28' }}>{title}</strong>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#827b72' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="button secondary"
          style={{ marginTop: '8px' }}
          onClick={onRetry}
        >
          <RotateCcw size={14} /> Retry
        </button>
      )}
    </div>
  )
}
