'use client'

import React from 'react'
import { Sidebar } from './sidebar'

export interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 19,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <Sidebar open={isOpen} onClose={onClose} />
    </>
  )
}
