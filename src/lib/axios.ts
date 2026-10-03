import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { RefreshResponse } from '../types/auth'
import { getAccessToken, setAccessToken } from './token'
import '../mocks/handlers'
import { mockAdapter } from '../mocks/adapter'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  adapter: mockAdapter,
})

const PUBLIC_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout']

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

function flushQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token))
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      PUBLIC_PATHS.includes(original.url ?? '')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (token) {
            resolve(api(original))
          } else {
            reject(error)
          }
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await api.post<RefreshResponse>('/auth/refresh')
      setAccessToken(data.accessToken)
      flushQueue(data.accessToken)
      return await api(original)
    } catch (refreshError) {
      setAccessToken(null)
      flushQueue(null)
      window.location.assign('/')
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api