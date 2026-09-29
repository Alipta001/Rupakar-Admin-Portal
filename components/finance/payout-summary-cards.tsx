'use client'

import React from 'react'
import { useGetFinanceOverviewQuery } from '@/redux/api/adminApi'
import { formatINR } from '@/lib/utils/formatters'
import {
  Wallet,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowDownLeft,
} from 'lucide-react'

export function PayoutSummaryCards() {
  const { data, isLoading } = useGetFinanceOverviewQuery()

  const vendorPayable = data?.vendorPayable?.amount ?? 0
  const eligibleAmount = data?.eligibleSettlements?.amount ?? 0
  const eligibleVendors = data?.eligibleSettlements?.vendorCount ?? 0
  const onHoldAmount = data?.onHoldSettlements?.amount ?? 0
  const onHoldVendors = data?.onHoldSettlements?.vendorCount ?? 0
  const pendingAmount = data?.pendingSettlements?.amount ?? 0
  const pendingVendors = data?.pendingSettlements?.vendorCount ?? 0
  const paidAmount = data?.completedPayouts?.amount ?? 0
  const paidCount = data?.completedPayouts?.count ?? 0

  const cards = [
    {
      label: 'Total Vendor Payable',
      value: formatINR(vendorPayable),
      note: 'All ledger earnings',
      icon: <Wallet size={16} />,
      accent: '#8a5327',
      bg: '#fdfbf9',
      border: '#ebdcd0',
    },
    {
      label: 'Eligible for Settlement',
      value: formatINR(eligibleAmount),
      note: `${eligibleVendors} vendor${eligibleVendors === 1 ? '' : 's'} ready to pay`,
      icon: <CheckCircle2 size={16} />,
      accent: '#15803d',
      bg: '#f7fdf9',
      border: '#dcfce7',
      highlight: true,
    },
    {
      label: 'On Hold',
      value: formatINR(onHoldAmount),
      note: `${onHoldVendors} under review/dispute`,
      icon: <ShieldAlert size={16} />,
      accent: '#b45309',
      bg: '#fffdfa',
      border: '#fef3c7',
    },
    {
      label: 'Pending',
      value: formatINR(pendingAmount),
      note: `${pendingVendors} in 7-day return window`,
      icon: <Clock size={16} />,
      accent: '#4338ca',
      bg: '#fafaff',
      border: '#e0e7ff',
    },
    {
      label: 'Paid',
      value: formatINR(paidAmount),
      note: `${paidCount} payout transfer${paidCount === 1 ? '' : 's'} completed`,
      icon: <ArrowDownLeft size={16} />,
      accent: '#047857',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: '10px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: c.highlight ? '0 2px 8px rgba(21, 128, 61, 0.08)' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#736b63',
              }}
            >
              {c.label}
            </span>
            <div
              style={{
                color: c.accent,
                display: 'grid',
                placeItems: 'center',
                background: '#ffffff',
                padding: '6px',
                borderRadius: '6px',
                border: `1px solid ${c.border}`,
              }}
            >
              {c.icon}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                color: '#27231f',
                lineHeight: 1.2,
              }}
            >
              {isLoading ? '...' : c.value}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#827b72',
                marginTop: '6px',
              }}
            >
              {c.note}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
