import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

const ROLES = [
  { value: 'STUDENT',      label: 'طالب',         icon: '👨‍🎓', desc: 'أتعلم وأحل اختبارات' },
  { value: 'TEACHER',      label: 'معلم',          icon: '👩‍🏫', desc: 'أرفع محتوى وأُنشئ اختبارات' },
  { value: 'PARENT',       label: 'ولي أمر',       icon: '👨‍👩‍👧', desc: 'أتابع تقدم أبنائي' },
  { value: 'SCHOOL_ADMIN', label: 'مدير مدرسة',   icon: '🏫', desc: 'أدير المنصة والمستخدمين' },
  { value: 'DONOR',        label: 'مانح',          icon: '🤝', desc: 'أرى أثر مساهماتي' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    fullNameAr: '', username: '', password: '', confirmPassword: '',
    role: '', enrollmentCode: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return }
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    if (!form.role) { setError('يرجى اختيار دورك'); return }

    setLoading(true)
    setError('')
    try {
      const payload: Record<string, string> = {
        username:   form.username,
        password:   form.password,
        fullNameAr: form.fullNameAr,   // ✅ camelCase matches backend
        role:       form.role,
      }
      if (form.enrollmentCode) payload.enrollmentCode = form.enrollmentCode

      const { data } = await api.post('/auth/register', payload)
      login(data.user, data.accessToken, data.refreshToken)

      const role = data.user.role
      if (['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(role)) navigate('/admin')
      else if (role === 'TEACHER') navigate('/teacher')
      else if (role === 'DONOR') navigate('/donor')
      else navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'فشل إنشاء الحساب. حاول مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  const step1Valid = form.fullNameAr.trim().length >= 2 && form.username.trim().length >= 3
  const step2Valid = form.role !== '' && form.password.length >= 8 && form.password === form.confirmPassword

  const inputStyle = (focused?: boolean): React.CSSProperties => ({
    width: '100%', background: 'rgba(255,255,255,.05)',
    border: `1px solid ${focused ? 'rgba(245,158,11,.5)' : 'rgba(255,255,255,.1)'}`,
    borderRadius: 10, padding: '13px 16px', color: 'white', fontSize: 15,
    outline: 'none', transition: 'border .2s', boxSizing: 'border-box',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#060a10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', direction: 'rtl', fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif" }}>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Tajawal', fontSize: 48, fontWeight: 900, background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>نور</span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, marginTop: 2 }}>إنشاء حساب جديد</p>
        </div>

        {/* Card */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '36px 36px', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>

          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {[1, 2].map((s, i) => (
              <>
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, transition: 'all .3s',
                    background: step > s ? 'linear-gradient(135deg,#f59e0b,#f97316)' : step === s ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'rgba(255,255,255,.06)',
                    color: step >= s ? '#000' : 'rgba(255,255,255,.3)',
                    border: step >= s ? 'none' : '1px solid rgba(255,255,255,.1)',
                  }}>
                    {step > s ? <Check size={16} /> : s}
                  </div>
                  <span style={{ fontSize: 11, color: step >= s ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.25)', fontWeight: step === s ? 600 : 400 }}>
                    {s === 1 ? 'البيانات الأساسية' : 'الدور وكلمة المرور'}
                  </span>
                </div>
                {i === 0 && (
                  <div key="line" style={{ flex: 1, height: 1, background: step > 1 ? 'linear-gradient(90deg,#f59e0b,rgba(255,255,255,.1))' : 'rgba(255,255,255,.08)', marginBottom: 24, marginRight: 8, marginLeft: 8 }} />
                )}
              </>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>الاسم الكامل بالعربية</label>
                  <InputField
                    type="text" placeholder="مثال: محمد أحمد علي"
                    value={form.fullNameAr} onChange={e => set('fullNameAr', e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>اسم المستخدم</label>
                  <InputField
                    type="text" placeholder="بالأحرف اللاتينية فقط (3 أحرف على الأقل)"
                    value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                    autoComplete="username"
                  />
                  {form.username && form.username.length < 3 && (
                    <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 6 }}>يجب أن يكون 3 أحرف على الأقل</p>
                  )}
                </div>

                <button type="button" disabled={!step1Valid}
                  onClick={() => setStep(2)}
                  style={{ background: step1Valid ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'rgba(255,255,255,.06)', color: step1Valid ? '#000' : 'rgba(255,255,255,.2)', border: 'none', borderRadius: 10, padding: 15, fontFamily: 'Tajawal', fontSize: 16, fontWeight: 800, cursor: step1Valid ? 'pointer' : 'not-allowed', transition: 'all .3s' }}>
                  التالي ←
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Role Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>ما هو دورك؟</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {ROLES.map(r => (
                      <button key={r.value} type="button"
                        onClick={() => set('role', r.value)}
                        style={{
                          background: form.role === r.value ? 'rgba(245,158,11,.12)' : 'rgba(255,255,255,.03)',
                          border: `1px solid ${form.role === r.value ? 'rgba(245,158,11,.4)' : 'rgba(255,255,255,.08)'}`,
                          borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'right',
                          transition: 'all .2s', color: 'white',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 22 }}>{r.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: form.role === r.value ? '#f59e0b' : 'white' }}>{r.label}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{r.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enrollment code for students */}
                {form.role === 'STUDENT' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>
                      رمز الانضمام للفصل
                      <span style={{ color: 'rgba(255,255,255,.3)', fontWeight: 400, marginRight: 6 }}>(اختياري)</span>
                    </label>
                    <InputField
                      type="text" placeholder="رمز الفصل الدراسي"
                      value={form.enrollmentCode} onChange={e => set('enrollmentCode', e.target.value)}
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>كلمة المرور</label>
                  <div style={{ position: 'relative' }}>
                    <InputField
                      type={showPass ? 'text' : 'password'} placeholder="8 أحرف على الأقل"
                      value={form.password} onChange={e => set('password', e.target.value)}
                      style={{ paddingLeft: 44 }}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: 'flex' }}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {form.password && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= i * 3 ? (form.password.length >= 10 ? '#0f766e' : '#f59e0b') : 'rgba(255,255,255,.08)', transition: 'background .3s' }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>تأكيد كلمة المرور</label>
                  <div style={{ position: 'relative' }}>
                    <InputField
                      type={showConfirm ? 'text' : 'password'} placeholder="أعد كتابة كلمة المرور"
                      value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                      style={{ paddingLeft: 44 }}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: 'flex' }}>
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 6 }}>كلمتا المرور غير متطابقتين</p>
                  )}
                </div>

                {error && (
                  <div style={{ background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 14 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => setStep(1)}
                    style={{ flex: '0 0 auto', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '14px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    → رجوع
                  </button>
                  <button type="submit" disabled={loading || !step2Valid}
                    style={{ flex: 1, background: loading || !step2Valid ? 'rgba(245,158,11,.3)' : 'linear-gradient(135deg,#f59e0b,#f97316)', color: loading || !step2Valid ? 'rgba(0,0,0,.4)' : '#000', border: 'none', borderRadius: 10, padding: 14, fontFamily: 'Tajawal', fontSize: 16, fontWeight: 800, cursor: loading || !step2Valid ? 'not-allowed' : 'pointer', transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loading ? (
                      <>
                        <span style={{ width: 18, height: 18, border: '2.5px solid rgba(0,0,0,.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        جاري التسجيل...
                      </>
                    ) : 'إنشاء الحساب'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,.3)', marginTop: 24 }}>
            لديك حساب؟{' '}
            <Link to="/login" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>تسجيل الدخول</Link>
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

// ── Reusable Input ──
function InputField({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
      style={{
        width: '100%', background: 'rgba(255,255,255,.05)',
        border: `1px solid ${focused ? 'rgba(245,158,11,.5)' : 'rgba(255,255,255,.1)'}`,
        borderRadius: 10, padding: '13px 16px', color: 'white', fontSize: 15,
        outline: 'none', transition: 'border .2s', boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}