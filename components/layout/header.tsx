'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings2, UserRound } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { useAuth } from '@/hooks/use-auth'

export interface HeaderProps {
  onMenuClick?: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const { session, logout } = useAuth()
  const router = useRouter()

  const displayName = session?.name || 'Administrator'
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()


  return (
    <header className="topbar">
      {onMenuClick && (
        <button
          type="button"
          className="mobile-menu"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={19} />
        </button>
      )}

      <Breadcrumbs currentTitle={title} />

      <div className="top-actions">
        <div className="global-search">
          <Search size={16} />
          <input placeholder="Search anything" />
          <kbd>⌘ K</kbd>
        </div>

        <Link href="/notifications" className="top-icon" aria-label="Notifications" style={{ display: 'inline-flex' }}>
          <Bell size={18} />
          <i />
        </Link>

        <div className="profile-menu-wrap">
          <button
            type="button"
            className="top-profile top-profile-button"
            aria-label="Open profile menu"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >
            <div className="profile-avatar">{initials}</div>
            <ChevronDown size={14} />
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  router.push('/profile')
                }}
              >
                <UserRound size={14} /> Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  router.push('/settings')
                }}
              >
                <Settings2 size={14} /> Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  logout()
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
