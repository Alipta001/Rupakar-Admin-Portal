'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { CommissionTable } from '@/components/finance/commission-table'
import { CommissionRulesTable } from '@/components/finance/commission-rules-table'
import { Sliders, History } from 'lucide-react'

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules')

  return (
    <>
      <PageHeader
        eyebrow="Finance / Commissions"
        title="Commissions"
        description="Configure tiered price-slab commission rules and audit marketplace splits across Product, Vendor, Category, and Global scopes."
      />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'rules' ? '2px solid #4f46e5' : '2px solid transparent',
            color: activeTab === 'rules' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'rules' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Sliders size={16} /> Commission Rules & Price Slabs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'history' ? '2px solid #4f46e5' : '2px solid transparent',
            color: activeTab === 'history' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'history' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <History size={16} /> Transaction History & Audit
        </button>
      </div>

      {activeTab === 'rules' ? <CommissionRulesTable /> : <CommissionTable />}
    </>
  )
}

