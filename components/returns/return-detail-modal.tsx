'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Package,
  ShieldAlert,
  Store,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { AdminReturn } from '@/types/return'
import { ReturnStatusBadge } from './return-status-badge'
import { formatINR, formatDateTime } from '@/lib/utils/formatters'
import {
  useAdminDisputeDecisionMutation,
  useAdminResolveReturnMutation,
  useAdminExecuteReturnRefundMutation,
  useAdminHandleCodPayoutMutation,
  useAdminCreateReplacementMutation,
  useAdminSubmitReturnDispositionMutation,
} from '@/redux/api/adminApi'

export interface ReturnDetailModalProps {
  returnData: AdminReturn | null
  isOpen?: boolean
  onClose?: () => void
  onSuccess?: () => void
  isPage?: boolean
}

export function ReturnDetailModal({
  returnData,
  isOpen = true,
  onClose,
  onSuccess,
  isPage = false,
}: ReturnDetailModalProps) {
  const [disputeDecision, setDisputeDecision] = useState<'UPHOLD_CUSTOMER' | 'UPHOLD_SELLER' | 'REQUEST_MORE_INFO'>('UPHOLD_CUSTOMER')
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeAdminNotes, setDisputeAdminNotes] = useState('')
  const [disputeError, setDisputeError] = useState<string | null>(null)

  const [resolutionAction, setResolutionAction] = useState<'RETURN_REFUND' | 'REPLACEMENT' | 'REJECT_RETURN'>('RETURN_REFUND')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolutionError, setResolutionError] = useState<string | null>(null)

  const [refundNotes, setRefundNotes] = useState('')
  const [refundError, setRefundError] = useState<string | null>(null)
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null)

  const [codReference, setCodReference] = useState('')
  const [codNotes, setCodNotes] = useState('')
  const [codFailureReason, setCodFailureReason] = useState('')
  const [codError, setCodError] = useState<string | null>(null)
  const [codSuccess, setCodSuccess] = useState<string | null>(null)

  const [replacementError, setReplacementError] = useState<string | null>(null)
  const [replacementSuccess, setReplacementSuccess] = useState<string | null>(null)

  const [dispositionCategory, setDispositionCategory] = useState<'RESTOCKABLE' | 'DAMAGED' | 'DEFECTIVE' | 'UNSALEABLE' | 'MISSING_PARTS' | 'WRONG_ITEM' | 'AUTHENTICITY_HOLD'>('RESTOCKABLE')
  const [dispositionNotes, setDispositionNotes] = useState('')
  const [dispositionError, setDispositionError] = useState<string | null>(null)
  const [dispositionSuccess, setDispositionSuccess] = useState<string | null>(null)

  const [submitDispute, { isLoading: isSubmittingDispute }] = useAdminDisputeDecisionMutation()
  const [submitResolution, { isLoading: isSubmittingResolution }] = useAdminResolveReturnMutation()
  const [executeRefund, { isLoading: isExecutingRefund }] = useAdminExecuteReturnRefundMutation()
  const [handleCodPayout, { isLoading: isHandlingCodPayout }] = useAdminHandleCodPayoutMutation()
  const [createReplacementOrder, { isLoading: isCreatingReplacement }] = useAdminCreateReplacementMutation()
  const [submitDisposition, { isLoading: isSubmittingDisposition }] = useAdminSubmitReturnDispositionMutation()

  if (!returnData || (!isPage && !isOpen)) return null

  const isDisputed = returnData.status === 'DISPUTED'
  const isEligibleForResolution =
    returnData.status === 'INSPECTION_PASSED' ||
    returnData.status === 'APPROVED' ||
    (returnData.dispute && (returnData.dispute.decision === 'UPHOLD_CUSTOMER' || returnData.dispute.status === 'UPHELD_CUSTOMER'))

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDisputeError(null)

    if (!disputeReason.trim()) {
      setDisputeError('Decision reason is required for dispute arbitration.')
      return
    }

    try {
      await submitDispute({
        id: returnData._id,
        decision: disputeDecision,
        decisionReason: disputeReason.trim(),
        adminNotes: disputeAdminNotes.trim() || undefined,
      }).unwrap()

      setDisputeReason('')
      setDisputeAdminNotes('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setDisputeError(err?.message || err?.data?.message || 'Failed to submit dispute decision.')
    }
  }

  const handleResolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResolutionError(null)

    try {
      await submitResolution({
        id: returnData._id,
        resolution: resolutionAction,
        notes: resolutionNotes.trim() || undefined,
      }).unwrap()

      setResolutionNotes('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setResolutionError(err?.message || err?.data?.message || 'Failed to submit return resolution.')
    }
  }

  const handleDispositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDispositionError(null)
    setDispositionSuccess(null)

    const isRestockable = dispositionCategory === 'RESTOCKABLE'
    const items = (returnData.items || []).map((it) => ({
      returnItemId: it._id,
      disposition: dispositionCategory,
      restockableQuantity: isRestockable ? (it.quantity || 1) : 0,
      nonRestockableQuantity: isRestockable ? 0 : (it.quantity || 1),
      notes: dispositionNotes.trim() || undefined,
    }))

    try {
      await submitDisposition({
        id: returnData._id,
        items,
        notes: dispositionNotes.trim() || undefined,
      }).unwrap()

      setDispositionSuccess('Inventory disposition committed successfully. Restockable items incremented in inventory.')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setDispositionError(err?.message || err?.data?.message || 'Failed to submit inventory disposition.')
    }
  }

  const handleExecutePrepaidRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    setRefundError(null)
    setRefundSuccess(null)
    try {
      await executeRefund({
        id: returnData._id,
        notes: refundNotes.trim() || undefined,
      }).unwrap()
      setRefundSuccess('Prepaid refund successfully initiated with Razorpay.')
      setRefundNotes('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setRefundError(err?.message || err?.data?.message || 'Failed to execute prepaid refund.')
    }
  }

  const handleInitiateCodPayout = async () => {
    setCodError(null)
    setCodSuccess(null)
    try {
      await handleCodPayout({
        id: returnData._id,
        action: 'INITIATE_PAYOUT',
        notes: codNotes.trim() || undefined,
      }).unwrap()
      setCodSuccess('COD payout marked as processing.')
      setCodNotes('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setCodError(err?.message || err?.data?.message || 'Failed to initiate COD payout.')
    }
  }

  const handleCompleteCodPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodError(null)
    setCodSuccess(null)
    if (!codReference.trim()) {
      setCodError('Transaction reference / UTR is required to mark COD payout completed.')
      return
    }
    try {
      await handleCodPayout({
        id: returnData._id,
        action: 'COMPLETE_PAYOUT',
        reference: codReference.trim(),
        notes: codNotes.trim() || undefined,
      }).unwrap()
      setCodSuccess('COD payout successfully recorded as completed.')
      setCodReference('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setCodError(err?.message || err?.data?.message || 'Failed to record COD payout.')
    }
  }

  const handleFailCodPayout = async () => {
    setCodError(null)
    setCodSuccess(null)
    if (!codFailureReason.trim()) {
      setCodError('Failure reason is required.')
      return
    }
    try {
      await handleCodPayout({
        id: returnData._id,
        action: 'FAIL_PAYOUT',
        failureReason: codFailureReason.trim(),
      }).unwrap()
      setCodSuccess('COD payout recorded as failed.')
      setCodFailureReason('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setCodError(err?.message || err?.data?.message || 'Failed to record COD payout failure.')
    }
  }

  const calc = returnData.calculatedRefund
  const refundAmount = returnData.resolution?.calculatedRefundAmount ?? returnData.refundDetails?.amount ?? calc?.amount ?? 0
  const isCod = returnData.order?.paymentMethod === 'cod'
  const isEligibleForRefundPanel =
    [
      'APPROVED_FOR_REFUND',
      'REFUND_PENDING',
      'REFUND_PROCESSING',
      'REFUNDED',
      'REFUND_FAILED',
      'MANUAL_PAYOUT_PENDING',
      'MANUAL_PAYOUT_PROCESSING',
    ].includes(returnData.status) || returnData.resolution?.action === 'RETURN_REFUND'

  const content = (
    <div
      className="panel"
      style={{
        width: '100%',
        maxWidth: isPage ? '100%' : '820px',
        maxHeight: isPage ? 'none' : '90vh',
        overflowY: isPage ? 'visible' : 'auto',
        padding: '28px',
        position: 'relative',
        boxShadow: isPage ? 'none' : undefined,
        border: isPage ? '1px solid #e9e5df' : undefined,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Return {returnData.returnNumber}</h2>
            <ReturnStatusBadge status={returnData.status} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#827b72' }}>
            Order: <strong>{returnData.order?.orderNumber || returnData.orderId}</strong> • Placed on {returnData.order?.createdAt ? formatDateTime(returnData.order.createdAt) : '—'}
          </p>
        </div>
        {!isPage && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: 'none', color: '#827b72', cursor: 'pointer', padding: '4px' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
      </div>

        {/* 2-Column Parties Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#fcfbf9', border: '1px solid #e9e5df', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a45138', marginBottom: '6px' }}>
              <User size={15} />
              <strong style={{ fontSize: '12px' }}>Customer Details</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#4a443e', lineHeight: 1.6 }}>
              <div><strong>Name:</strong> {returnData.customer?.name || 'Customer'}</div>
              <div><strong>Email:</strong> {returnData.customer?.email || '—'}</div>
              {returnData.customer?.phone && <div><strong>Phone:</strong> {returnData.customer.phone}</div>}
              {returnData.order?.shippingAddress && (
                <div style={{ marginTop: '4px', color: '#827b72', fontSize: '10px' }}>
                  Ship to: {returnData.order.shippingAddress.city}, {returnData.order.shippingAddress.state} {returnData.order.shippingAddress.pincode}
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fcfbf9', border: '1px solid #e9e5df', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#45815a', marginBottom: '6px' }}>
              <Store size={15} />
              <strong style={{ fontSize: '12px' }}>Vendor Details</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#4a443e', lineHeight: 1.6 }}>
              <div><strong>Store:</strong> {returnData.vendor?.storeName || returnData.vendor?.businessName || 'Artisan Seller'}</div>
              <div><strong>Email:</strong> {returnData.vendor?.email || '—'}</div>
              <div><strong>Payment Method:</strong> {returnData.order?.paymentMethod || 'Razorpay / Prepaid'}</div>
              <div><strong>Payment Status:</strong> {returnData.order?.paymentStatus || 'Captured'}</div>
            </div>
          </div>
        </div>

        {/* Returned Items */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={15} /> Returned Items
          </h3>
          <div style={{ border: '1px solid #e9e5df', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead style={{ background: '#f8f6f2', borderBottom: '1px solid #e9e5df' }}>
                <tr>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6d655d' }}>Product</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#6d655d' }}>Qty</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#6d655d' }}>Unit Price</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#6d655d' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {returnData.items && returnData.items.length > 0 ? (
                  returnData.items.map((it, idx) => (
                    <tr key={it._id || idx} style={{ borderBottom: '1px solid #f2eee8' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <strong>{it.productSnapshot?.title || it.title || it.productName || 'Handcrafted Item'}</strong>
                        {it.productSnapshot?.sku && (
                          <span style={{ display: 'block', fontSize: '10px', color: '#827b72' }}>SKU: {it.productSnapshot.sku}</span>
                        )}
                        {it.returnReason && (
                          <span style={{ display: 'block', fontSize: '10px', color: '#a45138', marginTop: '2px' }}>Reason: {it.returnReason}</span>
                        )}
                        {it.disposition && (
                          <span style={{ display: 'block', fontSize: '10px', color: '#276738', marginTop: '2px', fontWeight: 600 }}>
                            Disposition: {it.disposition.disposition} (Restocked: {it.disposition.restockableQuantity}, Non-restockable: {it.disposition.nonRestockableQuantity})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatINR(it.unitPrice)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}><strong>{formatINR(it.lineTotal)}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#827b72' }}>No item details available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#6d655d' }}>
            <strong>Customer Reason / Comments:</strong> {returnData.reason} {returnData.description ? `— ${returnData.description}` : ''}
          </div>
        </div>

        {/* Section 6 & 7: Proportional Refund Breakdown (Read-Only) */}
        <div style={{ background: '#f7f6f3', border: '1px solid #e2ddd5', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#7a7168' }}>
              Authoritative Proportional Refund Calculation (Read-Only)
            </span>
            <span style={{ fontSize: '10px', background: '#eaf4eb', color: '#45815a', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
              Backend Proportional Engine
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '10px' }}>
            <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#827b72' }}>Item Subtotal</span>
              <strong style={{ fontSize: '13px', color: '#332e29' }}>
                {formatINR(calc?.breakdown?.itemSubtotal ?? (returnData.items || []).reduce((s, i) => s + (i.lineTotal || 0), 0))}
              </strong>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#827b72' }}>Discount Adjustment</span>
              <strong style={{ fontSize: '13px', color: '#a45138' }}>
                - {formatINR(calc?.breakdown?.discountAdjustment ?? 0)}
              </strong>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#827b72' }}>Tax Adjustment</span>
              <strong style={{ fontSize: '13px', color: '#45815a' }}>
                + {formatINR(calc?.breakdown?.taxAdjustment ?? 0)}
              </strong>
            </div>

            <div style={{ background: '#fff', border: '2px solid #a45138', borderRadius: '6px', padding: '10px' }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#a45138', fontWeight: 600 }}>Authoritative Refund</span>
              <strong style={{ fontSize: '15px', color: '#a45138' }}>
                {formatINR(refundAmount)}
              </strong>
            </div>
          </div>

          <p style={{ margin: '10px 0 0', fontSize: '10px', color: '#827b72', lineHeight: 1.4 }}>
            * Note: Refund amount is derived strictly from returned item quantities, proportional discount distributions, and taxes. Manual override is prohibited for financial safety. COD returns are kept in safe pending manual state.
          </p>
        </div>

        {/* Seller Inspection Details */}
        {returnData.inspection && returnData.inspection.result && (
          <div style={{ background: '#fcfbf9', border: '1px solid #e9e5df', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {returnData.inspection.result === 'PASSED' ? (
                <CheckCircle2 size={16} color="#45815a" />
              ) : (
                <XCircle size={16} color="#b33927" />
              )}
              Seller Inspection Result: {returnData.inspection.result} ({returnData.inspection.condition || 'STANDARD'})
            </h4>
            <div style={{ fontSize: '11px', color: '#554e47' }}>
              <strong>Seller Inspection Notes:</strong> {returnData.inspection.notes || 'No specific notes recorded by seller.'}
            </div>
          </div>
        )}

        {/* Phase 10: Inventory Disposition & Restock Outcome */}
        {returnData.disposition && returnData.disposition.status && (
          <div style={{ background: '#f5faf6', border: '1px solid #d4edd9', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#276738' }}>
              <CheckCircle2 size={16} color="#276738" />
              Inventory Disposition & Restock: {returnData.disposition.status}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px', marginTop: '6px' }}>
              <div>
                <span style={{ display: 'block', color: '#6d655d', fontSize: '10px' }}>Total Restockable Qty</span>
                <strong style={{ color: '#276738', fontSize: '13px' }}>{returnData.disposition.totalRestockableQuantity ?? 0} units</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6d655d', fontSize: '10px' }}>Total Non-Restockable Qty</span>
                <strong style={{ color: '#a45138', fontSize: '13px' }}>{returnData.disposition.totalNonRestockableQuantity ?? 0} units</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#6d655d', fontSize: '10px' }}>Disposed At</span>
                <span style={{ color: '#332e29' }}>{returnData.disposition.disposedAt ? formatDateTime(returnData.disposition.disposedAt) : '—'}</span>
              </div>
            </div>
            {returnData.disposition.notes && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#4a443e' }}>
                <strong>Disposition Notes:</strong> {returnData.disposition.notes}
              </div>
            )}
          </div>
        )}

        {/* Phase 10: Admin Inventory Disposition & Restock Action Form */}
        {(returnData.status === 'INSPECTION_PASSED' || returnData.status === 'DISPOSITION_PENDING') &&
          (!returnData.disposition || returnData.disposition.status !== 'COMPLETED') && (
            <div style={{ background: '#f5faf6', border: '1px solid #d4edd9', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#276738', marginBottom: '10px' }}>
                <CheckCircle2 size={16} />
                <strong style={{ fontSize: '12px' }}>Phase 10: Controlled Inventory Disposition & Restocking</strong>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#554e47', lineHeight: 1.5 }}>
                Inspection has passed. Select disposition for returned units to authorize server-enforced atomic restocking or mark items non-restockable.
              </p>
              {dispositionError && (
                <div style={{ background: '#fdf2f0', border: '1px solid #f6c8c2', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#b33927', marginBottom: '12px' }}>
                  {dispositionError}
                </div>
              )}
              {dispositionSuccess && (
                <div style={{ background: '#eaf4eb', border: '1px solid #cce5cf', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#45815a', marginBottom: '12px' }}>
                  {dispositionSuccess}
                </div>
              )}
              <form onSubmit={handleDispositionSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                      Disposition Category
                    </label>
                    <select
                      value={dispositionCategory}
                      onChange={(e) => setDispositionCategory(e.target.value as any)}
                      style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '6px 8px', fontSize: '11px' }}
                    >
                      <option value="RESTOCKABLE">RESTOCKABLE (Atomic Restock)</option>
                      <option value="DAMAGED">DAMAGED (Non-restockable)</option>
                      <option value="DEFECTIVE">DEFECTIVE (Non-restockable)</option>
                      <option value="UNSALEABLE">UNSALEABLE (Non-restockable)</option>
                      <option value="MISSING_PARTS">MISSING PARTS (Non-restockable)</option>
                      <option value="WRONG_ITEM">WRONG ITEM (Non-restockable)</option>
                      <option value="AUTHENTICITY_HOLD">AUTHENTICITY HOLD (Hold)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                      Disposition Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inspected and verified in pristine condition, returned to active inventory."
                      value={dispositionNotes}
                      onChange={(e) => setDispositionNotes(e.target.value)}
                      style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '6px 8px', fontSize: '11px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSubmittingDisposition}
                    className="button primary"
                    style={{ background: '#276738', borderColor: '#276738', padding: '6px 14px', fontSize: '11px' }}
                  >
                    {isSubmittingDisposition ? 'Processing...' : 'Authorize & Commit Disposition'}
                  </button>
                </div>
              </form>
            </div>
          )}

        {/* Seller Dispute Information */}
        {returnData.dispute && (returnData.status === 'DISPUTED' || returnData.dispute.reason || returnData.dispute.decision) && (
          <div style={{ background: '#fdf9f7', border: '1px solid #ecd8d1', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a45138', marginBottom: '8px' }}>
              <ShieldAlert size={16} />
              <strong style={{ fontSize: '12px' }}>Seller Dispute Details (Status: {returnData.dispute.status || 'PENDING_ADMIN_REVIEW'})</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#4a443e', lineHeight: 1.5 }}>
              <div><strong>Dispute Reason:</strong> {returnData.dispute.reason || 'Not specified'}</div>
              <div><strong>Description:</strong> {returnData.dispute.description || 'No detailed description'}</div>
              {returnData.dispute.evidence && returnData.dispute.evidence.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Seller Evidence Attachments:</strong>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {returnData.dispute.evidence.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#a45138', background: '#fff', border: '1px solid #e9e5df', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}
                      >
                        Evidence #{i + 1} <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Already Decided Dispute */}
              {returnData.dispute.decision && (
                <div style={{ marginTop: '12px', background: '#fff', border: '1px solid #d9d2c9', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ color: '#45815a', fontWeight: 600, fontSize: '11px' }}>
                    Admin Arbitration Decision: {returnData.dispute.decision}
                  </div>
                  <div><strong>Decision Reason:</strong> {returnData.dispute.decisionReason}</div>
                  {returnData.dispute.adminNotes && <div><strong>Admin Notes:</strong> {returnData.dispute.adminNotes}</div>}
                  {returnData.dispute.decidedAt && (
                    <div style={{ fontSize: '10px', color: '#827b72', marginTop: '4px' }}>
                      Decided on {formatDateTime(returnData.dispute.decidedAt)} by Admin {returnData.dispute.decidedBy}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Admin Dispute Arbitration Controls (When Status is DISPUTED) */}
        {isDisputed && (
          <div style={{ background: '#fff', border: '2px solid #a45138', borderRadius: '8px', padding: '18px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#a45138', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Admin Dispute Arbitration Controls
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#827b72' }}>
              As administrator, review the customer return request and seller inspection dispute evidence to make an authoritative decision. This decision is strictly auditable.
            </p>

            {disputeError && (
              <div style={{ background: '#fdf2f0', border: '1px solid #f5c2bc', color: '#b33927', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '12px' }}>
                {disputeError}
              </div>
            )}

            <form onSubmit={handleDisputeSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <label
                  style={{
                    border: `1px solid ${disputeDecision === 'UPHOLD_CUSTOMER' ? '#a45138' : '#e9e5df'}`,
                    background: disputeDecision === 'UPHOLD_CUSTOMER' ? '#fbf6f4' : '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="disputeDecision"
                      value="UPHOLD_CUSTOMER"
                      checked={disputeDecision === 'UPHOLD_CUSTOMER'}
                      onChange={() => setDisputeDecision('UPHOLD_CUSTOMER')}
                    />
                    <strong style={{ fontSize: '11px' }}>A. Uphold Customer</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: '#827b72' }}>Inspection dispute rejected; approve customer return for resolution.</span>
                </label>

                <label
                  style={{
                    border: `1px solid ${disputeDecision === 'UPHOLD_SELLER' ? '#a45138' : '#e9e5df'}`,
                    background: disputeDecision === 'UPHOLD_SELLER' ? '#fbf6f4' : '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="disputeDecision"
                      value="UPHOLD_SELLER"
                      checked={disputeDecision === 'UPHOLD_SELLER'}
                      onChange={() => setDisputeDecision('UPHOLD_SELLER')}
                    />
                    <strong style={{ fontSize: '11px' }}>B. Uphold Seller</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: '#827b72' }}>Inspection failure verified; reject customer return request.</span>
                </label>

                <label
                  style={{
                    border: `1px solid ${disputeDecision === 'REQUEST_MORE_INFO' ? '#a45138' : '#e9e5df'}`,
                    background: disputeDecision === 'REQUEST_MORE_INFO' ? '#fbf6f4' : '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="disputeDecision"
                      value="REQUEST_MORE_INFO"
                      checked={disputeDecision === 'REQUEST_MORE_INFO'}
                      onChange={() => setDisputeDecision('REQUEST_MORE_INFO')}
                    />
                    <strong style={{ fontSize: '11px' }}>C. More Information</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: '#827b72' }}>Request additional documentation from seller or customer.</span>
                </label>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                  Arbitration Decision Reason *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Seller photographic evidence confirmed item was damaged by customer..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                  Internal Admin Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional arbitration context for audit logs..."
                  value={disputeAdminNotes}
                  onChange={(e) => setDisputeAdminNotes(e.target.value)}
                  style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="button primary"
                  style={{ padding: '8px 16px', fontSize: '11px' }}
                >
                  {isSubmittingDispute ? 'Recording Decision...' : 'Authorise Dispute Decision'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Section 5: Admin Return Final Business Resolution (When Eligible) */}
        {isEligibleForResolution && (
          <div style={{ background: '#fff', border: '1px solid #3c7951', borderRadius: '8px', padding: '18px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#2d6540', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Final Business Resolution Controls
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#6d655d' }}>
              Determine the final business outcome for this return. Authoritative proportional refund will be prepared without executing arbitrary payouts or modifying inventory.
            </p>

            {resolutionError && (
              <div style={{ background: '#fdf2f0', border: '1px solid #f5c2bc', color: '#b33927', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '12px' }}>
                {resolutionError}
              </div>
            )}

            <form onSubmit={handleResolutionSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <label
                  style={{
                    border: `1px solid ${resolutionAction === 'RETURN_REFUND' ? '#3c7951' : '#e9e5df'}`,
                    background: resolutionAction === 'RETURN_REFUND' ? '#f4faf5' : '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="resolutionAction"
                      value="RETURN_REFUND"
                      checked={resolutionAction === 'RETURN_REFUND'}
                      onChange={() => setResolutionAction('RETURN_REFUND')}
                    />
                    <strong style={{ fontSize: '11px', color: '#2d6540' }}>RETURN_REFUND</strong>
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: '#6d655d', marginTop: '3px' }}>
                    Approve for Proportional Refund ({formatINR(refundAmount)})
                  </span>
                </label>

                <label
                  style={{
                    border: `1px solid ${resolutionAction === 'REPLACEMENT' ? '#3c7951' : '#e9e5df'}`,
                    background: resolutionAction === 'REPLACEMENT' ? '#f4faf5' : '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="resolutionAction"
                      value="REPLACEMENT"
                      checked={resolutionAction === 'REPLACEMENT'}
                      onChange={() => setResolutionAction('REPLACEMENT')}
                    />
                    <strong style={{ fontSize: '11px', color: '#2d6540' }}>REPLACEMENT</strong>
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: '#6d655d', marginTop: '3px' }}>
                    Mark as Replacement Pending
                  </span>
                </label>

                <label
                  style={{
                    border: `1px solid ${resolutionAction === 'REJECT_RETURN' ? '#3c7951' : '#e9e5df'}`,
                    background: resolutionAction === 'REJECT_RETURN' ? '#f4faf5' : '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="resolutionAction"
                      value="REJECT_RETURN"
                      checked={resolutionAction === 'REJECT_RETURN'}
                      onChange={() => setResolutionAction('REJECT_RETURN')}
                    />
                    <strong style={{ fontSize: '11px', color: '#2d6540' }}>REJECT_RETURN</strong>
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: '#6d655d', marginTop: '3px' }}>
                    Reject Return After Inspection
                  </span>
                </label>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                  Resolution Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Return inspection passed, authorizing proportional customer refund."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmittingResolution}
                  className="button primary"
                  style={{ background: '#3c7951', borderColor: '#3c7951', padding: '8px 16px', fontSize: '11px' }}
                >
                  {isSubmittingResolution ? 'Resolving...' : 'Commit Final Resolution'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Phase 5: Financial Execution & Refund Payout */}
        {isEligibleForRefundPanel && (
          <div style={{ background: '#fdfbf7', border: '1px solid #dfd8cb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #ede8de', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#88422e' }}>
                {isCod ? <Banknote size={18} /> : <CreditCard size={18} />}
                <strong style={{ fontSize: '13px' }}>
                  {isCod ? 'Phase 5: Cash on Delivery (COD) Payout Foundation' : 'Phase 5: Prepaid Refund Execution (Razorpay)'}
                </strong>
              </div>
              <ReturnStatusBadge status={returnData.status} />
            </div>

            {/* Read-Only Financial & Gateway Attributes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#827b72', marginBottom: '2px' }}>Authoritative Refund</span>
                <strong style={{ fontSize: '14px', color: '#88422e' }}>
                  {formatINR(refundAmount)}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#827b72', marginBottom: '2px' }}>Payment Method</span>
                <strong style={{ fontSize: '12px', color: '#332e29' }}>
                  {isCod ? 'Cash on Delivery' : 'Prepaid (Razorpay)'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#827b72', marginBottom: '2px' }}>Provider / Payout Ref</span>
                <strong style={{ fontSize: '11px', color: '#332e29', wordBreak: 'break-all' }}>
                  {returnData.refundDetails?.providerRefundId || returnData.manualPayout?.reference || '—'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#827b72', marginBottom: '2px' }}>Execution Date</span>
                <strong style={{ fontSize: '11px', color: '#554e47' }}>
                  {returnData.refundDetails?.processedAt
                    ? formatDateTime(returnData.refundDetails.processedAt)
                    : returnData.manualPayout?.paidAt
                    ? formatDateTime(returnData.manualPayout.paidAt)
                    : 'Pending execution'}
                </strong>
              </div>
            </div>

            {/* Feedback Notifications */}
            {refundSuccess && (
              <div style={{ background: '#f2f8f4', border: '1px solid #c7e3d0', color: '#2d6540', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '12px' }}>
                {refundSuccess}
              </div>
            )}
            {refundError && (
              <div style={{ background: '#fdf2f0', border: '1px solid #f5c2bc', color: '#b33927', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '12px' }}>
                {refundError}
              </div>
            )}
            {codSuccess && (
              <div style={{ background: '#f2f8f4', border: '1px solid #c7e3d0', color: '#2d6540', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '12px' }}>
                {codSuccess}
              </div>
            )}
            {codError && (
              <div style={{ background: '#fdf2f0', border: '1px solid #f5c2bc', color: '#b33927', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '12px' }}>
                {codError}
              </div>
            )}

            {/* Prepaid Execution Controls */}
            {!isCod && (
              <div>
                {['APPROVED_FOR_REFUND', 'REFUND_FAILED'].includes(returnData.status) && (
                  <form onSubmit={handleExecutePrepaidRefund} style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                        Admin Execution Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Authorized Razorpay gateway refund for approved return."
                        value={refundNotes}
                        onChange={(e) => setRefundNotes(e.target.value)}
                        style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#827b72' }}>
                        * Authoritative amount of {formatINR(refundAmount)} will be dispatched to Razorpay. Cannot be modified.
                      </span>
                      <button
                        type="submit"
                        disabled={isExecutingRefund}
                        className="button primary"
                        style={{ background: '#88422e', borderColor: '#88422e', padding: '8px 16px', fontSize: '11px' }}
                      >
                        {isExecutingRefund
                          ? 'Executing Refund...'
                          : returnData.status === 'REFUND_FAILED'
                          ? 'Retry Razorpay Refund'
                          : 'Execute Prepaid Refund (Razorpay)'}
                      </button>
                    </div>
                  </form>
                )}

                {['REFUND_PENDING', 'REFUND_PROCESSING'].includes(returnData.status) && (
                  <div style={{ background: '#fdf8f0', border: '1px solid #f2e2c4', padding: '12px', borderRadius: '6px', fontSize: '11px', color: '#8c6114' }}>
                    <strong>Refund In Progress:</strong> Payment provider request has been submitted. Awaiting authoritative webhook confirmation from Razorpay.
                  </div>
                )}

                {returnData.status === 'REFUNDED' && (
                  <div style={{ background: '#f2f8f4', border: '1px solid #c7e3d0', padding: '12px', borderRadius: '6px', fontSize: '11px', color: '#2d6540' }}>
                    <strong>Refund Completed:</strong> Authoritative payment refund confirmed by provider. Provider ID: {returnData.refundDetails?.providerRefundId || 'N/A'}.
                  </div>
                )}
              </div>
            )}

            {/* COD Manual Payout Controls */}
            {isCod && (
              <div>
                {/* Customer Masked Payout Details */}
                <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '12px', marginBottom: '14px' }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '6px' }}>
                    Customer Payout Destination
                  </span>
                  {returnData.payoutDetails && returnData.payoutDetails.method ? (
                    <div style={{ fontSize: '11px', color: '#332e29', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div>
                        <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Method</span>
                        <strong>{returnData.payoutDetails.method}</strong>
                      </div>
                      {returnData.payoutDetails.method === 'UPI' ? (
                        <div>
                          <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>UPI ID</span>
                          <strong>{returnData.payoutDetails.upiId}</strong>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Account Holder</span>
                            <strong>{returnData.payoutDetails.accountHolderName}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Masked Account #</span>
                            <strong>{returnData.payoutDetails.maskedAccountNumber || '****'}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>IFSC Code</span>
                            <strong>{returnData.payoutDetails.ifscCode}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Bank Name</span>
                            <strong>{returnData.payoutDetails.bankName || '—'}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#8c6114' }}>
                      Customer has not yet submitted their UPI ID or bank account details.
                    </span>
                  )}
                </div>

                {/* COD Admin State Actions */}
                {['APPROVED_FOR_REFUND', 'MANUAL_PAYOUT_PENDING', 'REFUND_FAILED'].includes(returnData.status) && (
                  <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                        Payout Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Finance team queuing manual NEFT/UPI transfer."
                        value={codNotes}
                        onChange={(e) => setCodNotes(e.target.value)}
                        style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleInitiateCodPayout}
                        disabled={isHandlingCodPayout}
                        className="button primary"
                        style={{ background: '#3c7951', borderColor: '#3c7951', padding: '8px 16px', fontSize: '11px' }}
                      >
                        {isHandlingCodPayout ? 'Initiating...' : 'Mark Payout Processing'}
                      </button>
                    </div>
                  </div>
                )}

                {returnData.status === 'MANUAL_PAYOUT_PROCESSING' && (
                  <div style={{ background: '#fff', border: '1px solid #e9e5df', borderRadius: '6px', padding: '14px' }}>
                    <form onSubmit={handleCompleteCodPayout} style={{ marginBottom: '14px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a443e', marginBottom: '4px' }}>
                          Transaction Reference / UTR Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. UTR1234567890 or UPI Ref ID"
                          value={codReference}
                          onChange={(e) => setCodReference(e.target.value)}
                          style={{ width: '100%', border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          disabled={isHandlingCodPayout}
                          className="button primary"
                          style={{ background: '#2d6540', borderColor: '#2d6540', padding: '8px 16px', fontSize: '11px' }}
                        >
                          {isHandlingCodPayout ? 'Recording...' : 'Mark Payout Completed'}
                        </button>
                      </div>
                    </form>

                    <div style={{ borderTop: '1px solid #f0ede8', paddingTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#88422e', marginBottom: '4px' }}>
                        Or Mark Payout Failed
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Reason (e.g. Invalid beneficiary IFSC)"
                          value={codFailureReason}
                          onChange={(e) => setCodFailureReason(e.target.value)}
                          style={{ flex: 1, border: '1px solid #dcd7ce', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}
                        />
                        <button
                          type="button"
                          onClick={handleFailCodPayout}
                          disabled={isHandlingCodPayout}
                          className="button secondary"
                          style={{ color: '#b33927', borderColor: '#f5c2bc', padding: '8px 14px', fontSize: '11px' }}
                        >
                          Fail Payout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {returnData.status === 'REFUNDED' && (
                  <div style={{ background: '#f2f8f4', border: '1px solid #c7e3d0', padding: '12px', borderRadius: '6px', fontSize: '11px', color: '#2d6540' }}>
                    <strong>COD Manual Payout Completed:</strong> Transaction reference: {returnData.manualPayout?.reference || 'N/A'}.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phase 6: Replacement Order Foundation */}
        {(returnData.resolution?.action === 'REPLACEMENT' ||
          returnData.status === 'REPLACEMENT_PENDING' ||
          Boolean(returnData.replacement)) && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a' }}>
                <Package size={18} />
                <strong style={{ fontSize: '13px' }}>
                  Phase 6: Replacement Order Foundation
                </strong>
              </div>
              <span
                style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {returnData.replacement?.status || 'REPLACEMENT_APPROVED'}
              </span>
            </div>

            {/* Replacement Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Replacement ID
                </span>
                <strong style={{ fontSize: '11px', color: '#1e293b' }}>
                  {returnData.replacement?.replacementNumber || 'Pending Creation'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Replacement Order #
                </span>
                <strong style={{ fontSize: '11px', color: '#2563eb' }}>
                  {returnData.replacement?.replacementOrderNumber || '—'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Approved Quantity
                </span>
                <strong style={{ fontSize: '12px', color: '#1e293b' }}>
                  {returnData.replacement?.quantity ?? returnData.items?.[0]?.quantity ?? 1} item(s)
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Fulfillment Status
                </span>
                <strong style={{ fontSize: '11px', color: '#047857' }}>
                  {returnData.replacement?.vendorOrderStatus || returnData.replacement?.fulfillmentStatus || 'Awaiting Seller'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Package Info
                </span>
                <strong style={{ fontSize: '11px', color: '#475569' }}>
                  {returnData.replacement?.packageInfo?.weight
                    ? `${returnData.replacement.packageInfo.weight} kg (${returnData.replacement.packageInfo.length}×${returnData.replacement.packageInfo.width}×${returnData.replacement.packageInfo.height} cm)`
                    : 'Awaiting Packaging'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Carrier Logistics
                </span>
                <strong style={{ fontSize: '11px', color: returnData.replacement?.shipment?.trackingNumber ? '#2563eb' : '#64748b' }}>
                  {returnData.replacement?.shipment?.carrier
                    ? `${returnData.replacement.shipment.carrier} (${returnData.replacement.shipment.provider || 'carrier'})`
                    : 'Preparing Shipment'}
                </strong>
                {returnData.replacement?.shipment?.trackingNumber && (
                  <span style={{ display: 'block', fontSize: '10px', color: '#047857', marginTop: '2px', fontFamily: 'monospace' }}>
                    AWB: {returnData.replacement.shipment.trackingNumber}
                  </span>
                )}
                {returnData.replacement?.shipment?.providerShipmentId && (
                  <span style={{ display: 'block', fontSize: '9px', color: '#64748b', marginTop: '1px' }}>
                    Provider Shipment ID: {returnData.replacement.shipment.providerShipmentId}
                  </span>
                )}
                {returnData.replacement?.shipment?.pickupStatus && (
                  <span style={{ display: 'block', fontSize: '9px', color: '#475569', marginTop: '1px' }}>
                    Pickup: {returnData.replacement.shipment.pickupStatus}
                  </span>
                )}
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Seller Store
                </span>
                <strong style={{ fontSize: '11px', color: '#1e293b' }}>
                  {returnData.vendor?.storeName || returnData.vendor?.businessName || 'Assigned Seller'}
                </strong>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  Created At
                </span>
                <strong style={{ fontSize: '11px', color: '#475569' }}>
                  {returnData.replacement?.createdAt
                    ? formatDateTime(returnData.replacement.createdAt)
                    : returnData.resolution?.resolvedAt
                    ? formatDateTime(returnData.resolution.resolvedAt)
                    : '—'}
                </strong>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {replacementError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  marginBottom: '12px',
                }}
              >
                {replacementError}
              </div>
            )}
            {replacementSuccess && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  marginBottom: '12px',
                }}
              >
                {replacementSuccess}
              </div>
            )}

            {/* Replacement Order Creation Trigger (if not already created) */}
            {!returnData.replacement && (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ fontSize: '11px', color: '#1e293b' }}>
                    Replacement Approved & Pending Order Creation
                  </strong>
                  <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    Inventory will be reserved atomically without any additional customer charge.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setReplacementError(null)
                    setReplacementSuccess(null)
                    try {
                      await createReplacementOrder({ id: returnData._id }).unwrap()
                      setReplacementSuccess('Replacement order created successfully!')
                      if (onSuccess) onSuccess()
                    } catch (err: any) {
                      setReplacementError(
                        err?.message || err?.data?.message || 'Failed to create replacement order.',
                      )
                    }
                  }}
                  disabled={isCreatingReplacement}
                  className="button primary"
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    padding: '8px 16px',
                    fontSize: '11px',
                  }}
                >
                  {isCreatingReplacement ? 'Creating Order...' : 'Generate Replacement Order'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status History & Audit Trail */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Audit Trail & Status History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {returnData.statusHistory && returnData.statusHistory.length > 0 ? (
              returnData.statusHistory.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fcfbf9',
                    border: '1px solid #ece7df',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <strong style={{ color: '#332e29' }}>{h.status}</strong>
                    <span style={{ color: '#827b72', marginLeft: '6px' }}>
                      by [{h.actorType || 'SYSTEM'}] {h.notes ? `— ${h.notes}` : ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#999188' }}>
                    {h.changedAt ? formatDateTime(h.changedAt) : '—'}
                  </span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '11px', color: '#827b72' }}>Initial request created on {formatDateTime(returnData.createdAt || '')}</span>
            )}
          </div>
        </div>
      </div>
  )

  if (isPage) {
    return content
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(39, 35, 31, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      {content}
    </div>
  )
}
