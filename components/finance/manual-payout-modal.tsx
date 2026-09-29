'use client'

import React, { useState, useEffect } from 'react'
import { Payout } from '@/types/finance'
import { useConfirmManualPayoutMutation } from '@/redux/api/adminApi'
import { formatINR } from '@/lib/utils/formatters'
import { CheckCircle2, AlertCircle, Building2, CreditCard } from 'lucide-react'

interface ManualPayoutModalProps {
  isOpen: boolean
  payout: Payout | null
  onClose: () => void
  onSuccess: () => void
}

export function ManualPayoutModal({
  isOpen,
  payout,
  onClose,
  onSuccess,
}: ManualPayoutModalProps) {
  const [confirmManualPayout, { isLoading }] = useConfirmManualPayoutMutation()
  const [referenceId, setReferenceId] = useState('')
  const [amount, setAmount] = useState<number | string>('')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (payout) {
      setAmount(payout.netPayable)
      setReferenceId('')
      setNotes('')
      setErrorMessage(null)
    }
  }, [payout])

  if (!isOpen || !payout) return null

  const bank = payout.bankSnapshot || {}
  const maskedAcc = bank.accountNumberMasked || (payout.bankAccountLast4 ? `••••${payout.bankAccountLast4}` : 'On File')
  const ifsc = bank.ifsc || 'Registered'
  const bankName = bank.bankName || 'Vendor Bank'
  const accountHolder = bank.accountHolderName || payout.vendorName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedRef = referenceId.trim()
    if (!trimmedRef) {
      setErrorMessage('Bank reference / UTR number is required.')
      return
    }

    const numAmount = Number(amount)
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please specify a valid positive amount.')
      return
    }

    try {
      await confirmManualPayout({
        id: payout.id,
        referenceId: trimmedRef,
        amount: numAmount,
        notes: notes.trim() || undefined,
      }).unwrap()

      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to confirm manual payout. Please verify details.'
      setErrorMessage(msg)
    }
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
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          borderRadius: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', background: '#f5efe6', borderRadius: '8px', color: '#8a5327' }}>
            <Building2 size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Confirm Bank Transfer</h2>
            <span style={{ fontSize: '12px', color: '#827b72' }}>Payout #{payout.payoutNumber}</span>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '6px',
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Vendor & Bank Details Card */}
        <div
          style={{
            background: '#faf7f2',
            border: '1px solid #e8e2d9',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#827b72' }}>Vendor / Artisan:</span>
            <strong>{payout.vendorName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#827b72' }}>Net Amount Payable:</span>
            <strong style={{ color: '#27231f', fontSize: '15px' }}>{formatINR(payout.netPayable)}</strong>
          </div>
          <div style={{ borderTop: '1px dashed #e2dad0', margin: '8px 0', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#827b72' }}>Account Name:</span>
              <span>{accountHolder}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#827b72' }}>Account Number:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{maskedAcc}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#827b72' }}>Bank / IFSC:</span>
              <span>{bankName} ({ifsc})</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Confirmed Amount (INR) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d4cdc5',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <span style={{ fontSize: '11px', color: '#827b72', marginTop: '3px', display: 'block' }}>
              Must match exact vendor payable amount ({formatINR(payout.netPayable)})
            </span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Bank UTR / Transaction Reference *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UTR123456789012 or IMPS-..."
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d4cdc5',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <span style={{ fontSize: '11px', color: '#827b72', marginTop: '3px', display: 'block' }}>
              Recorded in immutable audit trail and displayed on seller ledger
            </span>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Admin Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Transferred via HDFC Corporate NetBanking"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d4cdc5',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isLoading ? (
                'Confirming...'
              ) : (
                <>
                  <CheckCircle2 size={16} /> Confirm Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
