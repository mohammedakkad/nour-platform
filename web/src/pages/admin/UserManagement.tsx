import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Search, RefreshCw, ShieldCheck, X, AlertCircle } from 'lucide-react'
import { api } from '../../api/client'

interface User { id: string; username: string; fullNameAr: string; role: string; isActive: boolean }

const ROLE_META: Record<string, { label: string; color: string }> = {
  STUDENT:      { label: 'طالب',        color: '#0F766E' },
  TEACHER:      { label: 'معلم',        color: '#2563EB' },
  SCHOOL_ADMIN: { label: 'مدير',        color: '#D97706' },
  PARENT:       { label: 'ولي أمر',     color: '#7C3AED' },
  DONOR:        { label: 'مانح',        color: '#64748B' },
  SUPER_ADMIN:  { label: 'مدير عام',   color: '#DB2777' },
}

const ROLE_TABS = [
  { key: 'ALL', label: 'الكل' }, { key: 'STUDENT', label: 'طلاب' },
  { key: 'TEACHER', label: 'معلمون' }, { key: 'SCHOOL_ADMIN', label: 'مدراء' },
  { key: 'PARENT', label: 'أولياء' },
]

export default function UserManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showAdd, setShowAdd]       = useState(false)
  const [invite, setInvite]         = useState({ fullNameAr: '', username: '', password: '', role: 'TEACHER' })
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const { data, isLoading, refetch } = useQuery<User[]>({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get('/admin/users', { params: { role: roleFilter !== 'ALL' ? roleFilter : undefined } })
      .then(r => r.data).catch(() => []),
    retry: false,
  })

  const inviteMutation = useMutation({
    mutationFn: () => api.post('/auth/register', {
      username: invite.username, password: invite.password,
      fullNameAr: invite.fullNameAr, role: invite.role,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setInviteSuccess(true)
      setInvite({ fullNameAr: '', username: '', password: '', role: 'TEACHER' })
      setTimeout(() => { setShowAdd(false); setInviteSuccess(false) }, 1500)
    },
    onError: (err: any) => setInviteError(err.response?.data?.message ?? 'فشل إنشاء الحساب'),
  })

  const users = (data ?? []).filter(u =>
    !search || u.fullNameAr.includes(search) || u.username.includes(search)
  )

  return (
    <div className="space-y-4 md:space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 anim-fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-black" style={{ fontFamily: 'Tajawal', color: 'var(--text)' }}>
            إدارة المستخدمين
          </h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>إدارة حسابات المنصة</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold">
            <UserPlus size={14} /> إضافة
          </button>
        </div>
      </div>

      {/* Role filter — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 anim-fade-up delay-1" style={{ scrollbarWidth: 'none' }}>
        {ROLE_TABS.map(tab => (
          <button key={tab.key} onClick={() => setRoleFilter(tab.key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: roleFilter === tab.key ? 'var(--teal)' : 'var(--surface-2)',
              color: roleFilter === tab.key ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
              boxShadow: roleFilter === tab.key ? '0 2px 8px rgba(15,118,110,.3)' : 'none',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative anim-fade-up delay-2">
        <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field pr-9 text-sm h-9" placeholder="بحث بالاسم أو اسم المستخدم..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* User list */}
      <div className="page-card anim-fade-up delay-2" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 px-4">
            <ShieldCheck size={32} className="mx-auto mb-3" style={{ color: 'var(--text-subtle)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {data?.length === 0 ? 'لا تتوفر بيانات المستخدمين عبر الـ API' : 'لا توجد نتائج'}
            </p>
            {data?.length === 0 && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-subtle)' }}>
                أضف مستخدمين باستخدام زر "إضافة"
              </p>
            )}
          </div>
        ) : (
          <div>
            {users.map((user, i) => {
              const meta = ROLE_META[user.role] ?? ROLE_META.STUDENT
              return (
                <div key={user.id}
                  className={`table-row flex items-center gap-3 px-4 py-3 anim-fade-up delay-${Math.min(i+1,6)}`}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }}>
                    {user.fullNameAr.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.fullNameAr}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.username}</p>
                  </div>
                  {/* Role badge */}
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: meta.color + '18', color: meta.color }}>
                    {meta.label}
                  </span>
                  {/* Status — hidden on small mobile */}
                  <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: user.isActive ? 'rgba(21,128,61,.1)' : 'rgba(239,68,68,.1)', color: user.isActive ? '#15803D' : '#EF4444' }}>
                    {user.isActive ? 'نشط' : 'موقوف'}
                  </span>
                </div>
              )
            })}
            <div className="px-4 py-2.5 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-subtle)' }}>
              {users.length} مستخدم
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="anim-scale-in w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>إضافة مستخدم جديد</h3>
              <button onClick={() => { setShowAdd(false); setInviteError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={19} />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="text-center py-8">
                <ShieldCheck size={36} className="mx-auto mb-3 text-green-500" />
                <p className="font-bold" style={{ color: 'var(--text)' }}>تم إنشاء الحساب!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'الاسم الكامل بالعربية', field: 'fullNameAr', placeholder: 'محمد أحمد', type: 'text' },
                  { label: 'اسم المستخدم', field: 'username', placeholder: 'username123', type: 'text' },
                  { label: 'كلمة المرور (8+ أحرف)', field: 'password', placeholder: '••••••••', type: 'password' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                    <input type={f.type} className="input-field text-sm" placeholder={f.placeholder}
                      value={(invite as any)[f.field]}
                      onChange={e => setInvite(v => ({ ...v, [f.field]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>الدور</label>
                  <select className="input-field text-sm" value={invite.role}
                    onChange={e => setInvite(v => ({ ...v, role: e.target.value }))}>
                    {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                {inviteError && (
                  <div className="flex items-center gap-2 text-xs p-3 rounded-lg"
                    style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#EF4444' }}>
                    <AlertCircle size={13} /> {inviteError}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { setShowAdd(false); setInviteError('') }}
                    className="btn-secondary flex-1 py-2.5 rounded-xl text-sm">إلغاء</button>
                  <button
                    onClick={() => { setInviteError(''); inviteMutation.mutate() }}
                    disabled={inviteMutation.isPending || !invite.fullNameAr || !invite.username || invite.password.length < 8}
                    className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {inviteMutation.isPending
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />...</>
                      : <><UserPlus size={14} />إنشاء</>}
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
