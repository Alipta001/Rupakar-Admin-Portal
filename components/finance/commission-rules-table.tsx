'use client'

import React, { useState } from 'react'
import { CommissionConfigRule } from '@/types/finance'
import {
  useGetCommissionConfigsQuery,
  useToggleCommissionConfigMutation,
  useDeleteCommissionConfigMutation,
} from '@/redux/api/adminApi'
import { formatINR } from '@/lib/utils/formatters'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { CommissionRuleModal } from './commission-rule-modal'
import {
  Edit2,
  Trash2,
  Plus,
  Percent,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'

export function CommissionRulesTable() {
  const { data: configs = [], isLoading, error, refetch } = useGetCommissionConfigsQuery()
  const [toggleStatus] = useToggleCommissionConfigMutation()
  const [deleteRule] = useDeleteCommissionConfigMutation()

  const [selectedRule, setSelectedRule] = useState<CommissionConfigRule | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) {
    return <LoadingState message="Loading commission rules from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load commission rules"
        message="Could not retrieve commission configurations. Please check backend connection."
        onRetry={refetch}
      />
    )
  }

  const handleEdit = (rule: CommissionConfigRule) => {
    setSelectedRule(rule)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setSelectedRule(null)
    setIsModalOpen(true)
  }

  const handleToggle = async (id: string) => {
    setActionError(null)
    try {
      await toggleStatus(id).unwrap()
      refetch()
    } catch (err: any) {
      setActionError(err?.data?.message || err?.message || 'Failed to update rule status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission rule?')) return
    setActionError(null)
    try {
      await deleteRule(id).unwrap()
      refetch()
    } catch (err: any) {
      setActionError(err?.data?.message || err?.message || 'Failed to delete commission rule')
    }
  }

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'PRODUCT':
        return { label: 'Product (P1)', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' }
      case 'VENDOR':
        return { label: 'Vendor (P2)', bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' }
      case 'CATEGORY':
        return { label: 'Category (P3)', bg: '#fef3c7', color: '#b45309', border: '#fde68a' }
      case 'GLOBAL':
      default:
        return { label: 'Global (P4)', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
    }
  }

  const getTargetLabel = (rule: CommissionConfigRule) => {
    if (rule.scope === 'GLOBAL') return 'All Marketplace Items (Platform Default)'
    if (rule.scope === 'PRODUCT') {
      return rule.productId?.title || (rule.productId ? `Product (${String(rule.productId).slice(-6)})` : 'Product')
    }
    if (rule.scope === 'VENDOR') {
      return rule.vendorId?.businessName || rule.vendorId?.storeName || (rule.vendorId ? `Vendor (${String(rule.vendorId).slice(-6)})` : 'Vendor')
    }
    if (rule.scope === 'CATEGORY') {
      return rule.categoryId?.name || (rule.categoryId ? `Category (${String(rule.categoryId).slice(-6)})` : 'Category')
    }
    return 'Target'
  }

  return (
    <div>
      {/* Top Banner & Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Active Commission Rules</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Rules are evaluated in order: <strong>PRODUCT</strong> &rarr; <strong>VENDOR</strong> &rarr; <strong>CATEGORY</strong> &rarr; <strong>GLOBAL</strong>. Specific price slabs override base scope rates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Plus size={16} /> Add Commission Rule
        </button>
      </div>

      {actionError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {actionError}
        </div>
      )}

      {/* Rules Table */}
      <div
        style={{
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--color-background, #ffffff)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-muted, #f8fafc)', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Scope & Priority</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Target</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Price Slab</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Commission Rate</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Layers size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>No commission rules configured yet.</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem' }}>
                    Click &ldquo;Add Commission Rule&rdquo; above to set up global or price-slab commissions.
                  </p>
                </td>
              </tr>
            ) : (
              configs.map((c: any) => {
                const badge = getScopeBadge(c.scope)
                const ruleId = c._id || c.id
                const isFixed = c.commissionType === 'FIXED'

                let priceRangeText = 'All Prices'
                if (c.minPrice && c.maxPrice) {
                  priceRangeText = `${formatINR(c.minPrice)} – ${formatINR(c.maxPrice)}`
                } else if (c.minPrice && !c.maxPrice) {
                  priceRangeText = `≥ ${formatINR(c.minPrice)}`
                } else if (!c.minPrice && c.maxPrice) {
                  priceRangeText = `≤ ${formatINR(c.maxPrice)}`
                }

                return (
                  <tr key={ruleId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Scope Badge */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Target */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{getTargetLabel(c)}</div>
                      {c.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                          {c.description}
                        </div>
                      )}
                    </td>

                    {/* Price Slab */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: c.minPrice || c.maxPrice ? '#f0fdf4' : '#f8fafc',
                          color: c.minPrice || c.maxPrice ? '#166534' : '#64748b',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                        }}
                      >
                        {priceRangeText}
                      </span>
                    </td>

                    {/* Commission Rate / Amount */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {isFixed ? `${formatINR(c.fixedAmount || 0)} (Fixed)` : `${c.rate}%`}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {isFixed ? 'Per unit item' : 'Marketplace split'}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(ruleId)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        {c.active ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: '#15803d',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              background: '#dcfce7',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                            }}
                          >
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: '#64748b',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              background: '#f1f5f9',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                            }}
                          >
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          title="Edit Rule"
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            color: '#475569',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ruleId)}
                          title="Delete Rule"
                          style={{
                            border: '1px solid #fecaca',
                            background: '#fff5f5',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            color: '#dc2626',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <CommissionRuleModal
        isOpen={isModalOpen}
        rule={selectedRule}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRule(null)
        }}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
