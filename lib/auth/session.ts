import { AdminSession } from '@/types/auth'

export type { AdminSession }

let activeSession: AdminSession | null = null

export function getSession(): AdminSession | null {
  return activeSession
}

export function clearSession(): void {
  activeSession = null
}

export function setSession(session: AdminSession): void {
  activeSession = session
}

export function updateSession(updates: Partial<AdminSession>): AdminSession | null {
  if (!activeSession) return null
  activeSession = { ...activeSession, ...updates }
  return activeSession
}

export function isAuthenticated(): boolean {
  return activeSession !== null
}
