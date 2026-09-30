'use client'

import React, { useState, useEffect } from 'react'
import { Payout } from '@/types/finance'
import { useConfirmManualPayoutMutation } from '@/redux/api/adminApi'
import { formatINR } from '@/lib/utils/formatters'
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  X,
} from 'lucide-react'

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
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successConfirmation, setSuccessConfirmation] = useState<string | null>(null)

  const remainingPayable = payout?.netPayable ?? 0
  const alreadyPaid = payout?.alreadyPaidAmount ?? 0
  const totalEligible = payout?.totalPayable ?? (remainingPayable + alreadyPaid)

  useEffect(() => {
    if (payout) {
      setAmount(payout.netPayable)
      setReferenceId('')
      setPaymentDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setErrorMessage(null)
      setSuccessConfirmation(null)
    }
  }, [payout])

  if (!isOpen || !payout) return null

  const bank = payout.bankSnapshot || {}
  const maskedAcc =
    bank.accountNumberMasked ||
    (payout.bankAccountLast4 ? `••••${payout.bankAccountLast4}` : 'On File')
  const ifsc = bank.ifsc || 'Registered IFSC'
  const bankName = bank.bankName || 'Verified Bank Account'
  const accountHolder = bank.accountHolderName || payout.vendorName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedRef = referenceId.trim()
    if (!trimmedRef) {
      setErrorMessage('Bank transaction reference / UTR is mandatory.')
      return
    }

    const numAmount = Number(amount)
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please specify a positive settlement amount greater than zero.')
      return
    }

    if (numAmount > remainingPayable + 0.001) {
      setErrorMessage(`Amount cannot exceed the remaining payable balance of ${formatINR(remainingPayable)}.`)
      return
    }

    try {
      const res: any = await confirmManualPayout({
        id: payout.id,
        referenceId: trimmedRef,
        amount: numAmount,
        paymentDate,
        notes: notes.trim() || undefined,
      }).unwrap()

      const successMsg = `Manual payment of ${formatINR(numAmount)} recorded successfully. UTR: ${trimmedRef}`
      setSuccessConfirmation(successMsg)

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1200)
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        'Failed to confirm manual payout. Duplicate UTR or invalid payout ID.'
      setErrorMessage(msg)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(39, 35, 31, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
          borderRadius: '12px',
          background: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 0,
            color: '#827b72',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '10px',
              background: '#fbf4ee',
              borderRadius: '8px',
              color: '#8a5327',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#27231f' }}>
                Disburse Vendor Settlement
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#f3f4f6',
                  color: '#4b5563',
                  textTransform: 'uppercase',
                }}
              >
                Manual Transfer
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#827b72' }}>
              Vendor: <strong>{payout.vendorName}</strong> {payout.vendorId ? `· ID: ${String(payout.vendorId).slice(-6)}` : ''} · Payout Ref: <strong>{payout.payoutNumber}</strong>
            </span>
          </div>
        </div>

        {/* Current Payable Breakdown Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div style={{ background: '#f9f8f6', border: '1px solid #e8e2d9', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#827b72', textTransform: 'uppercase', fontWeight: 600 }}>Total Eligible</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#27231f', marginTop: '2px' }}>{formatINR(totalEligible)}</div>
          </div>
          <div style={{ background: '#f9f8f6', border: '1px solid #e8e2d9', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#827b72', textTransform: 'uppercase', fontWeight: 600 }}>Already Paid</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>{formatINR(alreadyPaid)}</div>
          </div>
          <div style={{ background: '#fdf8f4', border: '1.5px solid #dca88e', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#8a5327', textTransform: 'uppercase', fontWeight: 700 }}>Remaining Payable</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#8a5327', marginTop: '2px' }}>{formatINR(remainingPayable)}</div>
          </div>
        </div>

        {successConfirmation && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              color: '#15803d',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successConfirmation}</span>
          </div>
        )}

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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Destination Bank Account Snapshot */}
        <div
          style={{
            background: '#faf7f2',
            border: '1px solid #e8e2d9',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '18px',
            fontSize: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e8e2d9',
            }}
          >
            <span style={{ fontWeight: 600, color: '#3d3731', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} color="#15803d" /> Verified Beneficiary Bank Destination
            </span>
            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>Active</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Beneficiary Name</span>
              <strong style={{ color: '#27231f' }}>{accountHolder}</strong>
            </div>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Bank Name</span>
              <strong style={{ color: '#27231f' }}>{bankName}</strong>
            </div>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Account Number</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#27231f' }}>{maskedAcc}</span>
            </div>
            <div>
              <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>IFSC Code</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#27231f' }}>{ifsc}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Amount Transferred (INR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingPayable}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #d4cdc5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#27231f',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '10px', color: '#827b72', marginTop: '3px', display: 'block' }}>
                Remaining payable: {formatINR(remainingPayable)}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #d4cdc5',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#27231f',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '10px', color: '#827b72', marginTop: '3px', display: 'block' }}>
                Actual bank transfer execution date
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Bank UTR / Transaction Reference Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UTR123456789012 or IMPS-987654321"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d4cdc5',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#27231f',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '11px', color: '#827b72', marginTop: '3px', display: 'block' }}>
              Mandatory bank transfer identifier for reconciliation. Must be unique.
            </span>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Internal Transfer Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Transferred via HDFC Corporate NetBanking / IMPS"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d4cdc5',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#27231f',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
              disabled={isLoading}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={isLoading}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isLoading ? (
                'Confirming...'
              ) : (
                <>
                  <CheckCircle2 size={16} /> Confirm Bank Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
