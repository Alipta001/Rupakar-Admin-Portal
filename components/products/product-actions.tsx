'use client'

import React, { useState } from 'react'
import { Archive, CheckCircle2, EyeOff, Globe, MoreHorizontal, Trash2, XCircle } from 'lucide-react'
import {
  ADMIN_ALLOWED_TRANSITIONS,
  getAdminProductActions,
} from '@/lib/constants/product-transitions'

export { ADMIN_ALLOWED_TRANSITIONS, getAdminProductActions }

export interface ProductActionsProps {
  productId: string
  status: string
  moderationStatus?: string
  allowedTransitions?: string[]
  onUpdateStatus?: (productId: string, status: string) => void
  onDeleteProduct?: (productId: string) => void
}

export function ProductActions({
  productId,
  status,
  moderationStatus,
  allowedTransitions,
  onUpdateStatus,
  onDeleteProduct,
}: ProductActionsProps) {
  const [open, setOpen] = useState(false)

  const capabilities = getAdminProductActions(
    status,
    moderationStatus,
    allowedTransitions
  )

  const {
    canPublish,
    canUnpublish,
    canApprove,
    canReject,
    canArchive,
    canDelete,
    isArchived,
  } = capabilities

  const hasAnyAction =
    canPublish || canUnpublish || canApprove || canReject || canArchive || canDelete

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
            minWidth: '150px',
          }}
        >
          {canPublish && (
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
              <Globe size={14} /> {isArchived ? 'Restore & Publish' : 'Publish item'}
            </button>
          )}

          {canUnpublish && (
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

          {canApprove && (
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

          {canReject && (
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

          {canArchive && (
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

          {canDelete && (
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
                if (
                  window.confirm(
                    'Are you sure you want to permanently delete this rejected product? This action cannot be undone.'
                  )
                ) {
                  onDeleteProduct?.(productId)
                }
              }}
            >
              <Trash2 size={14} /> Delete product
            </button>
          )}

          {!hasAnyAction && (
            <div
              style={{
                padding: '6px 8px',
                fontSize: '11px',
                color: '#827b72',
                fontStyle: 'italic',
              }}
            >
              No actions available
            </div>
          )}
        </div>
      )}
    </div>
  )
}
