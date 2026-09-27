'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbsProps {
  currentTitle?: string
}

export function Breadcrumbs({ currentTitle }: BreadcrumbsProps) {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const resolvedTitle =
    currentTitle ||
    (segments.length === 0
      ? 'Overview'
      : segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace('-', ' '))

  return (
    <div className="breadcrumbs">
      <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
        Rupakar
      </Link>
      <ChevronRight size={14} />
      <strong>{resolvedTitle}</strong>
    </div>
  )
}
