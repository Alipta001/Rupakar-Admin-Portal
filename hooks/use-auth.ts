'use client'

import { useCallback } from 'react'
import { AdminSession } from '@/types/auth'
import { useAppSelector, useAppDispatch } from '@/redux/store/store'
import { logout as reduxLogout, updateUser as reduxUpdateUser } from '@/redux/slice/authSlice'
import { authClient } from '@/lib/auth/auth-client'
import { getSession } from '@/lib/auth/session'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, role, status } = useAppSelector((state) => state.auth)

  const sessionFallback = getSession()

  const currentSession: AdminSession | null = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status === 'ACTIVE' ? 'Active' : 'Suspended',
        lastSignIn: user.lastSignIn || 'Active now',
      }
    : sessionFallback

  const logout = useCallback(async () => {
    dispatch(reduxLogout())
    await authClient.logout()
    window.location.assign('/login')
  }, [dispatch])

  const updateProfile = useCallback(
    async (updates: Partial<AdminSession>) => {
      if (updates.name || updates.email) {
        dispatch(reduxUpdateUser({ name: updates.name, email: updates.email }))
      }
      return authClient.updateProfile({
        name: updates.name,
        email: updates.email,
      })
    },
    [dispatch]
  )

  return {
    session: currentSession,
    user,
    isAuthenticated: isAuthenticated || !!sessionFallback,
    role: role || currentSession?.role || 'Administrator',
    loading: status === 'loading' || status === 'initializing',
    logout,
    updateProfile,
  }
}
