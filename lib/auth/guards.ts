import { getSession } from './session'
import { AdminRole } from '@/types/auth'

export function isUserInRole(requiredRoles: AdminRole[]): boolean {
  const session = getSession()
  if (!session) return false
  if (session.role === 'Super administrator' || session.role === 'SUPER_ADMIN') return true
  return requiredRoles.some(r => r === session.role)
}

export function requireAuth(): boolean {
  return getSession() !== null
}
