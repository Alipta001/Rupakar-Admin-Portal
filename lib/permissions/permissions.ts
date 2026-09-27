export const PERMISSIONS = {
  // Users
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',

  // Vendors
  VENDORS_READ: 'vendors:read',
  VENDORS_APPROVE: 'vendors:approve',
  VENDORS_SUSPEND: 'vendors:suspend',

  // Products
  PRODUCTS_READ: 'products:read',
  PRODUCTS_MODERATE: 'products:moderate',
  PRODUCTS_EDIT: 'products:edit',

  // Orders
  ORDERS_READ: 'orders:read',
  ORDERS_UPDATE: 'orders:update',

  // Finance
  PAYMENTS_READ: 'payments:read',
  REFUNDS_MANAGE: 'refunds:manage',
  COMMISSIONS_MANAGE: 'commissions:manage',
  PAYOUTS_EXECUTE: 'payouts:execute',
  INVOICES_MANAGE: 'invoices:manage',

  // Settings
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_LOGS_READ: 'audit-logs:read',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
