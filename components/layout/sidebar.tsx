'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, LogOut, X } from 'lucide-react'
import { Navigation } from './navigation'
import { useAuth } from '@/hooks/use-auth'

export interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const { session, logout } = useAuth()

  const displayName = session?.name || 'Administrator'
  const displayRole = session?.role === 'admin' ? 'Administrator' : (session?.role || 'Administrator')
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()


  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <div className="brand-mark">R</div>
          <div>
            <strong>Rupakar</strong>
            <span>ADMIN PORTAL</span>
          </div>
        </Link>
        {onClose && (
          <button type="button" className="mobile-close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="sidebar-nav-wrap">
        <Navigation onItemClick={onClose} />
      </div>

      <div className="admin-account">
        <button
          type="button"
          className="role-switch"
          onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          aria-expanded={adminMenuOpen}
        >
          <div className="role-avatar">{initials}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>
          {adminMenuOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>

        {adminMenuOpen && (
          <div className="admin-menu">
            <button
              type="button"
              onClick={() => {
                setAdminMenuOpen(false)
                logout()
              }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="live-dot" />
        <span>All systems operational</span>
      </div>
    </aside>
  )
}
