'use client'

import React, { useState } from 'react'
import { useGetSettlementReadinessOverviewQuery } from '@/redux/api/adminApi'
import { SettlementReadinessVendor } from '@/types/finance'
import { formatINR } from '@/lib/utils/formatters'
import {
  Clock,
  ShieldAlert,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
} from 'lucide-react'

export function NonEligibleVendorsTable() {
  const { data: vendors = [], isLoading } = useGetSettlementReadinessOverviewQuery()
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter only vendors that are NOT ready (i.e. PENDING, ON_HOLD, ACTION_REQUIRED)
  const notReadyVendors = vendors.filter((v) => v.status !== 'READY')

  if (isLoading || notReadyVendors.length === 0) {
    return null
  }

  return (
    <div
      className="panel"
      style={{
        background: '#faf8f5',
        border: '1px solid #ebdcd0',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '24px',
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
              background: '#fef3c7',
              color: '#b45309',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#27231f' }}>
                Pending & In-Review Settlements ({notReadyVendors.length} Vendor{notReadyVendors.length > 1 ? 's' : ''})
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  color: '#92400e',
                }}
              >
                Ineligibility Criteria Active
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#827b72' }}>
              Orders currently protected by the 7-day customer return window or on hold for review.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {isExpanded ? (
            <>
              Hide Breakdown <ChevronUp size={14} />
            </>
          ) : (
            <>
              View Ineligible Reasons ({notReadyVendors.length}) <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid #ebdcd0',
          }}
        >
          <div className="table-scroll" style={{ margin: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e9e5df' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                    VENDOR
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                    PENDING BALANCE
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                    ON HOLD
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                    ORDERS
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                    STATUS
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#827b72', fontWeight: 600 }}>
                    BACKEND INELIGIBILITY REASON
                  </th>
                </tr>
              </thead>
              <tbody>
                {notReadyVendors.map((item) => {
                  let statusBadge = (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                      }}
                    >
                      PENDING
                    </span>
                  )

                  if (item.status === 'ON_HOLD') {
                    statusBadge = (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#fee2e2',
                          color: '#b91c1c',
                        }}
                      >
                        ON HOLD
                      </span>
                    )
                  } else if (item.status === 'ACTION_REQUIRED') {
                    statusBadge = (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#ffedd5',
                          color: '#c2410c',
                        }}
                      >
                        ACTION REQ
                      </span>
                    )
                  }

                  return (
                    <tr
                      key={item.vendorId}
                      style={{
                        borderBottom: '1px solid #f2ede6',
                        background: '#ffffff',
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <strong style={{ fontSize: '13px', color: '#27231f', display: 'block' }}>
                          {item.vendorName}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#827b72' }}>
                          ID: {item.vendorId.slice(-6)}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <strong style={{ fontSize: '13px', color: '#4338ca' }}>
                          {formatINR(item.pendingAmount || 0)}
                        </strong>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '13px', color: item.onHoldAmount > 0 ? '#b91c1c' : '#827b72', fontWeight: item.onHoldAmount > 0 ? 600 : 400 }}>
                          {formatINR(item.onHoldAmount || 0)}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Layers size={13} /> {item.ordersCount} order{item.ordersCount > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>{statusBadge}</td>

                      <td style={{ padding: '12px', maxWidth: '340px' }}>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#4b5563',
                            lineHeight: 1.4,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                          }}
                        >
                          <Info size={14} color="#8a5327" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>
                            {item.ineligibilityReason || 'Settlement criteria under evaluation by backend.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
