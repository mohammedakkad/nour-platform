import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.accessToken, data.refreshToken)
      const role = data.user.role
      if (['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(role)) navigate('/admin')
      else if (role === 'TEACHER') navigate('/teacher')
      else if (role === 'DONOR') navigate('/donor')
      else navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'اسم المستخدم أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a10', display: 'flex', direction: 'rtl', fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif" }}>

      {/* ── Left Panel (decorative) ── */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#0c1a12 0%,#0a1628 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }} className="hidden lg:flex">
        {/* Glowing orb */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(245,158,11,.12),transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Tajawal', fontSize: 120, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(180deg,#fff 0%,rgba(245,158,11,.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 60px rgba(245,158,11,.2))', marginBottom: 16 }}>
            نور
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 16, letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 48 }}>NOUR PLATFORM</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
            {[
              { icon: '📚', text: 'محتوى تعليمي يعمل بدون إنترنت' },
              { icon: '🎓', text: 'اختبارات وتقييمات فورية' },
              { icon: '📊', text: 'تقارير أداء شاملة' },
              { icon: '🔄', text: 'مزامنة تلقائية مع السحابة' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', background: '#0d1117', borderRight: '1px solid rgba(255,255,255,.06)' }}>

        {/* Logo (mobile) */}
        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Tajawal', fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>نور</span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, marginTop: 4 }}>منصة التعليم المتكاملة</p>
        </div>

        <h2 style={{ fontFamily: 'Tajawal', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6 }}>أهلاً بعودتك</h2>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 36 }}>سجّل دخولك للوصول إلى لوحة التحكم</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>اسم المستخدم</label>
            <input
              type="text" autoComplete="username" required
              placeholder="أدخل اسم المستخدم"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '13px 16px', color: 'white', fontSize: 15, outline: 'none', transition: 'border .2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} autoComplete="current-password" required
                placeholder="أدخل كلمة المرور"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '13px 48px 13px 16px', color: 'white', fontSize: 15, outline: 'none', transition: 'border .2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading || !form.username || !form.password}
            style={{ background: loading ? 'rgba(245,158,11,.5)' : 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000', border: 'none', borderRadius: 10, padding: '15px', fontFamily: 'Tajawal', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .3s', boxShadow: loading ? 'none' : '0 0 30px rgba(245,158,11,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: '2.5px solid rgba(0,0,0,.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                جاري الدخول...
              </>
            ) : 'تسجيل الدخول'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,.4)' }}>
            ليس لديك حساب؟{' '}
            <Link to="/register" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>
              سجّل الآن
            </Link>
          </p>
        </form>

        <div style={{ marginTop: 48, padding: '16px', background: 'rgba(15,118,110,.1)', border: '1px solid rgba(20,184,166,.15)', borderRadius: 10 }}>
          <p style={{ color: 'rgba(20,184,166,.8)', fontSize: 12, lineHeight: 1.6, textAlign: 'center' }}>
            هذه لوحة إدارة للمعلمين والمشرفين والمانحين.<br />
            <span style={{ color: 'rgba(255,255,255,.35)' }}>الطلاب وأولياء الأمور يستخدمون التطبيق المحمول.</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(255,255,255,.2) !important; }
      `}</style>
    </div>
  )
}