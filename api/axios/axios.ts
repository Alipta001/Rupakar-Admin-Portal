import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

let currentAccessToken: string | null = null
let onLogoutCallback: (() => void) | null = null
let onTokenRefreshedCallback: ((newToken: string) => void) | null = null

export const setAuthToken = (token: string | null) => {
  currentAccessToken = token
}

export const getAuthToken = (): string | null => {
  return currentAccessToken
}

export const registerAuthCallbacks = (callbacks: {
  onLogout?: () => void
  onTokenRefreshed?: (newToken: string) => void
}) => {
  if (callbacks.onLogout) onLogoutCallback = callbacks.onLogout
  if (callbacks.onTokenRefreshed) onTokenRefreshedCallback = callbacks.onTokenRefreshed
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Bearer token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error)
)

// Single-flight refresh token queue state
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor: 401 handling + single-flight refresh protection
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Do not attempt refresh on login or refresh endpoint itself
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.accessToken

        if (!newToken) {
          throw new Error('No access token returned from refresh endpoint')
        }

        currentAccessToken = newToken
        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback(newToken)
        }

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        currentAccessToken = null
        if (onLogoutCallback) {
          onLogoutCallback()
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
