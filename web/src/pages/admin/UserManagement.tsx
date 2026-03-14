import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Search, Filter, RefreshCw, ShieldCheck, ShieldOff, Eye } from 'lucide-react'
import { api } from '../../api/client'

interface User {
  id: string
  username: string
  fullNameAr: string
  role: string
  schoolId: string | null
  classId: string | null
  isActive: boolean
}

const ROLE_META: Record<string, { label: string; cls: string }> = {
  STUDENT:     { label: 'طالب',       cls: 'badge-student' },
  TEACHER:     { label: 'معلم',       cls: 'badge-teacher' },
  SCHOOL_ADMIN:{ label: 'مدير مدرسة', cls: 'badge-admin' },
  PARENT:      { label: 'ولي أمر',    cls: 'badge-parent' },
  DONOR:       { label: 'مانح',       cls: 'badge-donor' },
  SUPER_ADMIN: { label: 'مدير عام',   cls: 'badge-admin' },
}

export default function UserManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showInvite, setShowInvite] = useState(false)
  const [invite, setInvite]         = useState({ fullNameAr: '', username: '', password: '', role: 'TEACHER' })
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  // Since there's no GET /users endpoint, we'll show a message
  // and use what's available (register to create users)
  const { data, isLoading, isError, refetch } = useQuery<User[]>({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get('/admin/users', { params: { role: roleFilter !== 'ALL' ? roleFilter : undefined } })
      .then(r => r.data).catch(() => []),
    retry: false,
  })

  const inviteMutation = useMutation({
    mutationFn: () => api.post('/auth/register', {
      username: invite.username,
      password: invite.password,
      fullNameAr: invite.fullNameAr,
      role: invite.role,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setInviteSuccess(true)
      setInvite({ fullNameAr: '', username: '', password: '', role: 'TEACHER' })
      setTimeout(() => { setShowInvite(false); setInviteSuccess(false) }, 1500)
    },
    onError: (err: any) => {
      setInviteError(err.response?.data?.message ?? 'فشل إنشاء الحساب')
    },
  })

  const users = (data ?? []).filter(u => {
    const matchSearch = !search ||
      u.fullNameAr.includes(search) ||
      u.username.includes(search)
    return matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة حسابات الطلاب والمعلمين وأولياء الأمور</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => refetch()} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 btn-primary text-sm">
            <UserPlus size={16} /> إضافة مستخدم
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pr-9"
            placeholder="بحث بالاسم أو اسم المستخدم..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto min-w-40"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="ALL">جميع الأدوار</option>
          {Object.entries(ROLE_META).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : isError || !data?.length ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">لا تتوفر بيانات المستخدمين</p>
            <p className="text-gray-400 text-sm mt-1">
              نقطة نهاية قائمة المستخدمين ستُضاف في التحديث القادم للـ API
            </p>
            <p className="text-gray-400 text-sm mt-2">
              يمكنك إضافة مستخدمين جدد باستخدام زر "إضافة مستخدم" أعلاه
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">الاسم</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">اسم المستخدم</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">الدور</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">الحالة</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                            {user.fullNameAr.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.fullNameAr}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{user.username}</td>
                      <td className="px-5 py-4">
                        <span className={ROLE_META[user.role]?.cls ?? 'badge-donor'}>
                          {ROLE_META[user.role]?.label ?? user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {user.isActive ? 'نشط' : 'موقوف'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50">
                            {user.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {users.length} مستخدم
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-5">إضافة مستخدم جديد</h3>
            {inviteSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">تم إنشاء الحساب بنجاح!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل بالعربية</label>
                  <input className="input-field" placeholder="محمد أحمد"
                    value={invite.fullNameAr}
                    onChange={e => setInvite(f => ({ ...f, fullNameAr: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                  <input className="input-field" placeholder="username123"
                    value={invite.username}
                    onChange={e => setInvite(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                  <input type="password" className="input-field" placeholder="8 أحرف على الأقل"
                    value={invite.password}
                    onChange={e => setInvite(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                  <select className="input-field" value={invite.role}
                    onChange={e => setInvite(f => ({ ...f, role: e.target.value }))}>
                    {Object.entries(ROLE_META).map(([v, m]) => (
                      <option key={v} value={v}>{m.label}</option>
                    ))}
                  </select>
                </div>
                {inviteError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                    {inviteError}
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setShowInvite(false); setInviteError('') }}
                    className="flex-1 btn-secondary">إلغاء</button>
                  <button
                    onClick={() => { setInviteError(''); inviteMutation.mutate() }}
                    disabled={inviteMutation.isPending || !invite.fullNameAr || !invite.username || invite.password.length < 8}
                    className="flex-1 btn-primary disabled:opacity-50">
                    {inviteMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري...
                      </span>
                    ) : 'إنشاء الحساب'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
