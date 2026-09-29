'use client'

import React, { useState } from 'react'
import {
  useGetEligibleSettlementsQuery,
  useTriggerSettlementBatchMutation,
} from '@/redux/api/adminApi'
import { formatINR } from '@/lib/utils/formatters'
import {
  Coins,
  ChevronDown,
  ChevronUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react'

export function EligibleSettlementsBanner() {
  const { data: eligible = [], isLoading, refetch } = useGetEligibleSettlementsQuery()
  const [triggerBatch, { isLoading: isBatching }] = useTriggerSettlementBatchMutation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (isLoading || !eligible || eligible.length === 0) {
    return null
  }

  const totalEligible = eligible.reduce((acc, curr) => acc + (curr.eligibleAmount || 0), 0)

  const handleBatchExecution = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await triggerBatch({}).unwrap()
      setSuccessMsg(`Successfully created settlement batch for ${eligible.length} vendor(s). Ready for manual bank transfer.`)
      refetch()
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to trigger settlement batch.')
    }
  }

  return (
    <div
      style={{
        background: '#fbf8f3',
        border: '1px solid #e7ded2',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px',
              background: '#8a5327',
              color: '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coins size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#27231f' }}>
                {eligible.length} Vendor{eligible.length > 1 ? 's' : ''} Available for Settlement
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#dcfce7',
                  color: '#15803d',
                }}
              >
                Return Window Expired
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#827b72' }}>
              Total payable:{' '}
              <strong style={{ color: '#27231f', fontSize: '14px' }}>
                {formatINR(totalEligible)}
              </strong>{' '}
              across verified orders.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {isExpanded ? (
              <>
                Hide Details <ChevronUp size={14} />
              </>
            ) : (
              <>
                View Vendors ({eligible.length}) <ChevronDown size={14} />
              </>
            )}
          </button>

          <button
            type="button"
            className="button primary"
            onClick={handleBatchExecution}
            disabled={isBatching}
            style={{
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isBatching ? (
              'Generating Payouts...'
            ) : (
              <>
                <Play size={14} /> Generate Settlement Payouts
              </>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            padding: '8px 12px',
            background: '#ecfdf5',
            border: '1px solid #d1fae5',
            borderRadius: '6px',
            color: '#065f46',
            fontSize: '12px',
          }}
        >
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '6px',
            color: '#b91c1c',
            fontSize: '12px',
          }}
        >
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isExpanded && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e7ded2',
            display: 'grid',
            gap: '8px',
          }}
        >
          {eligible.map((item) => {
            const bank = item.bankDetails
            return (
              <div
                key={item.vendorId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1px solid #ede7df',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <strong>{item.vendorName}</strong>
                  <div style={{ fontSize: '11px', color: '#827b72', marginTop: '2px', display: 'flex', gap: '8px' }}>
                    <span>{item.entryCount} delivered order{item.entryCount > 1 ? 's' : ''}</span>
                    <span>•</span>
                    {bank ? (
                      <span>
                        {bank.bankName || 'Bank'} ({bank.accountNumberMasked || 'Acct on file'} - {bank.ifsc || 'IFSC'})
                      </span>
                    ) : (
                      <span style={{ color: '#d97706' }}>No active bank account</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#27231f', fontSize: '14px' }}>
                    {formatINR(item.eligibleAmount)}
                  </strong>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
