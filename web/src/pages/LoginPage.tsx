import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.accessToken, data.refreshToken)

      // Navigate based on role
      const role = data.user.role
      if (['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(role)) navigate('/admin')
      else if (role === 'TEACHER') navigate('/teacher')
      else if (role === 'DONOR') navigate('/donor')
      else navigate('/login')

    } catch (err: any) {
      setError(
        err.response?.data?.message ??
        'فشل تسجيل الدخول. تحقق من اسم المستخدم وكلمة المرور.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-7xl font-black text-white" style={{ fontFamily: 'Tajawal' }}>
            نور
          </h1>
          <p className="text-teal-300 text-lg mt-1">منصة التعليم المتكاملة</p>
          <p className="text-teal-400 text-sm mt-1">لوحة الإدارة</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستخدم
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="أدخل اسم المستخدم"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10"
                  placeholder="أدخل كلمة المرور"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.username || !form.password}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الدخول...
                </span>
              ) : 'دخول'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-teal-700 font-medium hover:underline">
                سجّل الآن
              </Link>
            </p>
          </form>
        </div>

        {/* Info note */}
        <div className="bg-teal-900/50 rounded-xl p-4 text-center">
          <p className="text-teal-300 text-sm">
            هذه لوحة إدارة المنصة للمعلمين والمشرفين والمانحين.
            <br />
            <span className="text-teal-400">الطلاب وأولياء الأمور يستخدمون التطبيق المحمول.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
