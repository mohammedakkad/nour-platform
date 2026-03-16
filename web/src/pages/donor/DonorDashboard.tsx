// ════════════════════════════════════════════
// DonorDashboard.tsx — Responsive
// ════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, BookOpen, FileCheck, Target, Award, MapPin } from 'lucide-react'
import { api } from '../../api/client'
import { useThemeStore } from '../../store/themeStore'

const PIE_COLORS = ['#0F766E','#14B8A6','#F59E0B','#F97316','#6366F1']
const mockMonthly = [
  {m:'أكت',v:340},{m:'نوف',v:520},{m:'ديس',v:680},{m:'يناير',v:890},{m:'فبر',v:1050},{m:'مارس',v:1240}
]
const mockSubjects = [{name:'رياضيات',value:34},{name:'عربي',value:28},{name:'علوم',value:19},{name:'إنجليزي',value:12},{name:'أخرى',value:7}]
const mockGrades = [{g:'ص1',avg:72},{g:'ص2',avg:68},{g:'ص3',avg:75},{g:'ص4',avg:71},{g:'ص5',avg:78},{g:'ص6',avg:74}]

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-2 text-xs" style={{ minWidth: 80 }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p: any) => <p key={p.dataKey} style={{ color: p.color || 'var(--teal)' }}>{p.value}</p>)}
    </div>
  )
}

export function DonorDashboard() {
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const ax = isDark ? '#64748B' : '#94A3B8'
  const gr = isDark ? 'rgba(255,255,255,.05)' : '#F1F5F9'

  const { data: content } = useQuery<{ content: any[]; totalElements: number }>({
    queryKey: ['donor-content'],
    queryFn: () => api.get('/content', { params: { size: 100 } }).then(r => r.data),
  })
  const published = content?.content?.filter(c => c.status === 'PUBLISHED').length ?? 0
  const total     = content?.totalElements ?? 0

  const kpis = [
    { label:'الطلاب النشطون',    value:'1,240+', icon:<Users size={17} />,    color:'#0F766E', trend:'+18%' },
    { label:'المحتوى المنشور',   value:String(published), icon:<BookOpen size={17} />,  color:'#2563EB', trend:`من ${total}` },
    { label:'الاختبارات',        value:'3,890+', icon:<FileCheck size={17} />, color:'#15803D', trend:'+24%' },
    { label:'معدل النجاح',       value:'74%',    icon:<Target size={17} />,    color:'#D97706', trend:'هدف 60%' },
    { label:'المعلمون',          value:'89',     icon:<Award size={17} />,     color:'#7C3AED', trend:'+12' },
    { label:'مناطق مغطاة',      value:'5',      icon:<MapPin size={17} />,    color:'#DB2777', trend:'محافظات' },
  ]

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="anim-fade-up">
        <h1 className="text-xl md:text-2xl font-black" style={{ fontFamily:'Tajawal', color:'var(--text)' }}>تقارير الأثر</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color:'var(--text-muted)' }}>قياس أثر مساهماتك في التعليم</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpis.map((k, i) => (
          <div key={k.label} className={`stat-card anim-fade-up delay-${i+1}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background:k.color+'18', color:k.color }}>{k.icon}</div>
            <p className="text-2xl font-black leading-none" style={{ fontFamily:'Tajawal', color:'var(--text)' }}>{k.value}</p>
            <p className="text-xs mt-1.5" style={{ color:'var(--text-muted)' }}>{k.label}</p>
            <p className="text-xs font-semibold mt-1" style={{ color:'var(--teal)' }}>{k.trend}</p>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="page-card anim-fade-up delay-3">
        <h2 className="text-sm font-bold mb-1" style={{ color:'var(--text)' }}>نمو المنصة</h2>
        <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>الطلاب النشطون شهرياً</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={mockMonthly}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--teal)" stopOpacity={.25} />
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gr} />
            <XAxis dataKey="m" tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <Area type="monotone" dataKey="v" stroke="var(--teal)" strokeWidth={2.5} fill="url(#g1)" dot={{ fill:'var(--teal)', r:3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 anim-fade-up delay-4">
        {/* Pie */}
        <div className="page-card">
          <h2 className="text-sm font-bold mb-4" style={{ color:'var(--text)' }}>توزيع المحتوى</h2>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={mockSubjects} cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={3} dataKey="value">
                  {mockSubjects.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {mockSubjects.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:PIE_COLORS[i] }} />
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color:'var(--text)' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar grades */}
        <div className="page-card">
          <h2 className="text-sm font-bold mb-4" style={{ color:'var(--text)' }}>متوسط الدرجات</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={mockGrades} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gr} />
              <XAxis dataKey="g" tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip content={<TT />} />
              <Bar dataKey="avg" fill="var(--teal)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact card */}
      <div className="rounded-2xl p-5 anim-fade-up delay-5 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#0F766E,#065F46)', color:'#fff' }}>
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-10"
          style={{ background:'white', transform:'translate(-30%,-30%)' }} />
        <div className="flex items-start justify-between flex-wrap gap-3 relative">
          <div>
            <h2 className="text-lg font-black" style={{ fontFamily:'Tajawal' }}>ملخص الأثر</h2>
            <p className="text-xs mt-1 opacity-70">المنصة تحقق أهداف التعليم رغم ظروف النزاع</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl" style={{ background:'rgba(255,255,255,.15)' }}>
            <div className="text-xl font-black">A+</div>
            <div className="text-xs opacity-70">تقييم الأثر</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 relative">
          {[{l:'مناطق مغطاة',v:'5 محافظات'},{l:'نسبة الإكمال',v:'82%'},{l:'ساعات تعلم',v:'1,200+'}].map(i => (
            <div key={i.l} className="text-center rounded-xl py-3" style={{ background:'rgba(255,255,255,.1)' }}>
              <div className="text-base font-black" style={{ fontFamily:'Tajawal' }}>{i.v}</div>
              <div className="text-xs opacity-70 mt-0.5">{i.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard


// ════════════════════════════════════════════
// UserManagement.tsx — Responsive
// ════════════════════════════════════════════
// (save as separate file: UserManagement.tsx)
