'use client'

import React from 'react'
import Link from 'next/link'
import { Box, ChevronRight, MoreHorizontal, PackageCheck, Store, WalletCards } from 'lucide-react'

export interface OperationalAlertItem {
  id: string
  title: string
  subtitle: string
  href: string
  theme: 'terracotta' | 'amber' | 'blue' | 'green' | string
  icon: 'store' | 'box' | 'inventory' | 'payout' | string
}

export function OperationalAlerts({ alerts = [] }: { alerts?: OperationalAlertItem[] }) {
  const renderIcon = (type: OperationalAlertItem['icon']) => {
    switch (type) {
      case 'store':
        return <Store size={17} />
      case 'box':
        return <Box size={17} />
      case 'inventory':
        return <PackageCheck size={17} />
      case 'payout':
        return <WalletCards size={17} />
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Operational alerts</h2>
          <p>Items that need your attention</p>
        </div>
        <button type="button" className="icon-button" aria-label="More alert options">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="alert-list">
        {alerts.map(item => (
          <Link
            key={item.id}
            href={item.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={`alert-icon ${item.theme}`}>
              {renderIcon(item.icon)}
            </div>
            <div>
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
            <ChevronRight size={16} />
          </Link>
        ))}
      </div>
    </section>
  )
}
