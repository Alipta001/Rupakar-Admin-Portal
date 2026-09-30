'use client'

import React, { useState } from 'react'
import {
  X,
  Send,
  User,
  Store,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Package,
  ShoppingBag,
} from 'lucide-react'
import { SupportTicket, TicketPriority, TicketStatus } from '@/types/support'
import { useGetSupportTicketByIdQuery, useUpdateSupportTicketMutation } from '@/redux/api/adminApi'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { formatDateTime } from '@/lib/utils/formatters'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

export interface SupportTicketDetailModalProps {
  ticketId: string | null
  isOpen: boolean
  onClose: () => void
}

export function SupportTicketDetailModal({
  ticketId,
  isOpen,
  onClose,
}: SupportTicketDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState('')
  const [targetStatus, setTargetStatus] = useState<TicketStatus | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    tone?: 'primary' | 'danger'
    action: () => Promise<void>
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const {
    data: ticket,
    isLoading,
    error,
    refetch,
  } = useGetSupportTicketByIdQuery(ticketId!, {
    skip: !ticketId || !isOpen,
  })

  const [updateSupportTicket, { isLoading: isUpdating }] = useUpdateSupportTicketMutation()

  if (!isOpen || !ticketId) return null

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return
    setActionError(null)
    setActionSuccess(null)

    try {
      const nextStatus = ticket?.status === 'OPEN' ? 'IN_PROGRESS' : undefined
      await updateSupportTicket({
        ticketId,
        message: replyMessage.trim(),
        status: nextStatus,
      }).unwrap()

      setReplyMessage('')
      setActionSuccess('Reply sent to vendor successfully.')
      refetch()
    } catch (err: any) {
      setActionError(err?.data?.message || err?.message || 'Failed to send reply.')
    }
  }

  const promptStatusChange = (newStatus: TicketStatus) => {
    setActionError(null)
    setActionSuccess(null)

    if (newStatus === 'RESOLVED') {
      setConfirmConfig({
        title: 'Mark Ticket as Resolved?',
        description:
          'This will mark the support ticket as resolved. The seller will be notified that the issue has been addressed.',
        tone: 'primary',
        action: async () => {
          await updateSupportTicket({ ticketId, status: 'RESOLVED' }).unwrap()
          setActionSuccess('Ticket marked as resolved.')
          refetch()
        },
      })
      setConfirmDialogOpen(true)
    } else if (newStatus === 'CLOSED') {
      setConfirmConfig({
        title: 'Close Support Ticket?',
        description:
          'Closing this ticket archives the conversation. Are you sure you want to close this inquiry?',
        tone: 'danger',
        action: async () => {
          await updateSupportTicket({ ticketId, status: 'CLOSED' }).unwrap()
          setActionSuccess('Ticket closed.')
          refetch()
        },
      })
      setConfirmDialogOpen(true)
    } else if (newStatus === 'IN_PROGRESS') {
      setConfirmConfig({
        title: 'Reopen / Start Investigation?',
        description: 'Set this ticket status to In Progress to continue investigating.',
        tone: 'primary',
        action: async () => {
          await updateSupportTicket({ ticketId, status: 'IN_PROGRESS' }).unwrap()
          setActionSuccess('Ticket moved to In Progress.')
          refetch()
        },
      })
      setConfirmDialogOpen(true)
    } else {
      executeDirectStatusChange(newStatus)
    }
  }

  const executeDirectStatusChange = async (newStatus: TicketStatus) => {
    try {
      await updateSupportTicket({ ticketId, status: newStatus }).unwrap()
      setActionSuccess(`Status updated to ${newStatus}.`)
      refetch()
    } catch (err: any) {
      setActionError(err?.data?.message || err?.message || 'Failed to update status.')
    }
  }

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    try {
      await updateSupportTicket({ ticketId, priority: newPriority }).unwrap()
      setActionSuccess(`Priority updated to ${newPriority}.`)
      refetch()
    } catch (err: any) {
      setActionError(err?.data?.message || err?.message || 'Failed to update priority.')
    }
  }

  const getRequesterName = (t?: SupportTicket): string => {
    if (!t) return 'User'
    if (typeof t.userId === 'object' && t.userId !== null) {
      return t.userId.fullName || t.userId.name || 'User'
    }
    return t.userName || 'User'
  }

  const getRequesterEmail = (t?: SupportTicket): string => {
    if (!t) return ''
    if (typeof t.userId === 'object' && t.userId !== null) {
      return t.userId.email || ''
    }
    return t.userEmail || ''
  }

  const getStoreName = (t?: SupportTicket): string | null => {
    if (!t) return null
    if (typeof t.vendorId === 'object' && t.vendorId !== null) {
      return t.vendorId.businessName || t.vendorId.storeName || null
    }
    return t.vendorName || null
  }

  const getAssignedStaffName = (t?: SupportTicket): string => {
    if (!t?.assignedTo) return 'Unassigned'
    if (typeof t.assignedTo === 'object') {
      return t.assignedTo.fullName || t.assignedTo.name || 'Support Staff'
    }
    return String(t.assignedTo)
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(39, 35, 31, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          padding: '16px',
        }}
        onClick={onClose}
      >
        <div
          className="panel"
          style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            borderRadius: '12px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: '#fcfbf9',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '.05em',
                    color: 'var(--primary)',
                    background: 'var(--accent)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {ticket?.ticketNumber || `TCK-${ticketId.slice(-6).toUpperCase()}`}
                </span>
                <span style={{ fontSize: '11px', color: '#827b72' }}>• {ticket?.category}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#27231f' }}>
                {ticket?.subject || 'Support Ticket'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {ticket && (
                <StatusBadge
                  status={
                    ticket.status === 'RESOLVED'
                      ? 'Delivered'
                      : ticket.status === 'IN_PROGRESS'
                      ? 'Processing'
                      : ticket.status === 'CLOSED'
                      ? 'Cancelled'
                      : 'Pending'
                  }
                />
              )}
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
                style={{ padding: '6px 8px', minHeight: '32px' }}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {isLoading && <LoadingState message="Loading ticket details..." />}

            {error && (
              <ErrorState
                title="Could not load ticket details"
                message="Backend returned an error. Please try again."
                onRetry={refetch}
              />
            )}

            {ticket && (
              <>
                {/* Status Notice */}
                {actionError && (
                  <div
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    {actionSuccess}
                  </div>
                )}

                {/* Metadata Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    background: '#f8f7f4',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '14px 16px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#827b72', fontWeight: 600 }}>
                      Requester
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <User size={13} style={{ color: '#827b72' }} />
                      <strong style={{ fontSize: '13px', color: '#27231f' }}>{getRequesterName(ticket)}</strong>
                    </div>
                    {getRequesterEmail(ticket) && (
                      <span style={{ display: 'block', fontSize: '11px', color: '#827b72', marginLeft: '19px' }}>
                        {getRequesterEmail(ticket)}
                      </span>
                    )}
                  </div>

                  {getStoreName(ticket) && (
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#827b72', fontWeight: 600 }}>
                        Artisan / Store
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <Store size={13} style={{ color: '#827b72' }} />
                        <strong style={{ fontSize: '13px', color: '#27231f' }}>{getStoreName(ticket)}</strong>
                      </div>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#827b72', fontWeight: 600 }}>
                      Priority
                    </span>
                    <div style={{ marginTop: '3px' }}>
                      <select
                        value={ticket.priority || 'MEDIUM'}
                        onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                        disabled={isUpdating}
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          background: '#fff',
                          fontWeight: 600,
                        }}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#827b72', fontWeight: 600 }}>
                      Staff Assigned
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <ShieldCheck size={13} style={{ color: '#827b72' }} />
                      <span style={{ fontSize: '12px', color: '#27231f' }}>{getAssignedStaffName(ticket)}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#827b72', fontWeight: 600 }}>
                      Timeline
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <Clock size={13} style={{ color: '#827b72' }} />
                      <span style={{ fontSize: '11px', color: '#827b72' }}>
                        Created {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {(ticket.orderId || ticket.productId) && (
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#827b72', fontWeight: 600 }}>
                        References
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
                        {ticket.orderId && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#5b5249' }}>
                            <ShoppingBag size={11} /> Order: {String(ticket.orderId?._id || ticket.orderId).slice(-8)}
                          </div>
                        )}
                        {ticket.productId && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#5b5249' }}>
                            <Package size={11} /> Product: {String(ticket.productId?._id || ticket.productId).slice(-8)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '12px 16px',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#5b5249' }}>Action Status:</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#f0ede8',
                        color: '#27231f',
                        fontWeight: 600,
                      }}
                    >
                      {ticket.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {ticket.status === 'OPEN' && (
                      <button
                        type="button"
                        className="button secondary"
                        disabled={isUpdating}
                        onClick={() => promptStatusChange('IN_PROGRESS')}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Start Investigation
                      </button>
                    )}

                    {['RESOLVED', 'CLOSED'].includes(ticket.status) ? (
                      <button
                        type="button"
                        className="button secondary"
                        disabled={isUpdating}
                        onClick={() => promptStatusChange('IN_PROGRESS')}
                        style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <RotateCcw size={13} /> Reopen Ticket
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="button primary"
                          disabled={isUpdating}
                          onClick={() => promptStatusChange('RESOLVED')}
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CheckCircle2 size={13} /> Mark Resolved
                        </button>
                        <button
                          type="button"
                          className="button secondary danger-button"
                          disabled={isUpdating}
                          onClick={() => promptStatusChange('CLOSED')}
                          style={{ fontSize: '12px', padding: '6px 12px', color: '#b91c1c' }}
                        >
                          Close Ticket
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Conversation History */}
                <div>
                  <h3
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#27231f',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Conversation History</span>
                    <span style={{ fontSize: '11px', color: '#827b72', fontWeight: 400 }}>
                      ({ticket.messages?.length || 0} messages)
                    </span>
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      padding: '12px',
                      background: '#fcfbf9',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  >
                    {!ticket.messages || ticket.messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#827b72', padding: '24px', fontSize: '12px' }}>
                        No messages recorded yet.
                      </div>
                    ) : (
                      ticket.messages.map((msg, index) => {
                        const isAdmin = msg.senderRole === 'admin'
                        return (
                          <div
                            key={msg._id || msg.id || index}
                            style={{
                              alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                              maxWidth: '85%',
                              background: isAdmin ? 'var(--primary)' : '#ffffff',
                              color: isAdmin ? '#ffffff' : '#27231f',
                              border: isAdmin ? 'none' : '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                marginBottom: '4px',
                                fontSize: '11px',
                                color: isAdmin ? 'rgba(255,255,255,0.85)' : '#827b72',
                              }}
                            >
                              <strong>
                                {isAdmin ? 'Support Team (Admin)' : getRequesterName(ticket)}
                              </strong>
                              <span>{formatDateTime(msg.createdAt)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                              {msg.message}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {ticket.status !== 'CLOSED' ? (
                  <form
                    onSubmit={handleSendReply}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '14px',
                    }}
                  >
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#27231f' }}>
                      Add Official Reply
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write an official response to the artisan/user..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      disabled={isUpdating}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        fontSize: '13px',
                        lineHeight: 1.4,
                        resize: 'vertical',
                        background: '#ffffff',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="submit"
                        className="button primary"
                        disabled={isUpdating || !replyMessage.trim()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          padding: '8px 16px',
                        }}
                      >
                        <Send size={13} />
                        {isUpdating ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    style={{
                      padding: '12px',
                      background: '#f8f7f4',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#827b72',
                    }}
                  >
                    This ticket is closed. Reopen the ticket above to send further messages.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive / Status Changing Actions */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmDialogOpen}
          title={confirmConfig.title}
          description={confirmConfig.description}
          tone={confirmConfig.tone}
          confirmText="Yes, Proceed"
          cancelText="Cancel"
          onConfirm={async () => {
            setConfirmDialogOpen(false)
            if (confirmConfig) {
              try {
                await confirmConfig.action()
              } catch (err: any) {
                setActionError(err?.data?.message || err?.message || 'Action failed.')
              }
            }
          }}
          onCancel={() => setConfirmDialogOpen(false)}
        />
      )}
    </>
  )
}
