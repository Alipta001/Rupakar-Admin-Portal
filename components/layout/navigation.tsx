'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from '@/config/navigation'
import { useAuth } from '@/hooks/use-auth'
import { canAccessRoute } from '@/lib/permissions/access'

export interface NavigationProps {
  onItemClick?: () => void
}

export function Navigation({ onItemClick }: NavigationProps) {
  const pathname = usePathname()
  const { role } = useAuth()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <nav>
      {navGroups.map(group => {
        const visibleItems = group.items.filter(item => canAccessRoute(role, item.href))
        if (visibleItems.length === 0) return null

        return (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {visibleItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={onItemClick}
                  style={{ textDecoration: 'none' }}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                  {item.count && <em>{item.count}</em>}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

