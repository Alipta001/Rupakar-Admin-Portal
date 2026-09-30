'use client'

import React, { useState } from 'react'
import { Vendor, VendorBankAccount, VendorDocument } from '@/types/vendor'
import { VendorStatusBadge } from './vendor-status-badge'
import { formatINR } from '@/lib/utils/formatters'
import {
  useGetVendorBankAccountQuery,
  useVerifyVendorBankMutation,
  useRejectVendorBankMutation,
  useGetVendorDocumentsQuery,
  useApproveVendorDocumentMutation,
  useRejectVendorDocumentMutation,
} from '@/redux/api/adminApi'

function BankVerificationBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    VERIFIED: { label: 'Verified', bg: '#e6f5ec', color: '#2d7a50' },
    PENDING: { label: 'Pending', bg: '#fff8e5', color: '#9c7a00' },
    REJECTED: { label: 'Rejected', bg: '#fcecea', color: '#c0392b' },
  }
  const s = map[status] ?? { label: status, bg: '#f0efee', color: '#6b6560' }
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '20px',
        background: s.bg,
        color: s.color,
        letterSpacing: '0.02em',
        display: 'inline-block',
      }}
    >
      {s.label}
    </span>
  )
}

function BankSection({
  vendorId,
  bankFromDetail,
}: {
  vendorId: string
  bankFromDetail: VendorBankAccount | null | undefined
}) {
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const { data: bankFromQuery, isLoading } = useGetVendorBankAccountQuery(vendorId, {
    skip: bankFromDetail !== undefined,
  })

  const bank = bankFromDetail !== undefined ? bankFromDetail : bankFromQuery

  const [verifyBank, { isLoading: verifying }] = useVerifyVendorBankMutation()
  const [rejectBank, { isLoading: rejecting }] = useRejectVendorBankMutation()

  const handleVerify = async () => {
    try {
      await verifyBank({ id: vendorId }).unwrap()
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to verify bank account')
    }
  }

  const handleReject = async () => {
    try {
      await rejectBank({ id: vendorId, reason: rejectReason.trim() || undefined }).unwrap()
      setRejectMode(false)
      setRejectReason('')
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to reject bank account')
    }
  }

  if (isLoading && bankFromDetail === undefined) {
    return (
      <div style={{ marginTop: '20px', padding: '12px', background: '#faf9f7', borderRadius: '8px', fontSize: '12px', color: '#827b72' }}>
        Loading bank details…
      </div>
    )
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Bank Account
        </span>
        {bank && <BankVerificationBadge status={bank.verificationStatus} />}
      </div>

      {!bank ? (
        <div style={{ fontSize: '12px', color: '#827b72', padding: '10px', background: '#faf9f7', borderRadius: '6px', textAlign: 'center' }}>
          No bank account submitted yet
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', background: '#faf9f7', padding: '12px', borderRadius: '8px' }}>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Account Holder</span>
              <strong>{bank.accountHolderName || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Bank Name</span>
              <strong>{bank.bankName || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Account Number</span>
              <strong style={{ fontFamily: 'monospace' }}>{bank.maskedAccountNumber || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>IFSC Code</span>
              <strong style={{ fontFamily: 'monospace' }}>{bank.ifscCode || '—'}</strong>
            </div>
            {bank.branchName && (
              <div>
                <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Branch</span>
                <span>{bank.branchName}</span>
              </div>
            )}
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Account Type</span>
              <span>{bank.accountType || '—'}</span>
            </div>
            {bank.submittedAt && (
              <div>
                <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Submitted</span>
                <span>{new Date(bank.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
            {bank.verificationStatus === 'VERIFIED' && bank.verifiedAt && (
              <div>
                <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Verified On</span>
                <span>{new Date(bank.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
            {bank.verificationStatus === 'REJECTED' && bank.rejectionReason && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Rejection Reason</span>
                <span style={{ color: '#c0392b' }}>{bank.rejectionReason}</span>
              </div>
            )}
          </div>

          {/* Admin actions */}
          {bank.verificationStatus !== 'VERIFIED' && !rejectMode && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                className="button"
                style={{ fontSize: '11px', padding: '6px 14px', background: '#2d7a50', color: '#fff', border: 'none' }}
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? 'Verifying…' : '✓ Verify Bank'}
              </button>
              {bank.verificationStatus !== 'REJECTED' && (
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: '11px', padding: '6px 14px', color: '#c0392b', borderColor: '#c0392b' }}
                  onClick={() => setRejectMode(true)}
                >
                  ✕ Reject
                </button>
              )}
              {bank.verificationStatus === 'REJECTED' && (
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: '11px', padding: '6px 14px', color: '#c0392b', borderColor: '#c0392b' }}
                  onClick={() => setRejectMode(true)}
                >
                  Re-reject
                </button>
              )}
            </div>
          )}

          {bank.verificationStatus === 'VERIFIED' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: '11px', padding: '6px 14px', color: '#c0392b', borderColor: '#c0392b' }}
                onClick={() => setRejectMode(true)}
              >
                ✕ Revoke Verification
              </button>
            </div>
          )}

          {rejectMode && (
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Rejection reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '12px',
                  border: '1px solid #e9e5df',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="button"
                  style={{ fontSize: '11px', padding: '6px 14px', background: '#c0392b', color: '#fff', border: 'none' }}
                  onClick={handleReject}
                  disabled={rejecting}
                >
                  {rejecting ? 'Rejecting…' : 'Confirm Reject'}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                  onClick={() => { setRejectMode(false); setRejectReason('') }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DocumentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    APPROVED: { label: 'Approved', bg: '#e6f5ec', color: '#2d7a50' },
    PENDING: { label: 'Pending', bg: '#fff8e5', color: '#9c7a00' },
    REJECTED: { label: 'Rejected', bg: '#fcecea', color: '#c0392b' },
  }
  const s = map[status] ?? { label: status, bg: '#f0efee', color: '#6b6560' }
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '20px',
        background: s.bg,
        color: s.color,
        letterSpacing: '0.02em',
        display: 'inline-block',
      }}
    >
      {s.label}
    </span>
  )
}

function DocumentsSection({ vendorId }: { vendorId: string }) {
  const { data: documents = [], isLoading } = useGetVendorDocumentsQuery(vendorId)
  const [approveDocument, { isLoading: approving }] = useApproveVendorDocumentMutation()
  const [rejectDocument, { isLoading: rejecting }] = useRejectVendorDocumentMutation()
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (docId: string) => {
    try {
      await approveDocument({ vendorId, docId }).unwrap()
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to approve document')
    }
  }

  const handleReject = async (docId: string) => {
    try {
      await rejectDocument({ vendorId, docId, reason: rejectReason.trim() || undefined }).unwrap()
      setRejectingDocId(null)
      setRejectReason('')
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to reject document')
    }
  }

  if (isLoading) {
    return (
      <div style={{ marginTop: '20px', padding: '12px', background: '#faf9f7', borderRadius: '8px', fontSize: '12px', color: '#827b72' }}>
        Loading documents…
      </div>
    )
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Vendor Documents ({documents.length})
        </span>
      </div>

      {documents.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#827b72', padding: '10px', background: '#faf9f7', borderRadius: '6px', textAlign: 'center' }}>
          No documents submitted yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map((doc: VendorDocument) => (
            <div
              key={doc.id}
              style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '12px',
                background: '#faf9f7',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#27231f' }}>
                  {doc.documentType.replaceAll('_', ' ')}
                  {doc.documentNumber && <span style={{ fontWeight: 400, color: '#827b72', marginLeft: '6px' }}>({doc.documentNumber})</span>}
                </span>
                <DocumentStatusBadge status={doc.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#827b72', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span>Submitted: {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                  {doc.verifiedAt && (
                    <span style={{ marginLeft: '10px', color: doc.status === 'APPROVED' ? '#15803d' : '#827b72' }}>
                      · Reviewed: {new Date(doc.verifiedAt).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  {doc.rejectionReason && (
                    <span style={{ display: 'block', color: '#c0392b', marginTop: '2px' }}>Reason: {doc.rejectionReason}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {(doc.viewUrl || doc.downloadUrl) && (
                    <a
                      href={(doc.viewUrl || doc.downloadUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button secondary"
                      style={{ fontSize: '11px', padding: '4px 10px', textDecoration: 'none', display: 'inline-block' }}
                    >
                      View / Download
                    </a>
                  )}
                  {doc.status !== 'APPROVED' && (
                    <button
                      type="button"
                      className="button"
                      style={{ fontSize: '11px', padding: '4px 10px', background: '#2d7a50', color: '#fff', border: 'none' }}
                      onClick={() => handleApprove(doc.id)}
                      disabled={approving}
                    >
                      Approve
                    </button>
                  )}
                  {doc.status !== 'REJECTED' && rejectingDocId !== doc.id && (
                    <button
                      type="button"
                      className="button secondary"
                      style={{ fontSize: '11px', padding: '4px 10px', color: '#c0392b' }}
                      onClick={() => { setRejectingDocId(doc.id); setRejectReason('') }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>

              {rejectingDocId === doc.id && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e9e5df' }}>
                  <input
                    type="text"
                    placeholder="Reason for rejection (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: '11px',
                      border: '1px solid #e9e5df',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="button"
                      style={{ fontSize: '10px', padding: '4px 10px', background: '#c0392b', color: '#fff', border: 'none' }}
                      onClick={() => handleReject(doc.id)}
                      disabled={rejecting}
                    >
                      {rejecting ? 'Rejecting…' : 'Confirm Reject'}
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      style={{ fontSize: '10px', padding: '4px 10px' }}
                      onClick={() => { setRejectingDocId(null); setRejectReason('') }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function VendorDetailModal({
  vendor,
  isOpen,
  onClose,
}: {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !vendor) return null

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
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '580px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>{vendor.businessName || vendor.name}</h2>
            <span style={{ fontSize: '11px', color: '#827b72' }}>ID: {vendor.code} · {vendor.location}</span>
          </div>
          <VendorStatusBadge status={vendor.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Seller Name</span>
            <strong>{vendor.sellerName || vendor.ownerName || '—'}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Business / Store Name</span>
            <strong>{vendor.businessName || vendor.name || '—'}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Seller Email</span>
            <span>{vendor.sellerEmail || vendor.email || '—'}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Seller Phone</span>
            <span>{vendor.sellerPhone || vendor.phone || '—'}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Craft / Category</span>
            <strong>{vendor.category || '—'}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Location</span>
            <span>{vendor.location || '—'}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>GMV</span>
            <strong style={{ color: '#a45138' }}>{formatINR(vendor.grossMerchandiseValue)}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Active Products</span>
            <strong>{vendor.productsCount} items</strong>
          </div>
        </div>

        {/* Bank details section */}
        <BankSection vendorId={vendor.id} bankFromDetail={vendor.bankAccount} />

        {/* Vendor documents section */}
        <DocumentsSection vendorId={vendor.id} />

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
