import React from 'react'
import { Order } from '@/types/order'
import { OrderStatusBadge } from './order-status-badge'
import { OrderTimeline } from './order-timeline'
import { formatINR } from '@/lib/utils/formatters'

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !order) return null

  const timelineEvents = [
    { status: 'Order Placed', date: order.date, completed: true },
    { status: 'Confirmed by Vendors', date: order.date, completed: order.status !== 'Pending' },
    { status: 'Shipped', date: order.status === 'Shipped' || order.status === 'Delivered' ? 'Today' : 'Pending', completed: order.status === 'Shipped' || order.status === 'Delivered' },
    { status: 'Delivered', date: order.status === 'Delivered' ? 'Today' : 'Pending', completed: order.status === 'Delivered' },
  ]

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
          maxWidth: '600px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Order {order.orderNumber}</h2>
            <span style={{ fontSize: '11px', color: '#827b72' }}>Placed on {order.date}</span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Customer</span>
            <strong>{order.customer || '—'}</strong>
            <span style={{ display: 'block', fontSize: '11px', color: '#827b72' }}>{order.customerEmail || '—'}</span>
            {order.customerPhone && (
              <span style={{ display: 'block', fontSize: '11px', color: '#827b72' }}>{order.customerPhone}</span>
            )}
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px' }}>Total Amount</span>
            <strong style={{ color: '#a45138', fontSize: '15px' }}>{formatINR(order.amount)}</strong>
            <span style={{ display: 'block', fontSize: '10px', color: '#45815a' }}>Payment: {order.paymentStatus || 'Paid'}</span>
          </div>
        </div>

        <div style={{ marginTop: '18px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 8px' }}>Vendor Orders Breakdown</h3>
          {order.vendorOrders && order.vendorOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.vendorOrders.map((vo) => (
                <div key={vo.id} style={{ background: '#fcfbf9', border: '1px solid #e9e5df', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '12px' }}>{vo.vendorName}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#827b72' }}>
                        {vo.items.map((it) => `${it.title} (x${it.quantity})`).join(', ') || order.itemSummary}
                      </p>
                    </div>
                    <OrderStatusBadge status={vo.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#fcfbf9', border: '1px solid #e9e5df', borderRadius: '6px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '12px' }}>{order.vendor || '—'}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#827b72' }}>{order.itemSummary}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '18px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 8px' }}>Fulfillment & Delivery Timeline</h3>
          <OrderTimeline events={timelineEvents} />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
