import React from 'react'

export interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading operational data...' }: LoadingStateProps) {
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
        width: '32px',
        height: '32px',
        border: '3px solid #e9e5df',
        borderTopColor: '#a45138',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '11px', color: '#827b72' }}>{message}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
