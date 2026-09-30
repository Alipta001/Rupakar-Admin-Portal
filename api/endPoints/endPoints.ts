export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    LIST: '/admin/users',
    DETAIL: (id: string) => `/admin/users/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/users/${id}/status`,
  },
  VENDORS: {
    LIST: '/vendors/admin',
    DETAIL: (id: string) => `/vendors/admin/${id}`,
    APPROVE: (id: string) => `/vendors/admin/${id}/approve`,
    REJECT: (id: string) => `/vendors/admin/${id}/reject`,
    SUSPEND: (id: string) => `/vendors/admin/${id}/suspend`,
    BLOCK: (id: string) => `/vendors/admin/${id}/block`,
    RESTORE: (id: string) => `/vendors/admin/${id}/restore`,
    DOCUMENTS: (id: string) => `/vendors/admin/${id}/documents`,
    APPROVE_DOCUMENT: (vendorId: string, docId: string) =>
      `/vendors/admin/${vendorId}/documents/${docId}/approve`,
    REJECT_DOCUMENT: (vendorId: string, docId: string) =>
      `/vendors/admin/${vendorId}/documents/${docId}/reject`,
    BANK_ACCOUNT: (id: string) => `/vendors/admin/${id}/bank-account`,
    VERIFY_BANK: (id: string) => `/vendors/admin/${id}/bank-account/verify`,
    REJECT_BANK: (id: string) => `/vendors/admin/${id}/bank-account/reject`,
  },
  PRODUCTS: {
    LIST: '/admin/products',
    DETAIL: (id: string) => `/admin/products/${id}`,
    APPROVE: (id: string) => `/admin/products/${id}/approve`,
    REJECT: (id: string) => `/admin/products/${id}/reject`,
    PUBLISH: (id: string) => `/admin/products/${id}/publish`,
    UNPUBLISH: (id: string) => `/admin/products/${id}/unpublish`,
    ARCHIVE: (id: string) => `/admin/products/${id}/archive`,
    DELETE: (id: string) => `/admin/products/${id}`,
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (slug: string) => `/categories/${slug}`,
    CREATE: '/categories/admin/categories',
    UPDATE: (id: string) => `/categories/admin/categories/${id}`,
    DELETE: (id: string) => `/categories/admin/categories/${id}`,
  },
  BRANDS: {
    LIST: '/brands',
    DETAIL: (slug: string) => `/brands/${slug}`,
    CREATE: '/brands/admin/brands',
    UPDATE: (id: string) => `/brands/admin/brands/${id}`,
    DELETE: (id: string) => `/brands/admin/brands/${id}`,
  },
  ORDERS: {
    LIST: '/admin/orders',
    DETAIL: (id: string) => `/admin/orders/${id}`,
  },
  SHIPMENTS: {
    LIST: '/admin/shipments',
    DETAIL: (id: string) => `/admin/shipments/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/shipments/${id}/status`,
  },
  PAYMENTS: {
    LIST: '/admin/payments',
  },
  REFUNDS: {
    LIST: '/admin/refunds',
    RETURNS_LIST: '/admin/returns',
    RETURN_DETAIL: (id: string) => `/admin/returns/${id}`,
    APPROVE_RETURN: (id: string) => `/admin/returns/${id}/approve`,
    REJECT_RETURN: (id: string) => `/admin/returns/${id}/reject`,
  },
  INVENTORY: {
    LIST: '/admin/inventory',
  },
  COMMISSIONS: {
    LIST: '/admin/commissions',
    CONFIGS: '/admin/finance/commission-config',
    CREATE_CONFIG: '/admin/finance/commission-config',
    UPDATE_CONFIG: (id: string) => `/admin/finance/commission-config/${id}`,
    TOGGLE_CONFIG: (id: string) => `/admin/finance/commission-config/${id}/toggle`,
    DELETE_CONFIG: (id: string) => `/admin/finance/commission-config/${id}`,
  },
  PAYOUTS: {
    LIST: '/admin/finance/payouts',
    CONFIRM_MANUAL: (id: string) => `/admin/finance/payouts/${id}/confirm-manual`,
    RETRY: (id: string) => `/admin/finance/payouts/${id}/retry`,
    ELIGIBLE: '/admin/finance/settlements/eligible',
    TRIGGER_BATCH: '/admin/finance/settlements/batch',
    READINESS_OVERVIEW: '/admin/finance/settlements/readiness-overview',
  },
  FINANCE: {
    OVERVIEW: '/admin/finance/overview',
  },
  INVOICES: {
    LIST: '/admin/invoices',
    DETAIL: (id: string) => `/admin/invoices/${id}`,
  },
  AUTHENTICITY: {
    LIST: '/admin/authenticity',
    VERIFY: (id: string) => `/admin/authenticity/${id}/verify`,
  },
  COUPONS: {
    LIST: '/admin/coupons',
    CREATE: '/admin/coupons',
    UPDATE_STATUS: (id: string) => `/admin/coupons/${id}`,
  },
  REVIEWS: {
    LIST: '/admin/reviews',
    UPDATE_STATUS: (id: string) => `/admin/reviews/${id}/status`,
  },
  NOTIFICATIONS: {
    LIST: '/admin/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
  ANALYTICS: {
    OVERVIEW: '/admin/analytics',
  },
  AUDIT: {
    LIST: '/admin/audit-logs',
  },
  SUPPORT: {
    TICKETS: '/admin/support/tickets',
    UPDATE_TICKET: (id: string) => `/admin/support/tickets/${id}`,
  },
  PROFILE: {
    ME: '/users/me',
    UPDATE: '/users/me',
  },
  SETTINGS: {
    GET: '/admin/settings',
  },
  DASHBOARD: {
    OVERVIEW: '/admin/dashboard',
  },
} as const
