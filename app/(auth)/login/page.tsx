'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, role, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const rawRole = String(role || '').toLowerCase()
      if (rawRole === 'admin' || rawRole === 'super_admin') {
        router.replace('/dashboard')
      }
    }
  }, [authLoading, isAuthenticated, role, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await authClient.login({ email, password })
    if (result.success) {
      const userRole = String(result.session?.role || '').toLowerCase()
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        setError('Access denied: You do not possess administrative permissions.')
        await authClient.logout()
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } else {
      setError(result.error || 'Invalid credentials or administrative access denied')
      setLoading(false)
    }
  }


  return (
    <div className="panel profile-card" style={{ maxWidth: '420px', margin: '60px auto' }}>
      <div className="eyebrow">Rupakar admin portal</div>
      <h1 style={{ margin: '8px 0', fontSize: '24px' }}>Sign in</h1>
      <p style={{ margin: '0 0 20px', color: '#827b72', fontSize: '12px' }}>
        Access the marketplace administration platform.
      </p>

      {error && (
        <p style={{ color: '#c93b2b', fontSize: '11px', margin: '0 0 12px' }}>{error}</p>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#635c54', fontWeight: 600 }}>
          Email address
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@rupakar.com"
            required
            style={{
              border: '1px solid #e9e5df',
              borderRadius: '6px',
              padding: '9px 10px',
              fontSize: '12px',
              outline: 'none',
            }}
          />

        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#635c54', fontWeight: 600 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              border: '1px solid #e9e5df',
              borderRadius: '6px',
              padding: '9px 10px',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
          <Link href="/forgot-password" style={{ color: '#827b72', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="button primary" disabled={loading} style={{ justifyContent: 'center' }}>
          {loading ? 'Signing in...' : 'Sign in to portal'}
        </button>
      </form>
    </div>
  )
}
