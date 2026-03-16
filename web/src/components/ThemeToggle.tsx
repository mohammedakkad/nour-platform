import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore, type Theme } from '../store/themeStore'
import { useState, useRef, useEffect } from 'react'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
}

export default function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useThemeStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light',  label: 'فاتح',   icon: <Sun size={14} /> },
    { value: 'dark',   label: 'داكن',   icon: <Moon size={14} /> },
    { value: 'system', label: 'تلقائي', icon: <Monitor size={14} /> },
  ]

  const currentIcon = resolvedTheme === 'dark'
    ? <Moon size={16} />
    : <Sun size={16} />

  if (variant === 'icon') {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all .2s',
          }}
          title="تغيير الثيم"
        >
          {currentIcon}
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-md)',
            padding: '4px',
            zIndex: 200,
            minWidth: 130,
          }}>
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTheme(opt.value); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: theme === opt.value ? 'var(--teal-bg)' : 'transparent',
                  color: theme === opt.value ? 'var(--teal)' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: theme === opt.value ? 600 : 400,
                  transition: 'all .15s',
                }}
              >
                {opt.icon}
                {opt.label}
                {theme === opt.value && (
                  <span style={{ marginRight: 'auto', color: 'var(--teal)', fontSize: 11 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Full variant — show all 3 as a pill group
  return (
    <div style={{
      display: 'flex',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 3,
      gap: 2,
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            borderRadius: 7,
            background: theme === opt.value ? 'var(--surface)' : 'transparent',
            boxShadow: theme === opt.value ? 'var(--shadow-sm)' : 'none',
            color: theme === opt.value ? 'var(--text)' : 'var(--text-subtle)',
            border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: theme === opt.value ? 600 : 400,
            transition: 'all .2s',
          }}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}