'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/charts/revenue-chart'
import { OperationalAlerts } from '@/components/dashboard/alerts/operational-alerts'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { useAuth } from '@/hooks/use-auth'
import { useGetDashboardOverviewQuery } from '@/redux/api/adminApi'

export default function DashboardPage() {
  const { session } = useAuth()
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d')
  const { data, isLoading, isFetching, error, refetch } = useGetDashboardOverviewQuery({ range })

  const firstName = (session?.name || 'Administrator').split(' ')[0]

  if (isLoading) {
    return <LoadingState message="Loading live marketplace dashboard from Rupakar backend..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        message="Unable to reach the Rupakar API. Please verify backend connection."
        onRetry={refetch}
      />
    )
  }

  const metrics = data?.metrics
  const alerts = data?.alerts || []
  const recentOrders = data?.recentOrders || []
  const topVendors = data?.topVendors || []

  return (
    <>
      <PageHeader
        eyebrow="Marketplace Operations"
        title={`Good morning, ${firstName}`}
        description="Live operations and commerce intelligence from your Rupakar backend."
        actions={
          <>
            <button
              type="button"
              className="button secondary"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/products" className="button primary" style={{ textDecoration: 'none' }}>
              <Plus size={16} /> Add product
            </Link>
          </>
        }
      />

      <div className="metric-grid">
        <StatCard
          label="Gross revenue"
          value={metrics?.formattedGrossRevenue || '₹0.00L'}
          note={`Past ${range}`}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Total Orders"
          value={String(metrics?.totalOrders ?? 0)}
          note={`${metrics?.totalProducts ?? 0} total products`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Active customers"
          value={String(metrics?.activeCustomers ?? 0)}
          note="Registered customers"
          icon={Users}
        />
        <StatCard
          label="Vendors"
          value={`${metrics?.totalVendors ?? 0}`}
          note={`${metrics?.pendingVendors ?? 0} pending review`}
          icon={TrendingUp}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel revenue-panel">
          <div className="panel-head">
            <div>
              <h2>Revenue overview</h2>
              <p>Gross marketplace revenue from verified orders</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`button ${range === r ? 'primary' : 'secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={() => setRange(r)}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="revenue-total">
            <strong>₹{(metrics?.grossRevenue ?? 0).toLocaleString('en-IN')}</strong>
            <span className="positive">
              <ArrowUpRight size={14} /> Live
            </span>
          </div>
          <RevenueChart />
        </section>

        <OperationalAlerts alerts={alerts} />
      </div>

      <RecentActivity orders={recentOrders} vendors={topVendors} />
    </>
  )
}
