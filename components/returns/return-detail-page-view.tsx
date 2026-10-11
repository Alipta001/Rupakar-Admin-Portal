'use client'

import React, { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { ReturnDetailModal } from '@/components/returns/return-detail-modal'
import { useGetAdminReturnByIdQuery } from '@/redux/api/adminApi'
import { AdminReturn } from '@/types/return'

export interface AdminReturnDetailPageViewProps {
  params?: Promise<{ id?: string }> | { id?: string }
}

function AdminReturnDetailPageViewContent({ params }: AdminReturnDetailPageViewProps) {
  const router = useRouter()
  const routeParams = useParams<{ id?: string }>()
  const searchParams = useSearchParams()

  // Standard Next.js/React 19 safe route params resolution
  let resolvedId = routeParams?.id || ''

  if (!resolvedId && params && typeof (params as any)?.then !== 'function') {
    resolvedId = (params as { id?: string })?.id || ''
  }

  // Handle queries like /returns/return_refund?id=... or /returns/return_refund?returnId=...
  if (resolvedId === 'return_refund' || !resolvedId) {
    const queryId = searchParams.get('id') || searchParams.get('returnId')
    if (queryId) {
      resolvedId = queryId
    }
  }

  const isInvalidRoute = !resolvedId || resolvedId === 'return_refund'

  const { data: rawReturn, isLoading, error, refetch } = useGetAdminReturnByIdQuery(
    resolvedId,
    { skip: isInvalidRoute }
  )

  if (isInvalidRoute) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <PageHeader
          eyebrow="Commerce / Returns"
          title="Return Resolution & Refund"
          description="Authoritative marketplace return audit and refund execution."
        />
        <ErrorState
          title="Invalid Return Identifier"
          message="No valid return identifier was specified in the route parameters."
          onRetry={() => router.push('/returns')}
        />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/returns" className="button secondary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Returns
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <PageHeader
          eyebrow="Commerce / Returns"
          title="Return Resolution & Refund"
          description="Authoritative marketplace return audit and refund execution."
        />
        <LoadingState message="Loading return details from Rupakar backend..." />
      </div>
    )
  }

  if (error) {
    const errStatus = (error as any)?.status
    const errMsg =
      (error as any)?.data?.message ||
      (error as any)?.message ||
      'An unexpected error occurred while loading this return.'

    let title = 'Failed to Load Return'
    let message = errMsg

    if (errStatus === 404) {
      title = 'Return Not Found'
      message = `Return record "${resolvedId}" could not be located in the database.`
    } else if (errStatus === 403 || errStatus === 401) {
      title = 'Access Denied'
      message = 'You do not have administrative permissions to view or resolve this return record.'
    }

    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <PageHeader
          eyebrow="Commerce / Returns"
          title="Return Resolution & Refund"
          description="Authoritative marketplace return audit and refund execution."
        />
        <ErrorState
          title={title}
          message={message}
          onRetry={refetch}
        />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/returns" className="button secondary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Returns
          </Link>
        </div>
      </div>
    )
  }

  const raw = rawReturn as any
  const returnData: AdminReturn | null = raw
    ? {
        ...raw,
        _id: raw._id || raw.id || resolvedId,
        id: raw.id || raw._id || resolvedId,
      }
    : null

  if (!returnData) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <PageHeader
          eyebrow="Commerce / Returns"
          title="Return Resolution & Refund"
          description="Authoritative marketplace return audit and refund execution."
        />
        <ErrorState
          title="Return Record Unavailable"
          message="Unable to retrieve return record details."
          onRetry={refetch}
        />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/returns" className="button secondary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Returns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Link
          href="/returns"
          className="button secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Back to Returns
        </Link>
      </div>

      <ReturnDetailModal
        returnData={returnData}
        isOpen={true}
        isPage={true}
        onClose={() => router.push('/returns')}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export function AdminReturnDetailPageView(props: AdminReturnDetailPageViewProps) {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
          <PageHeader
            eyebrow="Commerce / Returns"
            title="Return Resolution & Refund"
            description="Authoritative marketplace return audit and refund execution."
          />
          <LoadingState message="Loading return details from Rupakar backend..." />
        </div>
      }
    >
      <AdminReturnDetailPageViewContent {...props} />
    </Suspense>
  )
}
