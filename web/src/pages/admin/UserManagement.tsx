import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Search, RefreshCw, ShieldCheck, X, AlertCircle } from 'lucide-react'
import { api } from '../../api/client'
import { useThemeStore } from '../../store/themeStore'

interface User {
  id: string; username: string; fullNameAr: string
  role: string; schoolId: string | null; classId: string | null; isActive: boolean
}

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  STUDENT:      { label: 'طالب',        color: '#0F766E', bg: 'rgba(15,118,110,.12)' },
  TEACHER:      { label: 'معلم',        color: '#2563EB', bg: 'rgba(37,99,235,.12)'  },
  SCHOOL_ADMIN: { label: 'مدير مدرسة', color: '#D97706', bg: 'rgba(217,119,6,.12)'  },
  PARENT:       { label: 'ولي أمر',     color: '#7C3AED', bg: 'rgba(124,58,237,.12)' },
  DONOR:        { label: 'مانح',        color: '#64748B', bg: 'rgba(100,116,139,.12)'},
  SUPER_ADMIN:  { label: 'مدير عام',   color: '#DB2777', bg: 'rgba(219,39,119,.12)' },
}

export default function UserManagement() {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showAdd, setShowAdd]     = useState(false)
  const [invite, setInvite]       = useState({ fullNameAr: '', username: '', password: '', role: 'TEACHER' })
  const [inviteError, setInviteError]   = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const { data, isLoading, refetch } = useQuery<User[]>({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get('/admin/users', {
      params: { role: roleFilter !== 'ALL' ? roleFilter : undefined }
    }).then(r => r.data).catch(() => []),
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

  const roleTabs = ['ALL', 'STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PARENT', 'DONOR']
  const roleTabLabels: Record<string, string> = {
    ALL: 'الكل', STUDENT: 'طلاب', TEACHER: 'معلمون',
    SCHOOL_ADMIN: 'مدراء', PARENT: 'أولياء', DONOR: 'مانحون',
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="anim-fade-up flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal' }}>إدارة المستخدمين</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>إدارة حسابات المنصة</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => refetch()}
            style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700 }}>
            <UserPlus size={15} /> إضافة مستخدم
          </button>
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="anim-fade-up delay-1" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {roleTabs.map(tab => (
          <button key={tab} onClick={() => setRoleFilter(tab)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', transition: 'all .2s',
              background: roleFilter === tab ? 'var(--teal)' : 'var(--surface-2)',
              color: roleFilter === tab ? '#fff' : 'var(--text-muted)',
              boxShadow: roleFilter === tab ? '0 2px 8px rgba(15,118,110,.3)' : 'none',
            }}>
            {roleTabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="anim-fade-up delay-2" style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" style={{ paddingRight: 36, fontSize: 13 }}
          placeholder="بحث بالاسم أو اسم المستخدم..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="page-card anim-fade-up delay-2" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 52 }} />)}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <ShieldCheck size={36} style={{ color: 'var(--text-subtle)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>
              {data?.length === 0 ? 'لا تتوفر بيانات المستخدمين عبر الـ API حالياً' : 'لا توجد نتائج للبحث'}
            </p>
            {data?.length === 0 && (
              <p style={{ color: 'var(--text-subtle)', fontSize: 12, marginTop: 6 }}>
                يمكنك إضافة مستخدمين جدد باستخدام زر "إضافة مستخدم"
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px 80px 64px', gap: 0, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['الاسم', 'اسم المستخدم', 'الدور', 'الحالة', ''].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.04em' }}>{h}</span>
              ))}
            </div>
            {users.map((user, i) => {
              const meta = ROLE_META[user.role] ?? ROLE_META.STUDENT
              return (
                <div key={user.id}
                  className={`anim-fade-up delay-${Math.min(i + 1, 6)}`}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 110px 80px 64px',
                    gap: 0, padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--teal)', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {user.fullNameAr.charAt(0)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.fullNameAr}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{user.username}</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: meta.bg, color: meta.color, fontWeight: 600 }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                      background: user.isActive ? 'rgba(21,128,61,.1)' : 'rgba(239,68,68,.1)',
                      color: user.isActive ? '#15803D' : '#EF4444',
                    }}>
                      {user.isActive ? 'نشط' : 'موقوف'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4, borderRadius: 6, transition: 'color .2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                    >
                      <ShieldCheck size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
            <div style={{ padding: '10px 20px', fontSize: 12, color: 'var(--text-subtle)', borderTop: '1px solid var(--border)' }}>
              {users.length} مستخدم
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="anim-scale-in" style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', padding: 24, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>إضافة مستخدم جديد</h3>
              <button onClick={() => { setShowAdd(false); setInviteError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {inviteSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(21,128,61,.1)', border: '1px solid rgba(21,128,61,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#15803D' }}>
                  <ShieldCheck size={24} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>تم إنشاء الحساب بنجاح!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'الاسم الكامل بالعربية', field: 'fullNameAr', placeholder: 'محمد أحمد', type: 'text' },
                  { label: 'اسم المستخدم', field: 'username', placeholder: 'username123', type: 'text' },
                  { label: 'كلمة المرور', field: 'password', placeholder: '8 أحرف على الأقل', type: 'password' },
                ].map(f => (
                  <div key={f.field}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} className="input-field" style={{ fontSize: 13 }} placeholder={f.placeholder}
                      value={(invite as any)[f.field]}
                      onChange={e => setInvite(v => ({ ...v, [f.field]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>الدور</label>
                  <select className="input-field" style={{ fontSize: 13 }}
                    value={invite.role} onChange={e => setInvite(v => ({ ...v, role: e.target.value }))}>
                    {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                {inviteError && (
                  <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 12px', color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={13} /> {inviteError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                  <button onClick={() => { setShowAdd(false); setInviteError('') }} className="btn-secondary"
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13 }}>إلغاء</button>
                  <button
                    onClick={() => { setInviteError(''); inviteMutation.mutate() }}
                    disabled={inviteMutation.isPending || !invite.fullNameAr || !invite.username || invite.password.length < 8}
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, opacity: inviteMutation.isPending || !invite.fullNameAr || !invite.username || invite.password.length < 8 ? .5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {inviteMutation.isPending ? (
                      <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> جاري...</>
                    ) : <><UserPlus size={14} /> إنشاء الحساب</>}
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
