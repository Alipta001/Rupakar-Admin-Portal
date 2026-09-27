import React from 'react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(39, 35, 31, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>{title}</h2>
        <p style={{ margin: '0 0 24px', fontSize: '12px', color: '#827b72', lineHeight: 1.5 }}>
          {description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="button secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`button primary ${tone === 'danger' ? 'danger-button' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
