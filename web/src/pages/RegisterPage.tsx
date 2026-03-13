import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

const ROLES = [
  { value: 'STUDENT',      label: 'طالب' },
  { value: 'TEACHER',      label: 'معلم' },
  { value: 'PARENT',       label: 'ولي أمر' },
  { value: 'SCHOOL_ADMIN', label: 'مدير مدرسة' },
  { value: 'DONOR',        label: 'مانح' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({
    fullNameAr: '', username: '', password: '',
    confirmPassword: '', role: 'STUDENT', enrollmentCode: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين'); return
    }
    if (form.password.length < 6) {
      setError('كلمة المرور قصيرة جداً (6 أحرف على الأقل)'); return
    }

    setLoading(true)
    try {
      const payload: any = {
        username: form.username,
        password: form.password,
        full_name_ar: form.fullNameAr,
        role: form.role,
      }
      if (form.enrollmentCode) payload.enrollment_code = form.enrollmentCode

      const { data } = await api.post('/auth/register', payload)
      login(data.user, data.access_token, data.refresh_token)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center">
          <h1 className="text-6xl font-black text-white">نور</h1>
          <p className="text-teal-300 text-lg mt-1">إنشاء حساب جديد</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل بالعربية</label>
              <input name="fullNameAr" type="text" required className="input-field"
                placeholder="محمد أحمد" value={form.fullNameAr} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
              <input name="username" type="text" required className="input-field"
                placeholder="username" value={form.username} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
              <select name="role" className="input-field" value={form.role} onChange={handleChange}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {form.role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز الانضمام <span className="text-gray-400">(اختياري)</span>
                </label>
                <input name="enrollmentCode" type="text" className="input-field"
                  placeholder="رمز الفصل الدراسي" value={form.enrollmentCode} onChange={handleChange} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input name="password" type="password" required className="input-field"
                placeholder="6 أحرف على الأقل" value={form.password} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
              <input name="confirmPassword" type="password" required className="input-field"
                placeholder="أعد كتابة كلمة المرور" value={form.confirmPassword} onChange={handleChange} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التسجيل...
                </span>
              ) : 'إنشاء الحساب'}
            </button>

            <p className="text-center text-sm text-gray-500">
              لديك حساب؟{' '}
              <Link to="/login" className="text-teal-700 font-medium hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
   }
