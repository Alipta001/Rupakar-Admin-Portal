import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="profile-page">
      <div className="profile-shell">{children}</div>
    </main>
  )
}
