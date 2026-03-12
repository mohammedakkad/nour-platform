import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, FileCheck, Users, BookOpen,
  Bell, Settings, LogOut, Menu, X, TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles: string[]
}

const navItems: NavItem[] = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'لوحة التحكم', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/content-approval', icon: <FileCheck size={18} />, label: 'اعتماد المحتوى', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/users', icon: <Users size={18} />, label: 'إدارة المستخدمين', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/teacher', icon: <BookOpen size={18} />, label: 'لوحة المعلم', roles: ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] },
  { to: '/donor', icon: <TrendingUp size={18} />, label: 'تقارير الأثر', roles: ['DONOR', 'SUPER_ADMIN'] },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNavItems = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  )

  const RoleBadge = () => {
    const roleLabels: Record<string, { label: string; className: string }> = {
      SCHOOL_ADMIN: { label: 'مشرف', className: 'badge-admin' },
      SUPER_ADMIN:  { label: 'مدير عام', className: 'badge-admin' },
      TEACHER:      { label: 'معلم', className: 'badge-teacher' },
      DONOR:        { label: 'مانح', className: 'badge-donor' },
    }
    const role = roleLabels[user?.role ?? '']
    return role ? <span className={role.className}>{role.label}</span> : null
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={clsx(
      'flex flex-col bg-white border-l border-gray-200',
      mobile ? 'h-full' : 'h-screen sticky top-0'
    )}>
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-3xl font-black text-teal-700" style={{ fontFamily: 'Tajawal' }}>نور</h1>
        <p className="text-xs text-gray-400 mt-0.5">لوحة الإدارة</p>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            {user?.fullNameAr?.charAt(0) ?? '؟'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullNameAr}</p>
            <RoleBadge />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/teacher' || item.to === '/donor'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
            onClick={() => mobile && setSidebarOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-56 shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-black text-teal-700" style={{ fontFamily: 'Tajawal' }}>نور</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
