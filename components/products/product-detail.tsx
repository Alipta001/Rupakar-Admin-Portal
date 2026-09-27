'use client'

import React, { useState } from 'react'
import { Product } from '@/types/product'
import { ProductStatusBadge } from './product-status-badge'
import { formatINR } from '@/lib/utils/formatters'
import { useGetProductByIdQuery } from '@/redux/api/adminApi'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Package,
  Truck,
  FileText,
  Tag,
  Clock,
  Image as ImageIcon,
} from 'lucide-react'

export interface ProductDetailModalProps {
  productId?: string | null
  product?: Product | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (productId: string) => void
  onReject?: (productId: string) => void
}

export function ProductDetailModal({
  productId,
  product: initialProduct,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const activeId = productId || initialProduct?.id || (initialProduct as any)?._id || ''
  const { data: fetchedProduct, isLoading, error } = useGetProductByIdQuery(activeId, {
    skip: !isOpen || !activeId,
  })

  if (!isOpen) return null

  // Prefer complete API response; fallback safely to initial row data
  const p: Product = (fetchedProduct || initialProduct || {}) as Product

  // Extract images dynamically from actual backend Cloudinary URLs
  const rawImages: any[] = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : p.image
    ? [{ url: p.image, isPrimary: true }]
    : p.thumbnail
    ? [{ url: p.thumbnail, isPrimary: true }]
    : []

  const imageUrls: string[] = rawImages
    .map((img: any) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean)

  const activeImageUrl = imageUrls[selectedImageIndex] || imageUrls[0] || null

  const vendorName =
    p.vendor?.businessName ||
    p.vendor?.legalName ||
    p.vendorName ||
    (typeof p.vendorId === 'object' ? (p.vendorId as any)?.businessName : null) ||
    'N/A'

  const categoryName =
    (typeof p.category === 'object' && p.category?.name ? p.category.name : null) ||
    p.categoryName ||
    (typeof p.category === 'string' ? p.category : null) ||
    'N/A'

  const subcategoryName =
    p.subcategory?.name ||
    (typeof p.subcategoryId === 'object' ? (p.subcategoryId as any)?.name : null) ||
    null

  const brandName =
    p.brand?.name ||
    (typeof p.brand === 'string' ? p.brand : null) ||
    (typeof p.brandId === 'object' ? (p.brandId as any)?.name : null) ||
    null

  const dimensionsStr = p.dimensions
    ? typeof p.dimensions === 'object'
      ? `${(p.dimensions as any).length ?? 0} × ${(p.dimensions as any).width ?? 0} × ${(p.dimensions as any).height ?? 0} cm`
      : String(p.dimensions)
    : null

  const isApproved = p.status === 'Approved' || p.moderationStatus === 'APPROVED'
  const isRejected = p.status === 'Rejected' || p.moderationStatus === 'REJECTED'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(39, 35, 31, 0.55)',
        backdropFilter: 'blur(3px)',
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
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && !fetchedProduct ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <span className="subtle">Loading complete product specifications from server...</span>
          </div>
        ) : error && !p.id ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <AlertTriangle size={32} style={{ color: '#c93b2b', marginBottom: '8px' }} />
            <h3>Failed to load product details</h3>
            <p className="subtle">Could not retrieve complete product data from API.</p>
            <button type="button" className="button secondary" onClick={onClose} style={{ marginTop: '16px' }}>
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #eeebe6',
                paddingBottom: '16px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 600, color: '#27231f' }}>
                  {p.name || p.title || 'Product Details'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#827b72' }}>
                  <span>SKU: <strong>{p.sku || 'N/A'}</strong></span>
                  <span>·</span>
                  <span>Category: <strong>{categoryName}</strong>{subcategoryName ? ` / ${subcategoryName}` : ''}</span>
                  {brandName && (
                    <>
                      <span>·</span>
                      <span>Brand: <strong>{brandName}</strong></span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProductStatusBadge status={p.status || p.moderationStatus || 'Under review'} />
              </div>
            </div>

            {/* Rejection Alert if applicable */}
            {isRejected && p.rejectionReason && (
              <div
                style={{
                  background: '#fdf2f2',
                  border: '1px solid #f8b4b4',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#9b1c1c',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <XCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Rejection Reason:</strong> {p.rejectionReason}
                </div>
              </div>
            )}

            {/* Images & Core Pricing Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: imageUrls.length > 0 ? '280px 1fr' : '1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              {/* Dynamic Image Gallery */}
              {imageUrls.length > 0 ? (
                <div>
                  <div
                    style={{
                      width: '100%',
                      height: '240px',
                      background: '#f8f6f3',
                      border: '1px solid #e9e5df',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    {activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt={p.name || p.title || 'Product'}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <ImageIcon size={32} style={{ color: '#827b72' }} />
                    )}
                  </div>

                  {/* Multiple image thumbnails */}
                  {imageUrls.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {imageUrls.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          style={{
                            width: '48px',
                            height: '48px',
                            border: selectedImageIndex === idx ? '2px solid #a45138' : '1px solid #e9e5df',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            padding: 0,
                            background: '#fff',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <img src={url} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    height: '140px',
                    background: '#f8f6f3',
                    border: '1px dashed #d5d0c8',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#827b72',
                    fontSize: '12px',
                    gap: '6px',
                  }}
                >
                  <ImageIcon size={28} />
                  <span>No product images uploaded</span>
                </div>
              )}

              {/* Pricing, Stock & Vendor Quick Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#faf9f7', padding: '10px 12px', borderRadius: '6px', border: '1px solid #eeebe6' }}>
                    <span style={{ fontSize: '11px', color: '#827b72', display: 'block' }}>Regular Price</span>
                    <strong style={{ fontSize: '16px', color: '#a45138' }}>{formatINR(p.price ?? 0)}</strong>
                    {p.compareAtPrice && p.compareAtPrice > (p.price ?? 0) && (
                      <span style={{ fontSize: '11px', color: '#827b72', textDecoration: 'line-through', marginLeft: '6px' }}>
                        {formatINR(p.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <div style={{ background: '#faf9f7', padding: '10px 12px', borderRadius: '6px', border: '1px solid #eeebe6' }}>
                    <span style={{ fontSize: '11px', color: '#827b72', display: 'block' }}>Inventory</span>
                    <strong style={{ fontSize: '15px', color: '#27231f' }}>
                      {p.availableStock ?? p.stock ?? 0} available
                    </strong>
                    {typeof p.reservedStock === 'number' && (
                      <span style={{ fontSize: '11px', color: '#827b72', display: 'block' }}>
                        ({p.reservedStock} reserved)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: '#faf9f7', padding: '12px', borderRadius: '6px', border: '1px solid #eeebe6', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#27231f', fontWeight: 600 }}>
                    <Package size={14} /> Vendor & Artisan
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Store Name</span>
                      <strong>{vendorName}</strong>
                    </div>
                    {p.vendor?.legalName && (
                      <div>
                        <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Legal Entity</span>
                        <span>{p.vendor.legalName}</span>
                      </div>
                    )}
                    {(p.vendor?.originState || p.vendor?.originDistrict) && (
                      <div>
                        <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Region</span>
                        <span>{[p.vendor.originDistrict, p.vendor.originState].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {p.artisan && (
                      <div>
                        <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Artisan</span>
                        <span>{p.artisan}</span>
                      </div>
                    )}
                    {p.vendor?.website && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <a
                          href={p.vendor.website.startsWith('http') ? p.vendor.website : `https://${p.vendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#a45138', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          Visit Vendor Website <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Story */}
            {(p.description || p.shortDescription || p.story) && (
              <div style={{ marginBottom: '18px', padding: '12px', background: '#faf9f7', borderRadius: '6px', border: '1px solid #eeebe6', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600 }}>
                  <FileText size={14} /> Product Description
                </div>
                {p.shortDescription && (
                  <p style={{ margin: '0 0 6px 0', color: '#564f47', fontStyle: 'italic' }}>
                    {p.shortDescription}
                  </p>
                )}
                {p.description && (
                  <p style={{ margin: 0, color: '#27231f', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                )}
                {p.story && p.story !== p.description && (
                  <div style={{ marginTop: '8px', borderTop: '1px dashed #e9e5df', paddingTop: '8px' }}>
                    <strong style={{ fontSize: '11px', color: '#827b72', display: 'block' }}>Artisan Craft Story:</strong>
                    <p style={{ margin: 0, color: '#564f47' }}>{p.story}</p>
                  </div>
                )}
              </div>
            )}

            {/* Authenticity, Shipping, Dimensions & Tax Specifications */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px', fontSize: '12px' }}>
              {/* Authenticity */}
              <div style={{ background: '#faf9f7', padding: '12px', borderRadius: '6px', border: '1px solid #eeebe6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
                  <ShieldCheck size={14} /> Authenticity Verification
                </div>
                <div>
                  <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Status</span>
                  <strong>{p.authenticity?.status || 'UNVERIFIED'}</strong>
                </div>
                {p.authenticity?.reference && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Reference / Certificate</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{p.authenticity.reference}</span>
                  </div>
                )}
              </div>

              {/* Shipping & Delivery */}
              <div style={{ background: '#faf9f7', padding: '12px', borderRadius: '6px', border: '1px solid #eeebe6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
                  <Truck size={14} /> Shipping & Logistics
                </div>
                {p.shipping?.deliveryDays && (
                  <div>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Estimated Delivery</span>
                    <span>{p.shipping.deliveryDays} business days</span>
                  </div>
                )}
                {p.shipping?.originState && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Dispatch Origin</span>
                    <span>{[p.shipping.originDistrict, p.shipping.originState].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div style={{ marginTop: '4px' }}>
                  <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Shipping Mode</span>
                  <span>{p.shipping?.freeShipping ? 'Free Express Shipping' : 'Standard Shipping'}</span>
                </div>
              </div>

              {/* Physical Specifications */}
              <div style={{ background: '#faf9f7', padding: '12px', borderRadius: '6px', border: '1px solid #eeebe6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
                  <Package size={14} /> Dimensions & Weight
                </div>
                {dimensionsStr && (
                  <div>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Dimensions (L×W×H)</span>
                    <span>{dimensionsStr}</span>
                  </div>
                )}
                {p.weight && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Weight</span>
                    <span>{p.weight} kg</span>
                  </div>
                )}
                {p.material && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Material</span>
                    <span>{p.material}</span>
                  </div>
                )}
                {p.care && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block' }}>Care Instructions</span>
                    <span style={{ fontSize: '11px', color: '#564f47' }}>{p.care}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Variants if present */}
            {Array.isArray(p.variants) && p.variants.length > 0 && (
              <div style={{ marginBottom: '18px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 600 }}>
                  <Tag size={14} /> Product Variants ({p.variants.length})
                </div>
                <div style={{ border: '1px solid #eeebe6', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                    <thead style={{ background: '#faf9f7', borderBottom: '1px solid #eeebe6' }}>
                      <tr>
                        <th style={{ padding: '8px 10px' }}>SKU</th>
                        <th style={{ padding: '8px 10px' }}>Price</th>
                        <th style={{ padding: '8px 10px' }}>Stock</th>
                        <th style={{ padding: '8px 10px' }}>Attributes</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants.map((v, i) => (
                        <tr key={v.id || v._id || i} style={{ borderBottom: '1px solid #f4f2ee' }}>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{v.sku}</td>
                          <td style={{ padding: '8px 10px' }}>{formatINR(v.price)}</td>
                          <td style={{ padding: '8px 10px' }}>{v.availableStock ?? v.stock ?? 0}</td>
                          <td style={{ padding: '8px 10px' }}>
                            {v.attributes && typeof v.attributes === 'object'
                              ? Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ') || 'Standard'
                              : 'Standard'}
                          </td>
                          <td style={{ padding: '8px 10px' }}>{v.status || 'ACTIVE'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tags and Custom Attributes */}
            {((p.tags && p.tags.length > 0) || (p.attributes && Object.keys(p.attributes).length > 0)) && (
              <div style={{ marginBottom: '18px', fontSize: '12px' }}>
                {p.tags && p.tags.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#827b72', fontSize: '10px', display: 'block', marginBottom: '4px' }}>Tags</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {p.tags.map((t, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#f2eee9',
                            color: '#564f47',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audit & Timestamps */}
            <div
              style={{
                borderTop: '1px solid #eeebe6',
                paddingTop: '12px',
                marginBottom: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                fontSize: '11px',
                color: '#827b72',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                <span>Created: {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              {p.updatedAt && (
                <div>Updated: {new Date(p.updatedAt).toLocaleString()}</div>
              )}
              {p.publishedAt && (
                <div>Published: {new Date(p.publishedAt).toLocaleString()}</div>
              )}
              {p.reviewedAt && (
                <div>Reviewed: {new Date(p.reviewedAt).toLocaleString()}</div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #eeebe6',
                paddingTop: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isApproved && onApprove && (
                  <button
                    type="button"
                    className="button"
                    style={{ background: '#45815a', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onApprove(activeId)}
                  >
                    <CheckCircle2 size={15} /> Approve Product
                  </button>
                )}
                {!isRejected && onReject && (
                  <button
                    type="button"
                    className="button secondary"
                    style={{ color: '#c93b2b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onReject(activeId)}
                  >
                    <XCircle size={15} /> Reject Product
                  </button>
                )}
              </div>

              <button type="button" className="button secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
