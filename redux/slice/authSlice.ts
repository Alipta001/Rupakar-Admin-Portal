import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AdminRole, AdminUser } from '@/types/auth'
import { setAuthToken } from '@/api/axios/axios'

export interface AuthState {
  user: AdminUser | null
  accessToken: string | null
  role: AdminRole | null
  permissions: string[]
  isAuthenticated: boolean
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  role: null,
  permissions: [],
  isAuthenticated: false,
  status: 'idle',
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string
        user: AdminUser
      }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.role = action.payload.user.role
      state.isAuthenticated = true
      state.status = 'authenticated'
      state.error = null

      // Keep axios token in sync
      setAuthToken(action.payload.accessToken)
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      setAuthToken(action.payload)
    },
    updateUser: (state, action: PayloadAction<Partial<AdminUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        if (action.payload.role) {
          state.role = action.payload.role
        }
      }
    },
    setAuthLoading: (state) => {
      state.status = 'loading'
      state.error = null
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.status = 'failed'
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.role = null
      state.permissions = []
      state.isAuthenticated = false
      state.status = 'unauthenticated'
      state.error = null

      setAuthToken(null)
    },
  },
})

export const {
  setCredentials,
  updateToken,
  updateUser,
  setAuthLoading,
  setAuthError,
  logout,
} = authSlice.actions

export default authSlice.reducer
