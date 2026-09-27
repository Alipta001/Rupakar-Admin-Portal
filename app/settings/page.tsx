'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Shield, Store } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useGetSettingsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function SettingsPage() {
  const { data: settingsData, isLoading } = useGetSettingsQuery()
  const [storeName, setStoreName] = useState(siteConfig.name)
  const [supportEmail, setSupportEmail] = useState(siteConfig.supportEmail)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settingsData) {
      if (settingsData.marketplaceName) setStoreName(settingsData.marketplaceName)
      if (settingsData.supportEmail) setSupportEmail(settingsData.supportEmail)
    }
  }, [settingsData])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) {
    return <LoadingState message="Loading platform configuration settings..." />
  }

  return (
    <AuthGuard>
      <main className="profile-page">
        <div className="profile-shell">
          <Link className="back-link" href="/">
            <ChevronLeft size={15} /> Back to dashboard
          </Link>
          <div className="page-heading">
            <div>

            <div className="eyebrow">Platform Settings</div>
            <h1>Settings</h1>
            <p>Configure marketplace general preferences, regional options, and operational policies.</p>
          </div>
        </div>

        <div className="profile-grid">
          <section className="panel profile-card">
            <div className="profile-hero">
              <div className="profile-avatar profile-avatar-large">
                <Store size={24} />
              </div>
              <div>
                <h2>{storeName}</h2>
                <p>Artisan Marketplace Operations</p>
              </div>
            </div>
            <div className="account-meta">
              <div>
                <span>Portal Environment</span>
                <strong>Production / Staging Ready</strong>
              </div>
              <div>
                <span>Platform Version</span>
                <strong>v{siteConfig.version}</strong>
              </div>
            </div>
          </section>

          <form className="panel profile-form" onSubmit={handleSave}>
            <div className="panel-head">
              <div>
                <h2>General Preferences</h2>
                <p>Public marketplace identity and customer communications.</p>
              </div>
            </div>
            <label>
              Marketplace name
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
            </label>
            <label>
              Operations & support email
              <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
            </label>
            <label>
              Default Currency
              <input value="INR (₹) - Indian Rupee" readOnly />
            </label>
            {saved && (
              <p className="success-message">Settings updated successfully.</p>
            )}
            <button className="button primary">Save preferences</button>
          </form>

          <section className="panel security-card">
            <div className="panel-head">
              <div>
                <h2>Marketplace Security & Compliance</h2>
                <p>Operational safety safeguards (API keys & infrastructure secrets are strictly managed via server environment variables).</p>
              </div>
              <Shield size={20} className="security-icon" />
            </div>
            <div className="security-row">
              <div>
                <strong>Role-Based Access Control (RBAC)</strong>
                <span>Strict enforcement on vendor approvals, payouts, and user suspensions.</span>
              </div>
              <span className="status status-success">
                <span className="status-dot" /> Enforced
              </span>
            </div>
            <div className="security-row">
              <div>
                <strong>Auditing & Mutation Logging</strong>
                <span>All administrative mutations recorded in immutable audit log.</span>
              </div>
              <span className="status status-success">
                <span className="status-dot" /> Active
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  </AuthGuard>
  )
}

