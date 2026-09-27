'use client'

import React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Marketplace / Insights"
        title="Analytics & Reporting"
        description="Comprehensive marketplace analytics, GMV trends, and artisan category volume."
      />
      <AnalyticsOverview />
    </>
  )
}
