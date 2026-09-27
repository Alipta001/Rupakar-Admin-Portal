import React from 'react'
import { Vendor } from '@/types/vendor'
import { VendorStatusBadge } from './vendor-status-badge'
import { formatINR } from '@/lib/utils/formatters'

export function VendorDetailModal({
  vendor,
  isOpen,
  onClose,
}: {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !vendor) return null

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
            <h2 style={{ margin: 0, fontSize: '18px' }}>{vendor.businessName || vendor.name}</h2>
            <span style={{ fontSize: '11px', color: '#827b72' }}>ID: {vendor.code} · {vendor.location}</span>
          </div>
          <VendorStatusBadge status={vendor.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Seller Name</span>
            <strong>{vendor.sellerName || vendor.ownerName || '—'}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Business / Store Name</span>
            <strong>{vendor.businessName || vendor.name || '—'}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Seller Email</span>
            <span>{vendor.sellerEmail || vendor.email || '—'}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Seller Phone</span>
            <span>{vendor.sellerPhone || vendor.phone || '—'}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Craft / Category</span>
            <strong>{vendor.category || '—'}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Location</span>
            <span>{vendor.location || '—'}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>GMV</span>
            <strong style={{ color: '#a45138' }}>{formatINR(vendor.grossMerchandiseValue)}</strong>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Active Products</span>
            <strong>{vendor.productsCount} items</strong>
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
