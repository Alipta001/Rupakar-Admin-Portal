'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { Header } from '@/components/layout/header'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="admin-app">
        <Sidebar />
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <div className="content">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}

