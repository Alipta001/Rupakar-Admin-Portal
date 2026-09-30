'use client'

import React, { useState, useEffect } from 'react'
import { CommissionConfigRule } from '@/types/finance'
import {
  useCreateCommissionConfigMutation,
  useUpdateCommissionConfigMutation,
  useGetCategoriesQuery,
  useGetVendorsQuery,
  useGetProductsQuery,
} from '@/redux/api/adminApi'
import {
  X,
  AlertCircle,
  CheckCircle2,
  Percent,
  IndianRupee,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react'

interface CommissionRuleModalProps {
  isOpen: boolean
  rule: CommissionConfigRule | null
  onClose: () => void
  onSuccess: () => void
}

export function CommissionRuleModal({
  isOpen,
  rule,
  onClose,
  onSuccess,
}: CommissionRuleModalProps) {
  const [createConfig, { isLoading: isCreating }] = useCreateCommissionConfigMutation()
  const [updateConfig, { isLoading: isUpdating }] = useUpdateCommissionConfigMutation()

  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !isOpen })
  const { data: vendorData } = useGetVendorsQuery({ limit: 100 }, { skip: !isOpen })
  const { data: productData } = useGetProductsQuery({ limit: 100 }, { skip: !isOpen })

  const vendors = Array.isArray(vendorData?.items) ? vendorData.items : []
  const products = Array.isArray(productData?.items) ? productData.items : []

  const [scope, setScope] = useState<'GLOBAL' | 'CATEGORY' | 'VENDOR' | 'PRODUCT'>('GLOBAL')
  const [targetId, setTargetId] = useState<string>('')
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [rate, setRate] = useState<number | string>(10)
  const [fixedAmount, setFixedAmount] = useState<number | string>(0)
  const [minPrice, setMinPrice] = useState<number | string>(0)
  const [maxPrice, setMaxPrice] = useState<number | string>('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (rule) {
      setScope(rule.scope || 'GLOBAL')
      const target =
        rule.scope === 'PRODUCT'
          ? rule.productId?._id || rule.productId
          : rule.scope === 'VENDOR'
          ? rule.vendorId?._id || rule.vendorId
          : rule.scope === 'CATEGORY'
          ? rule.categoryId?._id || rule.categoryId
          : ''
      setTargetId(target ? String(target) : '')
      setCommissionType(rule.commissionType || 'PERCENTAGE')
      setRate(rule.rate ?? 10)
      setFixedAmount(rule.fixedAmount ?? 0)
      setMinPrice(rule.minPrice ?? 0)
      setMaxPrice(rule.maxPrice !== null && rule.maxPrice !== undefined ? rule.maxPrice : '')
      setDescription(rule.description || '')
      setActive(rule.active !== false)
      setErrorMessage(null)
    } else {
      setScope('GLOBAL')
      setTargetId('')
      setCommissionType('PERCENTAGE')
      setRate(10)
      setFixedAmount(0)
      setMinPrice(0)
      setMaxPrice('')
      setDescription('')
      setActive(true)
      setErrorMessage(null)
    }
  }, [rule, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const numMinPrice = Number(minPrice || 0)
    const numMaxPrice = maxPrice !== '' ? Number(maxPrice) : null

    if (numMinPrice < 0) {
      setErrorMessage('Minimum price must be greater than or equal to 0')
      return
    }
    if (numMaxPrice !== null && numMaxPrice <= numMinPrice) {
      setErrorMessage('Maximum price must be strictly greater than minimum price')
      return
    }

    if (commissionType === 'PERCENTAGE') {
      const numRate = Number(rate)
      if (isNaN(numRate) || numRate < 0 || numRate > 100) {
        setErrorMessage('Commission percentage must be between 0% and 100%')
        return
      }
    } else {
      const numFixed = Number(fixedAmount)
      if (isNaN(numFixed) || numFixed < 0) {
        setErrorMessage('Fixed commission amount must be 0 or greater')
        return
      }
    }

    if (scope !== 'GLOBAL' && !targetId) {
      setErrorMessage(`Please select a ${scope.toLowerCase()} target`)
      return
    }

    const payload: any = {
      scope,
      commissionType,
      rate: commissionType === 'PERCENTAGE' ? Number(rate) : 0,
      fixedAmount: commissionType === 'FIXED' ? Number(fixedAmount) : 0,
      minPrice: numMinPrice,
      maxPrice: numMaxPrice,
      description: description.trim(),
      active,
      productId: scope === 'PRODUCT' ? targetId : null,
      vendorId: scope === 'VENDOR' ? targetId : null,
      categoryId: scope === 'CATEGORY' ? targetId : null,
    }

    try {
      if (rule?._id || rule?.id) {
        const id = rule._id || rule.id
        await updateConfig({ id, data: payload }).unwrap()
      } else {
        await createConfig(payload).unwrap()
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to save commission rule'
      setErrorMessage(msg)
    }
  }

  const isSubmitting = isCreating || isUpdating

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--color-background, #ffffff)',
          color: 'var(--color-foreground, #1e293b)',
          borderRadius: '16px',
          maxWidth: '620px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          border: '1px solid var(--color-border, #e2e8f0)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-muted, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Percent size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                {rule ? 'Edit Commission Rule' : 'Add Commission Rule'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
                Configure rate, price range slabs, and scope hierarchy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && (
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scope Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>
              Rule Scope & Priority
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { key: 'PRODUCT', label: 'Product', priority: 'P1 (Highest)' },
                { key: 'VENDOR', label: 'Vendor', priority: 'P2 (High)' },
                { key: 'CATEGORY', label: 'Category', priority: 'P3 (Medium)' },
                { key: 'GLOBAL', label: 'Global', priority: 'P4 (Base)' },
              ].map((s) => {
                const isSelected = scope === s.key
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setScope(s.key as any)
                      setTargetId('')
                    }}
                    style={{
                      padding: '0.625rem 0.5rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: isSelected ? '#eef2ff' : '#ffffff',
                      color: isSelected ? '#4338ca' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</span>
                    <span style={{ fontSize: '0.6875rem', color: isSelected ? '#4f46e5' : '#94a3b8' }}>{s.priority}</span>
                  </button>
                )
              })}
            </div>
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Resolution Priority: <strong>PRODUCT</strong> &rarr; <strong>VENDOR</strong> &rarr; <strong>CATEGORY</strong> &rarr; <strong>GLOBAL</strong>
            </p>
          </div>

          {/* Scope Target Selector */}
          {scope !== 'GLOBAL' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: '#334155' }}>
                Select {scope === 'PRODUCT' ? 'Product' : scope === 'VENDOR' ? 'Vendor' : 'Category'} Target *
              </label>
              {scope === 'CATEGORY' && (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    background: '#ffffff',
                  }}
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c: any) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {scope === 'VENDOR' && (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    background: '#ffffff',
                  }}
                  required
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map((v: any) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.businessName || v.storeName || v.name || 'Vendor'} ({v.storeName || v.email})
                    </option>
                  ))}
                </select>
              )}
              {scope === 'PRODUCT' && (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    background: '#ffffff',
                  }}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p: any) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.title} (₹{p.price})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Price Range Slabs */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: '#334155' }}>
              Price Slab Range (₹)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Minimum Price (₹)
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Maximum Price (₹, optional)
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No upper limit"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.6875rem', color: '#94a3b8' }}>
              Leave max price blank if the rule applies to any price above the minimum.
            </p>
          </div>

          {/* Commission Type & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: '#334155' }}>
                Commission Type
              </label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  background: '#ffffff',
                }}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: '#334155' }}>
                {commissionType === 'PERCENTAGE' ? 'Commission Rate (%)' : 'Fixed Fee (₹)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max={commissionType === 'PERCENTAGE' ? 100 : undefined}
                  step={commissionType === 'PERCENTAGE' ? '0.1' : '1'}
                  value={commissionType === 'PERCENTAGE' ? rate : fixedAmount}
                  onChange={(e) => {
                    if (commissionType === 'PERCENTAGE') setRate(e.target.value)
                    else setFixedAmount(e.target.value)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    paddingRight: '2.5rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.8125rem',
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  {commissionType === 'PERCENTAGE' ? '%' : '₹'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: '#334155' }}>
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Luxury brass tiered slab, Festive promo, Standard artisan fee"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Active Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <input
              type="checkbox"
              id="activeStatus"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="activeStatus" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
              Rule is active and ready for resolution
            </label>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border, #e2e8f0)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: '#4f46e5',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Saving...' : rule ? 'Update Rule' : 'Save Commission Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
