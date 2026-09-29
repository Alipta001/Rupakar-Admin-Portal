'use client'

import React, { useState } from 'react'
import {
  useGetEligibleSettlementsQuery,
  useTriggerSettlementBatchMutation,
} from '@/redux/api/adminApi'
import { EligibleSettlement, Payout } from '@/types/finance'
import { formatINR } from '@/lib/utils/formatters'
import { ManualPayoutModal } from '@/components/finance/manual-payout-modal'
import {
  Coins,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react'

interface VendorsReadyTableProps {
  onPayoutSuccess?: () => void
}

export function VendorsReadyTable({ onPayoutSuccess }: VendorsReadyTableProps) {
  const { data: eligible = [], isLoading, refetch } = useGetEligibleSettlementsQuery()
  const [triggerBatch, { isLoading: isBatching }] = useTriggerSettlementBatchMutation()
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handlePayVendor = async (item: EligibleSettlement) => {
    setErrorMsg(null)
    setSuccessMsg(null)

    // If an existing payout record is already staged in READY status
    if (item.existingPayoutId) {
      const payout: Payout = {
        id: item.existingPayoutId,
        payoutNumber: `PO-${item.existingPayoutId.slice(-6).toUpperCase()}`,
        vendorName: item.vendorName,
        vendorId: item.vendorId,
        grossAmount: item.eligibleAmount,
        commissionAmount: 0,
        netPayable: item.eligibleAmount,
        formattedNetPayable: formatINR(item.eligibleAmount),
        status: 'Ready to process',
        bankAccountLast4: item.bankDetails?.accountNumberMasked
          ? item.bankDetails.accountNumberMasked.slice(-4)
          : '****',
        bankSnapshot: item.bankDetails || undefined,
        rawStatus: 'READY',
        date: item.eligibleSince ? new Date(item.eligibleSince).toLocaleDateString() : 'Ready',
      }
      setSelectedPayout(payout)
      return
    }

    // Otherwise stage a manual settlement payout for this vendor
    setLoadingVendorId(item.vendorId)
    try {
      const res: any = await triggerBatch({ vendorIds: [item.vendorId] }).unwrap()
      const createdList = res?.data?.payouts || res?.payouts || []
      const createdPayout = createdList[0]

      if (createdPayout) {
        const netAmt =
          (createdPayout.netPayablePaise || createdPayout.amountPaise || 0) / 100 ||
          item.eligibleAmount
        const payout: Payout = {
          id: createdPayout._id || createdPayout.id,
          payoutNumber:
            createdPayout.payoutNumber ||
            `PO-${(createdPayout._id || createdPayout.id || '').slice(-6).toUpperCase()}`,
          vendorName: item.vendorName,
          vendorId: item.vendorId,
          grossAmount: netAmt,
          commissionAmount: 0,
          netPayable: netAmt,
          formattedNetPayable: formatINR(netAmt),
          status: 'Ready to process',
          bankAccountLast4: item.bankDetails?.accountNumberMasked
            ? item.bankDetails.accountNumberMasked.slice(-4)
            : '****',
          bankSnapshot: createdPayout.bankSnapshot || item.bankDetails || undefined,
          rawStatus: 'READY',
          date: 'Just now',
        }
        setSelectedPayout(payout)
      } else {
        refetch()
      }
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message || err?.message || 'Failed to stage payout for this vendor.'
      )
    } finally {
      setLoadingVendorId(null)
    }
  }

  const handleBatchAll = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await triggerBatch({}).unwrap()
      setSuccessMsg(
        `Staged settlement payouts for ${eligible.length} eligible vendor(s). Ready for manual bank disbursement.`
      )
      refetch()
      if (onPayoutSuccess) onPayoutSuccess()
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message || err?.message || 'Failed to trigger batch settlement.'
      )
    }
  }

  return (
    <div
      className="panel"
      style={{
        background: '#ffffff',
        border: '1px solid #e7ded2',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header with Title and Batch Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f0ece6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px',
              background: '#fbf4ee',
              color: '#8a5327',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coins size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#27231f',
                  letterSpacing: '-0.3px',
                }}
              >
                Vendors Ready for Settlement
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: eligible.length > 0 ? '#dcfce7' : '#f3f4f6',
                  color: eligible.length > 0 ? '#15803d' : '#6b7280',
                }}
              >
                {eligible.length} Available
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#827b72' }}>
              Delivered orders that have completed the 7-day return protection period without dispute.
            </p>
          </div>
        </div>

        {eligible.length > 0 && (
          <button
            type="button"
            className="button secondary"
            onClick={handleBatchAll}
            disabled={isBatching}
            style={{
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Play size={13} />
            {isBatching ? 'Staging Payouts...' : `Batch All (${eligible.length})`}
          </button>
        )}
      </div>

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '10px 14px',
            background: '#ecfdf5',
            border: '1px solid #d1fae5',
            borderRadius: '6px',
            color: '#065f46',
            fontSize: '12px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '10px 14px',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '6px',
            color: '#b91c1c',
            fontSize: '12px',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Vendors Ready Table */}
      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#827b72', fontSize: '13px' }}>
          Loading eligible vendor settlements...
        </div>
      ) : eligible.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#faf9f7',
            borderRadius: '8px',
            border: '1px dashed #e2dad0',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#f0ece6',
              color: '#8a5327',
              margin: '0 auto 12px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#27231f' }}>
            No Settlements Pending Action
          </h4>
          <p
            style={{
              margin: '6px auto 0',
              fontSize: '12px',
              color: '#827b72',
              maxWidth: '480px',
              lineHeight: 1.5,
            }}
          >
            All delivered orders are either currently within their 7-day customer return protection window or eligible balances have already been disbursed.
          </p>
        </div>
      ) : (
        <div className="table-scroll" style={{ margin: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e9e5df' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  VENDOR NAME
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  ELIGIBLE AMOUNT
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  ORDERS
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  BANK (MASKED)
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  ELIGIBLE SINCE
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  STATUS
                </th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((item) => {
                const bank = item.bankDetails
                const isProcessingThis = loadingVendorId === item.vendorId
                const orders = item.ordersCount || item.entryCount || 1
                const dateStr = item.eligibleSince
                  ? new Date(item.eligibleSince).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Ready'

                return (
                  <tr
                    key={item.vendorId}
                    style={{
                      borderBottom: '1px solid #f2ede6',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* WHO: Vendor Name */}
                    <td style={{ padding: '14px 12px' }}>
                      <strong style={{ fontSize: '13px', color: '#27231f', display: 'block' }}>
                        {item.vendorName}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#827b72' }}>
                        ID: {item.vendorId.slice(-6)}
                      </span>
                    </td>

                    {/* HOW MUCH: Exact Eligible Amount */}
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#15803d',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        {formatINR(item.eligibleAmount)}
                      </span>
                    </td>

                    {/* Orders */}
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          color: '#4b5563',
                        }}
                      >
                        <Layers size={13} color="#9ca3af" />
                        {orders} delivered order{orders > 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* WHERE: Masked Bank Snapshot */}
                    <td style={{ padding: '14px 12px' }}>
                      {bank ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#27231f' }}>
                              {bank.bankName || 'Registered Bank'}
                            </span>
                            <ShieldCheck size={13} color="#15803d" />
                          </div>
                          <div style={{ fontSize: '11px', color: '#827b72', marginTop: '2px', fontFamily: 'monospace' }}>
                            {bank.accountNumberMasked || '••••••••'} • {bank.ifsc || 'IFSC'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={13} /> Bank details pending
                        </span>
                      )}
                    </td>

                    {/* Eligible Since */}
                    <td style={{ padding: '14px 12px', fontSize: '12px', color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#9ca3af" />
                        {dateStr}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: '#dcfce7',
                          color: '#15803d',
                          textTransform: 'uppercase',
                        }}
                      >
                        READY
                      </span>
                    </td>

                    {/* ACTION: Pay Vendor */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="button primary"
                        disabled={isProcessingThis || !bank}
                        onClick={() => handlePayVendor(item)}
                        style={{
                          fontSize: '12px',
                          padding: '6px 14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          minWidth: '110px',
                          justifyContent: 'center',
                        }}
                      >
                        <CreditCard size={14} />
                        {isProcessingThis ? 'Staging...' : 'Pay Vendor'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Payout Modal */}
      <ManualPayoutModal
        isOpen={Boolean(selectedPayout)}
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        onSuccess={() => {
          refetch()
          if (onPayoutSuccess) onPayoutSuccess()
        }}
      />
    </div>
  )
}
