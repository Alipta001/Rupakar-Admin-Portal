'use client'

import React, { useState } from 'react'
import { Archive, CheckCircle2, EyeOff, Globe, MoreHorizontal, XCircle } from 'lucide-react'

export interface ProductActionsProps {
  productId: string
  status: string
  moderationStatus?: string
  onUpdateStatus?: (productId: string, status: string) => void
}

export function ProductActions({ productId, status, moderationStatus, onUpdateStatus }: ProductActionsProps) {
  const [open, setOpen] = useState(false)

  const isApproved = status === 'Approved' || moderationStatus === 'APPROVED'
  const isPublished = status === 'Published' || moderationStatus === 'PUBLISHED'
  const isUnderReview = status === 'Under review' || moderationStatus === 'SUBMITTED' || moderationStatus === 'UNDER_REVIEW'
  const isRejected = status === 'Rejected' || moderationStatus === 'REJECTED'
  const isUnpublished = status === 'Unpublished' || moderationStatus === 'UNPUBLISHED'

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
          {/* Allow publishing if approved or unpublished */}
          {(isApproved || isUnpublished) && !isPublished && (
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
                color: '#1c64f2',
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Published')
              }}
            >
              <Globe size={14} /> Publish item
            </button>
          )}

          {/* Allow unpublishing if currently published */}
          {isPublished && (
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
                color: '#d97706',
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Unpublished')
              }}
            >
              <EyeOff size={14} /> Unpublish item
            </button>
          )}

          {/* Allow approving if under review or rejected */}
          {(isUnderReview || isRejected) && (
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
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Approved')
              }}
            >
              <CheckCircle2 size={14} /> Approve item
            </button>
          )}

          {/* Allow rejecting if not already rejected */}
          {!isRejected && (
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
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Rejected')
              }}
            >
              <XCircle size={14} /> Reject
            </button>
          )}

          {/* Allow archiving if published or unpublished */}
          {(isPublished || isUnpublished) && (
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
                color: '#827b72',
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false)
                onUpdateStatus?.(productId, 'Archived')
              }}
            >
              <Archive size={14} /> Archive
            </button>
          )}
        </div>
      )}
    </div>
  )
}
