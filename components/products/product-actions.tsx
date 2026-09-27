'use client'

import React, { useState } from 'react'
import { CheckCircle2, MoreHorizontal, XCircle } from 'lucide-react'

export interface ProductActionsProps {
  productId: string
  status: string
  onUpdateStatus?: (productId: string, status: string) => void
}

export function ProductActions({ productId, status, onUpdateStatus }: ProductActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="row-more"
        onClick={() => setOpen(!open)}
        aria-label="Product actions"
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            zIndex: 10,
            background: '#fff',
            border: '1px solid #e9e5df',
            borderRadius: '6px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            padding: '4px',
            minWidth: '140px',
          }}
        >
          {status !== 'Approved' && (
            <button
              type="button"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 0,
                background: 'transparent',
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: '4px',
                color: '#45815a',
                textAlign: 'left',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Approved')
              }}
            >
              <CheckCircle2 size={14} /> Approve item
            </button>
          )}

          {status !== 'Rejected' && (
            <button
              type="button"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 0,
                background: 'transparent',
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: '4px',
                color: '#c93b2b',
                textAlign: 'left',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Rejected')
              }}
            >
              <XCircle size={14} /> Reject
            </button>
          )}
        </div>
      )}
    </div>
  )
}
