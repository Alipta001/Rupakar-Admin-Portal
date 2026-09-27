'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import axiosInstance from '@/api/axios/axios'
import { ENDPOINTS } from '@/api/endPoints/endPoints'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
      setSubmitted(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to request password reset'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel profile-card" style={{ maxWidth: '420px', margin: '60px auto' }}>
      <Link href="/login" className="back-link" style={{ marginBottom: '14px' }}>
        <ArrowLeft size={14} /> Back to sign in
      </Link>
      <div className="eyebrow">Account recovery</div>
      <h1 style={{ margin: '8px 0', fontSize: '24px' }}>Reset password</h1>
      <p style={{ margin: '0 0 20px', color: '#827b72', fontSize: '12px' }}>
        Enter your administrative email to receive a password reset link.
      </p>

      {error && (
        <p style={{ color: '#c93b2b', fontSize: '11px', margin: '0 0 12px' }}>{error}</p>
      )}

      {submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eaf4eb', color: '#45815a', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
            <Check size={20} />
          </div>
          <p style={{ fontSize: '12px', color: '#45815a', margin: 0 }}>
            Reset instructions have been sent to <strong>{email}</strong>.
          </p>
          <Link href="/login" className="button secondary" style={{ justifyContent: 'center', marginTop: '12px' }}>
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#635c54', fontWeight: 600 }}>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@rupakar.com"
              style={{
                border: '1px solid #e9e5df',
                borderRadius: '6px',
                padding: '9px 10px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </label>

          <button type="submit" className="button primary" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Sending...' : 'Send reset instructions'}
          </button>
        </form>
      )}
    </div>
  )
}
