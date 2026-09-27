'use client'

import React, { FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, ChevronLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { authClient } from '@/lib/auth/auth-client'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function ProfilePage() {
  const { session, user } = useAuth()
  const [name, setName] = useState(session?.name ?? (user?.name || ''))
  const [email, setEmail] = useState(session?.email ?? (user?.email || ''))
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.name || user?.name) setName(session?.name || user?.name || '')
    if (session?.email || user?.email) setEmail(session?.email || user?.email || '')
  }, [session?.name, session?.email, user?.name, user?.email])

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    await authClient.updateProfile({ name, email })
    setSaving(false)
    setMessage('Profile updated successfully.')
  }

  const initials = (name || 'Admin')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AuthGuard>
      <main className="profile-page">
        <div className="profile-shell">
          <Link className="back-link" href="/">
            <ChevronLeft size={15} /> Back to dashboard
          </Link>
          <div className="page-heading">
            <div>

            <div className="eyebrow">Account</div>
            <h1>Profile</h1>
            <p>Manage your administrator account and security preferences.</p>
          </div>
        </div>

        <div className="profile-grid">
          <section className="panel profile-card">
            <div className="profile-hero">
              <div className="profile-avatar profile-avatar-large">{initials}</div>
              <div>
                <h2>{name || 'Administrator'}</h2>
                <p>{session?.role ?? 'Super administrator'}</p>
              </div>
            </div>
            <div className="account-meta">
              <div>
                <span>Status</span>
                <strong className="positive">
                  <span className="status-dot" />
                  {session?.status ?? 'Active'}
                </strong>
              </div>
              <div>
                <span>Last sign in</span>
                <strong>{session?.lastSignIn ?? 'Today, 09:14 AM'}</strong>
              </div>
            </div>
          </section>

          <form className="panel profile-form" onSubmit={saveProfile}>
            <div className="panel-head">
              <div>
                <h2>Profile information</h2>
                <p>Update the details shown across the admin portal.</p>
              </div>
            </div>
            <label>
              Admin name
              <input value={name} onChange={event => setName(event.target.value)} required />
            </label>
            <label>
              Email address
              <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
            </label>
            <label>
              Role
              <input value={session?.role ?? 'Super administrator'} readOnly />
            </label>
            {message && (
              <p className="success-message">
                <Check size={14} />
                {message}
              </p>
            )}
            <button className="button primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <section className="panel security-card">
            <div className="panel-head">
              <div>
                <h2>Security & sessions</h2>
                <p>Keep your account protected.</p>
              </div>
              <ShieldCheck size={20} className="security-icon" />
            </div>
            <div className="security-row">
              <div>
                <strong>Password</strong>
                <span>Last changed 30 days ago</span>
              </div>
              <button className="button secondary" type="button">
                Change password
              </button>
            </div>
            <div className="security-row">
              <div>
                <strong>Active session</strong>
                <span>This browser · Current session</span>
              </div>
              <span className="status status-success">
                <span className="status-dot" />
                Active
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  </AuthGuard>
  )
}

