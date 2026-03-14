import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { TrendingUp, Users, BookOpen, FileCheck, Target, Award } from 'lucide-react'
import { api } from '../../api/client'

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#f97316', '#6366f1']

const mockMonthly = [
  { month: 'أكت', students: 340, exams: 89 },
  { month: 'نوف', students: 520, exams: 145 },
  { month: 'ديس', students: 680, exams: 198 },
  { month: 'يناير', students: 890, exams: 267 },
  { month: 'فبر', students: 1050, exams: 312 },
  { month: 'مارس', students: 1240, exams: 389 },
]

const mockSubjects = [
  { name: 'رياضيات', value: 34 },
  { name: 'عربي', value: 28 },
  { name: 'علوم', value: 19 },
  { name: 'إنجليزي', value: 12 },
  { name: 'أخرى', value: 7 },
]

const mockGrades = [
  { grade: 'الصف 1', avg: 72 },
  { grade: 'الصف 2', avg: 68 },
  { grade: 'الصف 3', avg: 75 },
  { grade: 'الصف 4', avg: 71 },
  { grade: 'الصف 5', avg: 78 },
  { grade: 'الصف 6', avg: 74 },
]

export default function DonorDashboard() {
  const { data: content, isLoading } = useQuery<{ content: any[]; totalElements: number }>({
    queryKey: ['donor-content'],
    queryFn: () => api.get('/content', { params: { size: 100 } }).then(r => r.data),
  })

  const publishedCount = content?.content?.filter(c => c.status === 'PUBLISHED').length ?? 0
  const totalContent   = content?.totalElements ?? 0

  const kpis = [
    { label: 'الطلاب النشطون', value: '1,240+', icon: <Users size={20} />, trend: '+18% هذا الشهر', color: 'teal' },
    { label: 'المحتوى المنشور', value: publishedCount.toString(), icon: <BookOpen size={20} />, trend: `من ${totalContent} مرفوع`, color: 'blue' },
    { label: 'الاختبارات المقدّمة', value: '3,890+', icon: <FileCheck size={20} />, trend: '+24% هذا الشهر', color: 'green' },
    { label: 'معدل النجاح', value: '74%', icon: <Target size={20} />, trend: 'أعلى من الهدف 60%', color: 'amber' },
    { label: 'المعلمون النشطون', value: '89', icon: <Award size={20} />, trend: '+12 هذا الفصل', color: 'purple' },
    { label: 'التحميلات', value: '12,400+', icon: <TrendingUp size={20} />, trend: 'محتوى موزّع', color: 'rose' },
  ]

  const COLOR_MAP: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700', blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700', amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700', rose: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تقارير الأثر</h1>
        <p className="text-gray-500 text-sm mt-1">قياس أثر مساهماتك في التعليم</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${COLOR_MAP[kpi.color]}`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">نمو المنصة</h2>
          <p className="text-xs text-gray-400 mb-4">عدد الطلاب النشطين شهرياً</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockMonthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number, n: string) => [v, n === 'students' ? 'طلاب' : 'اختبارات']} />
              <Line type="monotone" dataKey="students" stroke="#0f766e" strokeWidth={2.5}
                dot={{ fill: '#0f766e', r: 4 }} />
              <Line type="monotone" dataKey="exams" stroke="#f59e0b" strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-0.5 bg-teal-600 rounded" /> طلاب نشطون
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-0.5 bg-amber-500 rounded" /> اختبارات مقدّمة
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">توزيع المحتوى</h2>
          <p className="text-xs text-gray-400 mb-4">حسب المادة الدراسية</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={mockSubjects} cx="50%" cy="50%" innerRadius={50}
                  outerRadius={80} paddingAngle={3} dataKey="value">
                  {mockSubjects.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, 'النسبة']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {mockSubjects.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">متوسط الدرجات</h2>
        <p className="text-xs text-gray-400 mb-4">حسب الصف الدراسي</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockGrades} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'متوسط الدرجات']} />
            <Bar dataKey="avg" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">ملخص الأثر</h2>
            <p className="text-teal-200 text-sm">المنصة تحقق أهداف التعليم المستدام رغم ظروف النزاع</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-black">A+</div>
            <div className="text-teal-200 text-xs">تقييم الأثر</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'مناطق مغطاة', value: '5 محافظات' },
            { label: 'نسبة الإكمال', value: '82%' },
            { label: 'وفّر المنصة', value: '1,200 ساعة تعلم' },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-lg">{item.value}</div>
              <div className="text-teal-200 text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
