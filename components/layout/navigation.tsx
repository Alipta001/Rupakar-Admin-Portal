'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from '@/config/navigation'
import { useAuth } from '@/hooks/use-auth'
import { canAccessRoute } from '@/lib/permissions/access'

import { useGetNotificationsQuery } from '@/redux/api/adminApi'

export interface NavigationProps {
  onItemClick?: () => void
}

export function Navigation({ onItemClick }: NavigationProps) {
  const pathname = usePathname()
  const { role } = useAuth()
  const { data: notifications } = useGetNotificationsQuery()

  const unreadNotificationsCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.read && !n.readAt).length
    : 0

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
              const badgeCount = item.href === '/notifications'
                ? (unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined)
                : item.count

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
                  {badgeCount && <em>{badgeCount}</em>}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

