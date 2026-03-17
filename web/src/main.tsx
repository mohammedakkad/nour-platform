import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

;(function initTheme() {
  try {
    const stored = localStorage.getItem('nour-theme')
    const theme  = stored ? JSON.parse(stored)?.state?.theme : 'light'
    const resolved =
      theme === 'dark'   ? 'dark' :
      theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
      'light'
    document.documentElement.classList.add(resolved)
  } catch {
    document.documentElement.classList.add('light')
  }
})()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 2 } },
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