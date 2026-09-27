'use client'

import React, { useState } from 'react'
import { MoreHorizontal, ShieldAlert, ShieldCheck } from 'lucide-react'

export interface UserActionsProps {
  userId: string
  status: string
  onToggleStatus?: (userId: string, newStatus: string) => void
}

export function UserActions({ userId, status, onToggleStatus }: UserActionsProps) {
  const [open, setOpen] = useState(false)

  const isSuspended = status === 'Suspended'

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="row-more"
        onClick={() => setOpen(!open)}
        aria-label="User actions"
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
              color: isSuspended ? '#45815a' : '#c93b2b',
              textAlign: 'left',
            }}
            onClick={() => {
              setOpen(false)
              onToggleStatus?.(userId, isSuspended ? 'Active' : 'Suspended')
            }}
          >
            {isSuspended ? (
              <>
                <ShieldCheck size={14} /> Reactivate
              </>
            ) : (
              <>
                <ShieldAlert size={14} /> Suspend
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
