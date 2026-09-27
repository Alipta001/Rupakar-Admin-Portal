'use client'

import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store, useAppDispatch } from '@/redux/store/store'
import { registerAuthCallbacks } from '@/api/axios/axios'
import { logout, setCredentials, updateToken, setAuthLoading } from '@/redux/slice/authSlice'
import { adminApi } from '@/redux/api/adminApi'
import axiosInstance from '@/api/axios/axios'
import { ENDPOINTS } from '@/api/endPoints/endPoints'
import { setSession, clearSession } from '@/lib/auth/session'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Register Axios refresh callbacks to sync with Redux store & RTK Query
    registerAuthCallbacks({
      onLogout: () => {
        dispatch(logout())
        dispatch(adminApi.util.resetApiState())
        clearSession()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.replace('/login')
        }
      },
      onTokenRefreshed: (newToken: string) => {
        dispatch(updateToken(newToken))
      },
    })

    // Attempt initial session restore via backend HttpOnly refresh cookie
    const restoreSession = async () => {
      dispatch(setAuthLoading())
      try {
        const refreshRes = await axiosInstance.post(ENDPOINTS.AUTH.REFRESH, {})
        const token =
          refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken
        const user = refreshRes.data?.data?.user || refreshRes.data?.user

        if (token && user) {
          dispatch(setCredentials({ accessToken: token, user }))
          setSession({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status === 'ACTIVE' ? 'Active' : 'Suspended',
            lastSignIn: 'Active Session',
            token,
          })
        } else {
          dispatch(logout())
        }
      } catch {
        // Not logged in or expired refresh token; set unauthenticated status
        dispatch(logout())
      }
    }

    restoreSession()
  }, [dispatch])


  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
