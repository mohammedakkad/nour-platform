import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request: attach JWT ──
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: handle 401 → refresh token ──
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { refreshToken } = useAuthStore.getState()
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        })
        const newAccess  = response.data.access_token
        const newRefresh = response.data.refresh_token ?? refreshToken

        useAuthStore.getState().setTokens(newAccess, newRefresh!)
        original.headers.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

// Auth API helpers
export const authApi = {
  login:   (data: { username: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),

  register: (data: any) =>
    api.post('/auth/register', data).then(r => r.data),

  logout:  () =>
    api.post('/auth/logout').catch(() => {}),
}