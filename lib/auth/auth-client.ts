import { AdminSession, AdminUser } from '@/types/auth'
import { clearSession, getSession, setSession, updateSession } from './session'
import axiosInstance from '@/api/axios/axios'
import { ENDPOINTS } from '@/api/endPoints/endPoints'
import { store } from '@/redux/store/store'
import { logout as reduxLogout, setCredentials } from '@/redux/slice/authSlice'
import { adminApi } from '@/redux/api/adminApi'

export interface LoginCredentials {
  email: string
  password?: string
  remember?: boolean
}

export const authClient = {
  getCurrentSession(): AdminSession | null {
    return getSession()
  },

  async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    if (!credentials.email) {
      return { success: false, error: 'Email is required' }
    }
    if (!credentials.password) {
      return { success: false, error: 'Password is required' }
    }

    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      })

      const data = response.data?.data || response.data
      const accessToken = data.accessToken || data.token
      const user = data.user || {
        id: data.id || 'admin-user',
        name: data.name || credentials.email.split('@')[0],
        email: credentials.email,
        role: data.role || 'ADMIN',
        status: 'ACTIVE',
      }

      const session: AdminSession = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status === 'ACTIVE' ? 'Active' : 'Suspended',
        lastSignIn: 'Just now',
        token: accessToken,
      }

      setSession(session)
      store.dispatch(setCredentials({ accessToken, user }))

      return { success: true, session }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Authentication failed'
      return { success: false, error: errorMsg }
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT, {})
    } catch {
      // Ignore network failures on logout
    } finally {
      clearSession()
      store.dispatch(reduxLogout())
      store.dispatch(adminApi.util.resetApiState())
    }
  },

  async updateProfile(updates: Partial<AdminUser>): Promise<AdminSession | null> {
    try {
      const res = await axiosInstance.patch(ENDPOINTS.PROFILE.UPDATE, updates)
      const updatedUser = res.data?.data || res.data
      return updateSession({
        name: updatedUser.name || updates.name,
        email: updatedUser.email || updates.email,
      })
    } catch {
      return updateSession({
        name: updates.name,
        email: updates.email,
      })
    }
  },
}
