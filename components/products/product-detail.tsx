import React from 'react'
import { Product } from '@/types/product'
import { ProductStatusBadge } from './product-status-badge'
import { formatINR } from '@/lib/utils/formatters'

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !product) return null

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
          maxWidth: '560px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>{product.title}</h2>
            <span style={{ fontSize: '11px', color: '#827b72' }}>SKU: {product.sku} · {product.category}</span>
          </div>
          <ProductStatusBadge status={product.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Vendor</span>
            <strong>{product.vendorName}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Price</span>
            <strong style={{ color: '#a45138' }}>{formatINR(product.price)}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Available Stock</span>
            <span>{product.stock} units</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Craft / Art Form</span>
            <span>{product.craft || 'Handcrafted Heritage'}</span>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
