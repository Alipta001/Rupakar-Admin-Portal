import { AdminRole } from '@/types/auth'
import { ROLE_PERMISSIONS } from '@/config/permissions'

export function normalizeRole(role: AdminRole | string): AdminRole {
  const upper = String(role || '').toUpperCase()
  if (upper === 'ADMIN' || upper === 'SUPER_ADMIN' || upper === 'FINANCE_MANAGER' || upper === 'CONTENT_MANAGER' || upper === 'SUPPORT') {
    return upper as AdminRole
  }
  return 'ADMIN'
}

export function hasPermission(role: AdminRole | string, permission: string): boolean {
  const normalized = normalizeRole(role)
  if (normalized === 'SUPER_ADMIN') return true
  const permissions = ROLE_PERMISSIONS[normalized] || []
  if (permissions.includes('*')) return true
  if (permissions.includes(permission)) return true

  // Wildcard check (e.g. 'users:*')
  const [module] = permission.split(':')
  if (permissions.includes(`${module}:*`)) return true

  return false
}

export function canAccessRoute(role: AdminRole | string, route: string): boolean {
  const normalized = normalizeRole(role)
  if (normalized === 'SUPER_ADMIN' || normalized === 'ADMIN') return true
  if (route === '/' || route === '/dashboard' || route === '/profile') return true

  const routePermissionMap: Record<string, string> = {
    '/users': 'users:read',
    '/vendors': 'vendors:read',
    '/products': 'products:read',
    '/orders': 'orders:read',
    '/payments': 'payments:read',
    '/refunds': 'refunds:manage',
    '/commissions': 'commissions:manage',
    '/payouts': 'payouts:execute',
    '/invoices': 'invoices:manage',
    '/settings': 'settings:manage',
    '/audit-logs': 'audit-logs:read',
  }

  const required = routePermissionMap[route]
  if (!required) return true
  return hasPermission(normalized, required)
}

