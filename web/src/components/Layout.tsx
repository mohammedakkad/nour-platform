import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, FileCheck, Users, BookOpen,
  LogOut, Menu, X, TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { to: '/admin',                  icon: <LayoutDashboard size={18} />, label: 'لوحة التحكم',     roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/content-approval', icon: <FileCheck size={18} />,       label: 'اعتماد المحتوى',  roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/users',            icon: <Users size={18} />,            label: 'إدارة المستخدمين', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/teacher',                icon: <BookOpen size={18} />,         label: 'لوحة المعلم',     roles: ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/donor',                  icon: <TrendingUp size={18} />,       label: 'تقارير الأثر',    roles: ['DONOR', 'SUPER_ADMIN'] },
]

const ROLE_LABELS: Record<string, string> = {
  SCHOOL_ADMIN: 'مشرف', SUPER_ADMIN: 'مدير عام', TEACHER: 'معلم', DONOR: 'مانح',
}

// مكوّن الـ Sidebar المشترك
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  const filtered = navItems.filter(i => user?.role && i.roles.includes(user.role))

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)', borderLeft: '1px solid var(--sidebar-border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{
            fontFamily: 'Tajawal', fontSize: 28, fontWeight: 900, lineHeight: 1,
            background: 'linear-gradient(135deg, var(--teal), var(--gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>نور</h1>
          <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>لوحة الإدارة</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ThemeToggle variant="icon" />
          {/* زر الإغلاق — يظهر فقط على الموبايل */}
          {onClose && (
            <button onClick={onClose} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)',
              padding: '4px 6px', display: 'flex', alignItems: 'center',
            }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--teal)', fontWeight: 700, fontSize: 13,
          }}>
            {user?.fullNameAr?.charAt(0) ?? '؟'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullNameAr}
            </p>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={['/admin', '/teacher', '/donor'].includes(item.to)}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              fontSize: 14, fontWeight: isActive ? 600 : 500,
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
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            fontSize: 14, fontWeight: 500, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ثابت على الديسكتوب فقط ── */}
      <div className="hidden lg:block" style={{ width: 224, flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <SidebarContent />
        </div>
      </div>

      {/* ── Overlay Drawer للموبايل فقط ── */}
      {open && (
        <div
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}
        >
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(3px)' }}
            onClick={() => setOpen(false)}
          />
          {/* Drawer من اليمين (RTL) */}
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 260, zIndex: 1 }}>
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* ── المحتوى الرئيسي ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar — موبايل فقط */}
        <header
          className="lg:hidden"
          style={{
            position: 'sticky', top: 0, zIndex: 40,
            height: 56, padding: '0 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}
          >
            <Menu size={22} />
          </button>

          <span style={{
            fontFamily: 'Tajawal', fontSize: 22, fontWeight: 900,
            background: 'linear-gradient(135deg, var(--teal), var(--gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            نور
          </span>

          <div style={{ marginRight: 'auto' }}>
            <ThemeToggle variant="icon" />
          </div>
        </header>

        {/* الصفحات */}
        <main style={{ flex: 1, padding: '16px', maxWidth: 1280, width: '100%', margin: '0 auto' }}
          className="md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}