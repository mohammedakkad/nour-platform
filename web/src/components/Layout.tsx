import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, FileCheck, Users, BookOpen,
  LogOut, Menu, X, TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from './ThemeToggle'
import clsx from 'clsx'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles: string[]
}

const navItems: NavItem[] = [
  { to: '/admin',                  icon: <LayoutDashboard size={18} />, label: 'لوحة التحكم',    roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/content-approval', icon: <FileCheck size={18} />,       label: 'اعتماد المحتوى', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/users',            icon: <Users size={18} />,            label: 'إدارة المستخدمين',roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/teacher',                icon: <BookOpen size={18} />,         label: 'لوحة المعلم',    roles: ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/donor',                  icon: <TrendingUp size={18} />,       label: 'تقارير الأثر',   roles: ['DONOR', 'SUPER_ADMIN'] },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { resolvedTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const filteredNav = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  )

  const RoleBadge = () => {
    const roleLabels: Record<string, { label: string; cls: string }> = {
      SCHOOL_ADMIN: { label: 'مشرف',    cls: 'badge-admin' },
      SUPER_ADMIN:  { label: 'مدير عام', cls: 'badge-admin' },
      TEACHER:      { label: 'معلم',     cls: 'badge-teacher' },
      DONOR:        { label: 'مانح',     cls: 'badge-donor' },
    }
    const role = roleLabels[user?.role ?? '']
    return role ? <span className={role.cls}>{role.label}</span> : null
  }

  const Sidebar = ({ mobile = false }) => (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--sidebar-bg)',
      borderLeft: `1px solid var(--sidebar-border)`,
      height: mobile ? '100%' : '100vh',
      position: mobile ? 'relative' : 'sticky',
      top: 0,
      transition: 'background .3s ease',
    }}>
      {/* Logo + Theme Toggle */}
      <div style={{
        padding: '20px',
        borderBottom: `1px solid var(--border)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Tajawal',
            fontSize: 28, fontWeight: 900,
            background: 'linear-gradient(135deg, var(--teal), var(--gold))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}>نور</h1>
          <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>لوحة الإدارة</p>
        </div>
        <ThemeToggle variant="icon" />
      </div>

      {/* User info */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid var(--border)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--teal-bg)',
            border: `1px solid var(--teal-border)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--teal)', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.fullNameAr?.charAt(0) ?? '؟'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullNameAr}
            </p>
            <RoleBadge />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={['/admin', '/teacher', '/donor'].includes(item.to)}
            onClick={() => mobile && setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
              color: isActive ? 'var(--sidebar-item-active-text)' : 'var(--text-muted)',
              transition: 'all .15s',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 8px', borderTop: `1px solid var(--border)` }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            fontSize: 13, fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            transition: 'all .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(220,38,38,.08)'
            e.currentTarget.style.color = 'var(--error)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block" style={{ width: 220, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="lg:hidden">
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 220, boxShadow: 'var(--shadow-lg)' }}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Bar */}
        <header
          className="lg:hidden"
          style={{
            position: 'sticky', top: 0, zIndex: 40,
            background: 'var(--surface)',
            borderBottom: `1px solid var(--border)`,
            padding: '0 16px', height: 56,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} />
          </button>
          <h1 style={{ fontFamily: 'Tajawal', fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, var(--teal), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            نور
          </h1>
          <div style={{ marginRight: 'auto' }}>
            <ThemeToggle variant="icon" />
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px 32px', maxWidth: 1280, width: '100%', margin: '0 auto' }}
          className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}