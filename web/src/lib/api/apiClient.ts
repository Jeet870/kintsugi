import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { useAuthStore } from '@/stores/useAuthStore'

/* ─── Normalized API Error Contract ─── */
export interface APIError {
  status: number
  code?: string
  message: string
  details?: Record<string, string[]> | unknown
}

/* ─── Custom Internal Request Config ─── */
interface CustomInternalConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/* ─── Failed Refresh Queue ─── */
interface FailedQueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

function processQueue(error: unknown | null, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/* ─── Create Shared Axios Instance ─── */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/* ─── Request Interceptor ─── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }

    if (!config.headers['X-Timezone']) {
      try {
        config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch {
        // Fallback
      }
    }

    if (!config.headers['X-App-Version']) {
      config.headers['X-App-Version'] = '1.0.0'
    }

    return config
  },
  (error: unknown) => Promise.reject(normalizeError(error)),
)

/* ─── Response Interceptor (Automatic 401 Refresh Queue) ─── */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH)
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenStorage.getRefreshToken()

      if (!refreshToken) {
        isRefreshing = false
        tokenStorage.clearTokens()
        useAuthStore.getState().clearAuth()
        return Promise.reject(normalizeError(error))
      }

      try {
        const refreshResponse = await axios.post<{ access_token: string }>(
          `${env.API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const newAccessToken = refreshResponse.data.access_token
        tokenStorage.setAccessToken(newAccessToken)

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        isRefreshing = false

        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        isRefreshing = false

        tokenStorage.clearTokens()
        useAuthStore.getState().clearAuth()

        return Promise.reject(normalizeError(refreshErr))
      }
    }

    return Promise.reject(normalizeError(error))
  },
)

/* ─── Error Normalizer ─── */
export function normalizeError(error: unknown): APIError {
  if (axios.isCancel(error)) {
    return {
      status: 0,
      code: 'REQUEST_CANCELLED',
      message: 'Request was cancelled by client.',
    }
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as any

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        status: 408,
        code: 'TIMEOUT',
        message: 'Request timed out. Please check your connection and try again.',
      }
    }

    if (!error.response || error.code === 'ERR_NETWORK') {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Network error. Please verify your internet connection.',
      }
    }

    const message =
      data?.detail || data?.message || error.message || 'An unexpected error occurred.'

    return {
      status,
      code: data?.code || `HTTP_${status}`,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      details: data?.details || data?.detail || undefined,
    }
  }

  if (error instanceof Error) {
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: error.message,
    }
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
  }
}

export default apiClient
