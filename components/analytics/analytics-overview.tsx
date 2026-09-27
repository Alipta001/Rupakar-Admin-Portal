'use client'

import React, { useState } from 'react'
import { CircleDollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/charts/revenue-chart'
import { APP_CONSTANTS } from '@/lib/constants/app'
import { useGetAnalyticsQuery } from '@/redux/api/adminApi'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { formatINR } from '@/lib/utils/formatters'

export function AnalyticsOverview() {
  const [range, setRange] = useState('30d')
  const { data, isLoading, error, refetch } = useGetAnalyticsQuery({ range })

  if (isLoading) {
    return <LoadingState message="Calculating analytics and GMV aggregates..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load analytics"
        message="Could not load marketplace metrics from analytics engine."
        onRetry={refetch}
      />
    )
  }

  const kpis = data?.kpis
  const categoryPerf = data?.categoryPerformance || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <select
          className="select-button"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {APP_CONSTANTS.DATE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="metric-grid">
        <StatCard
          label="Gross Revenue"
          value={kpis?.formattedRevenue || formatINR(kpis?.revenue ?? 0)}
          note={`Past ${range}`}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Total Orders"
          value={String(kpis?.ordersCount ?? 0)}
          note="Confirmed transactions"
          icon={ShoppingBag}
        />
        <StatCard
          label="Average Order Value"
          value={kpis?.formattedAov || formatINR(kpis?.aov ?? 0)}
          note="Per order average"
          icon={Users}
        />
        <StatCard
          label="Growth Rate"
          value={`${kpis?.growthRate ?? 0}%`}
          note="Period over period"
          icon={TrendingUp}
        />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Marketplace sales & revenue progression</h2>
            <p>Aggregated across all verified artisan categories</p>
          </div>
        </div>
        <div className="revenue-total">
          <strong>{formatINR(kpis?.revenue ?? 0)}</strong>
          <span className="positive">{kpis?.growthRate ?? 0}% period trend</span>
        </div>
        <RevenueChart />
      </section>

      {categoryPerf.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Category Performance</h2>
              <p>Revenue distribution across crafts</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoryPerf.map((cat) => (
              <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{cat.category}</span>
                <strong>{formatINR(cat.revenue)} ({cat.percentage}%)</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
