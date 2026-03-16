// ════════════════════════════════════════════
// DonorDashboard.tsx
// ════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts'
import { TrendingUp, Users, BookOpen, FileCheck, Target, Award, MapPin } from 'lucide-react'
import { api } from '../../api/client'
import { useThemeStore } from '../../store/themeStore'

const PIE_COLORS = ['#0F766E', '#14B8A6', '#F59E0B', '#F97316', '#6366F1']

const mockMonthly = [
  { month: 'أكت', students: 340 }, { month: 'نوف', students: 520 },
  { month: 'ديس', students: 680 }, { month: 'يناير', students: 890 },
  { month: 'فبر', students: 1050 }, { month: 'مارس', students: 1240 },
]
const mockSubjects = [
  { name: 'رياضيات', value: 34 }, { name: 'عربي', value: 28 },
  { name: 'علوم', value: 19 },    { name: 'إنجليزي', value: 12 },
  { name: 'أخرى', value: 7 },
]
const mockGrades = [
  { grade: 'ص1', avg: 72 }, { grade: 'ص2', avg: 68 }, { grade: 'ص3', avg: 75 },
  { grade: 'ص4', avg: 71 }, { grade: 'ص5', avg: 78 }, { grade: 'ص6', avg: 74 },
]

export function DonorDashboard() {
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#64748B' : '#94A3B8'
  const gridColor = isDark ? 'rgba(255,255,255,.05)' : '#F1F5F9'

  const { data: content, isLoading } = useQuery<{ content: any[]; totalElements: number }>({
    queryKey: ['donor-content'],
    queryFn: () => api.get('/content', { params: { size: 100 } }).then(r => r.data),
  })

  const publishedCount = content?.content?.filter(c => c.status === 'PUBLISHED').length ?? 0
  const totalContent   = content?.totalElements ?? 0

  const CustomTT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color || 'var(--teal)' }}>{p.value}</p>)}
      </div>
    )
  }

  const kpis = [
    { label: 'الطلاب النشطون',    value: '1,240+',              icon: <Users size={18} />,    color: '#0F766E', trend: '+18%' },
    { label: 'المحتوى المنشور',    value: String(publishedCount), icon: <BookOpen size={18} />, color: '#2563EB', trend: `من ${totalContent}` },
    { label: 'الاختبارات المقدّمة', value: '3,890+',              icon: <FileCheck size={18} />, color: '#15803D', trend: '+24%' },
    { label: 'معدل النجاح',       value: '74%',                  icon: <Target size={18} />,   color: '#D97706', trend: 'هدف 60%' },
    { label: 'المعلمون النشطون',   value: '89',                   icon: <Award size={18} />,    color: '#7C3AED', trend: '+12 فصل' },
    { label: 'مناطق مغطاة',       value: '5',                    icon: <MapPin size={18} />,   color: '#DB2777', trend: 'محافظات' },
  ]

  return (
    <div className="space-y-6">
      <div className="anim-fade-up">
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal' }}>تقارير الأثر</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>قياس أثر مساهماتك في التعليم</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`stat-card anim-fade-up delay-${i + 1}`}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, marginBottom: 10 }}>
              {kpi.icon}
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'Tajawal', lineHeight: 1 }}>{kpi.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{kpi.label}</p>
            <p style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, marginTop: 2 }}>{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 anim-fade-up delay-3">
        {/* Growth chart */}
        <div className="page-card lg:col-span-2">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>نمو المنصة</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>عدد الطلاب النشطين شهرياً</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockMonthly}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--teal)" stopOpacity={.25} />
                  <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTT />} />
              <Area type="monotone" dataKey="students" stroke="var(--teal)" strokeWidth={2.5}
                fill="url(#areaGrad)" dot={{ fill: 'var(--teal)', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="page-card">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>توزيع المحتوى</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>حسب المادة</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={mockSubjects} cx="50%" cy="50%" innerRadius={36} outerRadius={60}
                  paddingAngle={3} dataKey="value">
                  {mockSubjects.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mockSubjects.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score by grade */}
      <div className="page-card anim-fade-up delay-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>متوسط الدرجات</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>حسب الصف الدراسي</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockGrades} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="grade" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTT />} />
            <Bar dataKey="avg" fill="var(--teal)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Impact card */}
      <div className="anim-fade-up delay-5" style={{
        background: 'linear-gradient(135deg, #0F766E, #065F46)',
        borderRadius: 18, padding: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Tajawal' }}>ملخص الأثر</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
              المنصة تحقق أهداف التعليم المستدام رغم ظروف النزاع
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>A+</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>تقييم الأثر</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, position: 'relative' }}>
          {[
            { label: 'مناطق مغطاة',  value: '5 محافظات' },
            { label: 'نسبة الإكمال', value: '82%' },
            { label: 'ساعات تعلم',   value: '1,200+' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Tajawal' }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard
