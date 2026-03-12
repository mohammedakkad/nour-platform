import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor: attach JWT ──
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle 401 ──
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken } = response.data
        useAuthStore.getState().setTokens(accessToken, refreshToken!)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
