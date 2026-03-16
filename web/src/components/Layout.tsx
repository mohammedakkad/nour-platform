import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, FileCheck, Users, BookOpen,
  LogOut, Menu, X, TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { to: '/admin',                  icon: <LayoutDashboard size={17} />, label: 'لوحة التحكم',     roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/content-approval', icon: <FileCheck size={17} />,       label: 'اعتماد المحتوى',  roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/users',            icon: <Users size={17} />,            label: 'المستخدمون',      roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/teacher',                icon: <BookOpen size={17} />,         label: 'لوحة المعلم',     roles: ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/donor',                  icon: <TrendingUp size={17} />,       label: 'تقارير الأثر',    roles: ['DONOR', 'SUPER_ADMIN'] },
]

const ROLE_LABELS: Record<string, string> = {
  SCHOOL_ADMIN: 'مشرف', SUPER_ADMIN: 'مدير عام', TEACHER: 'معلم', DONOR: 'مانح',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const filteredNav = navItems.filter(i => user?.role && i.roles.includes(user.role))

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)' }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-black leading-none"
            style={{ fontFamily: 'Tajawal', background: 'linear-gradient(135deg,var(--teal),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            نور
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>لوحة الإدارة</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg lg:hidden"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }}>
            {user?.fullNameAr?.charAt(0) ?? '؟'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
              {user?.fullNameAr}
            </p>
            {user?.role && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={['/admin', '/teacher', '/donor'].includes(item.to)}
            onClick={() => onClose?.()}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
              color: isActive ? 'var(--sidebar-item-active-text)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-150"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,.08)'; e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-52 xl:w-56 flex-shrink-0 sticky top-0 h-screen border-l"
        style={{ borderColor: 'var(--sidebar-border)' }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 shadow-2xl border-l"
            style={{ borderColor: 'var(--border)' }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-black"
            style={{ fontFamily: 'Tajawal', background: 'linear-gradient(135deg,var(--teal),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            نور
          </h1>
          <div className="mr-auto">
            <ThemeToggle variant="icon" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
