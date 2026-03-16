import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// Initialize theme BEFORE render to prevent flash
const initTheme = () => {
  try {
    const stored = localStorage.getItem('nour-theme')
    if (stored) {
      const { state } = JSON.parse(stored)
      const theme = state?.theme ?? 'light'
      const resolved = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
      document.documentElement.classList.add(resolved)
    } else {
      // Default: light
      document.documentElement.classList.add('light')
    }
  } catch {
    document.documentElement.classList.add('light')
  }
}
initTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)