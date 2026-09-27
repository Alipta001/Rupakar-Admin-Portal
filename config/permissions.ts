import { AdminRole } from '@/types/auth'

const ADMIN_PERMISSIONS = [
  'users:*',
  'vendors:*',
  'products:*',
  'categories:*',
  'brands:*',
  'orders:*',
  'payments:read',
  'refunds:*',
  'inventory:*',
  'commissions:read',
  'payouts:read',
  'invoices:*',
  'authenticity:*',
  'coupons:*',
  'reviews:*',
  'support:*',
  'notifications:*',
  'analytics:read',
  'audit-logs:read',
  'settings:read',
]

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ADMIN_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,

  FINANCE_MANAGER: [
    'orders:read',
    'payments:*',
    'refunds:*',
    'commissions:*',
    'payouts:*',
    'invoices:*',
    'analytics:read',
  ],
  CONTENT_MANAGER: [
    'products:*',
    'categories:*',
    'brands:*',
    'authenticity:*',
    'reviews:*',
  ],
  SUPPORT: [
    'users:read',
    'vendors:read',
    'orders:read',
    'orders:update',
    'support:*',
    'refunds:read',
    'reviews:read',
  ],
}
