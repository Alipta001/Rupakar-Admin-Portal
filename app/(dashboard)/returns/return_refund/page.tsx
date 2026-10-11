'use client'

import React, { Suspense } from 'react'
import { AdminReturnDetailPageView, AdminReturnDetailPageViewProps } from '@/components/returns/return-detail-page-view'
import { LoadingState } from '@/components/shared/loading-state'

export default function AdminReturnRefundQueryPage(props: AdminReturnDetailPageViewProps) {
  return (
    <Suspense fallback={<LoadingState message="Loading return details..." />}>
      <AdminReturnDetailPageView {...props} />
    </Suspense>
  )
}
