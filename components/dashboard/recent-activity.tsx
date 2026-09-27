'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'

export interface RecentOrderSummary {
  id: string
  customer: string
  item: string
  vendor: string
  amount: string | number
  status: string
  date: string
}

export interface TopVendorSummary {
  name: string
  type: string
  amount: string | number
  initials: string
}

export function RecentActivity({
  orders = [],
  vendors = [],
}: {
  orders?: RecentOrderSummary[]
  vendors?: TopVendorSummary[]
}) {
  return (
    <div className="dashboard-grid bottom-grid">
      <section className="panel orders-panel">
        <div className="panel-head">
          <div>
            <h2>Recent orders</h2>
            <p>Latest activity from your storefront</p>
          </div>
          <Link href="/orders" className="text-button" style={{ textDecoration: 'none' }}>
            View all <ChevronRight size={15} />
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                    <span className="subtle">{order.date}</span>
                  </td>
                  <td>
                    {order.customer}
                    <span className="subtle">{order.item}</span>
                  </td>
                  <td>{order.vendor}</td>
                  <td>
                    <strong>{typeof order.amount === 'number' ? `₹${order.amount.toLocaleString('en-IN')}` : order.amount}</strong>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    <button type="button" className="row-more" aria-label="Order actions">
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Top vendors</h2>
            <p>By gross merchandise value</p>
          </div>
          <button type="button" className="icon-button" aria-label="More vendor options">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <div className="vendor-list">
          {vendors.map((v, i) => (
            <div className="vendor-row" key={v.name}>
              <div className={`avatar avatar-${i}`}>{v.initials}</div>
              <div className="vendor-name">
                <strong>{v.name}</strong>
                <span>{v.type}</span>
              </div>
              <strong className="vendor-amount">
                {typeof v.amount === 'number' ? `₹${v.amount.toLocaleString('en-IN')}` : v.amount}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
