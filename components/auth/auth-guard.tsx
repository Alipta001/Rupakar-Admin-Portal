'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LoadingState } from '@/components/shared/loading-state'
import { ShieldAlert, LogOut } from 'lucide-react'

export interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { user, session, isAuthenticated, role, loading, logout } = useAuth()

  useEffect(() => {
    // If auth state is checked and user is not authenticated, redirect to /login
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [loading, isAuthenticated, router])

  // While restoring session or verifying credentials
  if (loading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fcfbfa',
        }}
      >
        <LoadingState message="Verifying administrative access..." />
      </div>
    )
  }

  // Verify administrative role
  const rawRole = String(role || session?.role || user?.role || '').toLowerCase()
  const isPrivileged =
    rawRole === 'admin' ||
    rawRole === 'super_admin' ||
    rawRole === 'finance_manager' ||
    rawRole === 'content_manager' ||
    rawRole === 'support'

  if (!isPrivileged) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fcfbfa',
          padding: '24px',
        }}
      >
        <div
          className="panel"
          style={{
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            padding: '36px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fbeae5',
              color: '#c93b2b',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: '#1f1d1a' }}>
            Administrative Privileges Required
          </h2>
          <p style={{ color: '#827b72', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.5 }}>
            Your account ({session?.email || user?.email || 'current session'}) is not granted administrative portal access.
          </p>
          <button
            type="button"
            className="button primary"
            onClick={logout}
            style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', gap: '8px' }}
          >
            <LogOut size={16} /> Sign out &amp; switch account
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
