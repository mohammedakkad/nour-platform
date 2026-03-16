import {
    useQuery
} from '@tanstack/react-query'
import {
    Link
} from 'react-router-dom'
import {
    Users,
    BookOpen,
    FileCheck,
    TrendingUp,
    AlertTriangle,
    School,
    ArrowLeft,
    Activity,
    ChevronUp,
    ChevronDown
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts'
import {
    api
} from '../../api/client'
import {
    useThemeStore
} from '../../store/themeStore'

// ── Types ──────────────────────────────────────────────
interface DashboardStats {
    totalStudents: number
    totalTeachers: number
    publishedContent: number
    pendingApproval: number
    averageScore: number
    activeSchools: number
}

// ── Mock chart data ────────────────────────────────────
const weeklyData = [{
    day: 'السبت',
    students: 145,
    exams: 23
},
    {
        day: 'الأحد',
        students: 189,
        exams: 45
    },
    {
        day: 'الاثنين',
        students: 234,
        exams: 67
    },
    {
        day: 'الثلاثاء',
        students: 198,
        exams: 34
    },
    {
        day: 'الأربعاء',
        students: 267,
        exams: 78
    },
    {
        day: 'الخميس',
        students: 312,
        exams: 89
    },
    {
        day: 'الجمعة',
        students: 89,
        exams: 12
    },
]

const growthData = [{
    month: 'أكت',
    value: 340
},
    {
        month: 'نوف',
        value: 520
    },
    {
        month: 'ديس',
        value: 680
    },
    {
        month: 'يناير',
        value: 890
    },
    {
        month: 'فبر',
        value: 1050
    },
    {
        month: 'مارس',
        value: 1240
    },
]

const scoreData = [{
    range: '90-100%',
    count: 45
},
    {
        range: '80-89%',
        count: 78
    },
    {
        range: '70-79%',
        count: 123
    },
    {
        range: '60-69%',
        count: 89
    },
    {
        range: 'أقل من 60%',
        count: 67
    },
]

// ── Custom Tooltip ─────────────────────────────────────
const CustomTooltip = ({
    active, payload, label
}: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={ {
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
            fontSize: 12, color: 'var(--text)'
        }}>
            <p style={ { fontWeight: 600, marginBottom: 4, color: 'var(--text-muted)' }}>
                {label}
            </p>
            {payload.map((p: any) => (
                <p key={p.name} style={ { color: p.color }}>
                    {p.name === 'students' ? 'طلاب نشطون':
                    p.name === 'exams' ? 'اختبارات':
                    p.name === 'value' ? 'الطلاب':
                    p.name === 'count' ? 'عدد الطلاب': p.name}: {p.value}
                </p>
            ))}
        </div>
    )
}

// ── Main Component ─────────────────────────────────────
export default function AdminDashboard() {
    const {
        resolvedTheme
    } = useThemeStore()
    const isDark = resolvedTheme === 'dark'

    const {
        data: stats,
        isLoading
    } = useQuery < DashboardStats > ({
            queryKey: ['admin-stats'],
            queryFn: () => api.get('/admin/stats').then(r => r.data),
            retry: false,
        })

    const axisColor = isDark ? '#64748B': '#94A3B8'
    const gridColor = isDark ? 'rgba(255,255,255,.05)': '#F1F5F9'

    const kpiCards = [{
        title: 'إجمالي الطلاب',
        value: stats?.totalStudents?.toLocaleString('ar') ?? '—',
        icon: <Users size={20} />,
        trend: '+12%',
        trendUp: true,
        trendLabel: 'هذا الشهر',
        color: '#0F766E',
        bg: isDark ? 'rgba(15,118,110,.15)': '#F0FDFA',
    },
        {
            title: 'المعلمون النشطون',
            value: stats?.totalTeachers?.toLocaleString('ar') ?? '—',
            icon: <BookOpen size={20} />,
            trend: '+5',
            trendUp: true,
            trendLabel: 'هذا الأسبوع',
            color: '#2563EB',
            bg: isDark ? 'rgba(37,99,235,.15)': '#EFF6FF',
        },
        {
            title: 'المحتوى المنشور',
            value: stats?.publishedContent?.toLocaleString('ar') ?? '—',
            icon: <FileCheck size={20} />,
            trend: '+23',
            trendUp: true,
            trendLabel: 'هذا الشهر',
            color: '#15803D',
            bg: isDark ? 'rgba(21,128,61,.15)': '#F0FDF4',
        },
        {
            title: 'بانتظار المراجعة',
            value: stats?.pendingApproval?.toLocaleString('ar') ?? '—',
            icon: <AlertTriangle size={20} />,
            trend: 'عاجل',
            trendUp: false,
            trendLabel: 'يحتاج مراجعة',
            color: '#D97706',
            bg: isDark ? 'rgba(217,119,6,.15)': '#FFFBEB',
            urgent: (stats?.pendingApproval ?? 0) > 0,
        },
        {
            title: 'متوسط الدرجات',
            value: `${stats?.averageScore?.toFixed(1) ?? '—'}%`,
            icon: <TrendingUp size={20} />,
            trend: '+3.2%',
            trendUp: true,
            trendLabel: 'مقارنة بالشهر السابق',
            color: '#7C3AED',
            bg: isDark ? 'rgba(124,58,237,.15)': '#F5F3FF',
        },
        {
            title: 'المدارس النشطة',
            value: stats?.activeSchools?.toLocaleString('ar') ?? '—',
            icon: <School size={20} />,
            trend: '5',
            trendUp: true,
            trendLabel: 'محافظات',
            color: '#DB2777',
            bg: isDark ? 'rgba(219,39,119,.15)': '#FDF2F8',
        },
    ]

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="anim-fade-up flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 style={ { fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal' }}>
                        لوحة التحكم
                    </h1>
                    <p style={ { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        نظرة عامة على أداء المنصة
                    </p>
                </div>
                <div style={ {
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                    borderRadius: 8, padding: '6px 12px',
                }}>
                    <Activity size={14} style={ { color: 'var(--teal)' }} />
                    <span style={ { fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>
                        مباشر
                    </span>
                    <span style={ {
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--teal)', display: 'inline-block',
                        animation: 'pulse-ring 1.5s ease-out infinite',
                    }} />
                </div>
            </div>

            {/* ── KPI Cards ── */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="skeleton" style={ { height: 110, borderRadius: 14 }} />
                    ))}
                </div>
            ): (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {kpiCards.map((card, i) => (
                        <div
                            key={card.title}
                            className={`stat-card anim-fade-up delay-${i + 1}`}
                            style={ { borderColor: card.urgent ? card.color + '44': undefined }}
                            >
                            <div className="flex items-start justify-between mb-3">
                                <div style={ {
                                    width: 38, height: 38, borderRadius: 10,
                                    background: card.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: card.color,
                                }}>
                                    {card.icon}
                                </div>
                                {card.urgent && (
                                    <span style={ {
                                        fontSize: 10, padding: '2px 8px', borderRadius: 100,
                                        background: 'rgba(217,119,6,.12)', color: '#D97706',
                                        border: '1px solid rgba(217,119,6,.25)', fontWeight: 700,
                                    }}>
                                        عاجل
                                    </span>
                                )}
                            </div>
                            <p style={ { fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal', lineHeight: 1 }}>
                                {card.value}
                            </p>
                            <p style={ { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                {card.title}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                                {card.trendUp
                                ? <ChevronUp size={12} style={ { color: '#22C55E' }} />: <ChevronDown size={12} style={ { color: '#EF4444' }} />
                                }
                                <span style={ { fontSize: 11, color: card.trendUp ? '#22C55E': '#EF4444', fontWeight: 600 }}>
                                    {card.trend}
                                </span>
                                <span style={ { fontSize: 11, color: 'var(--text-subtle)' }}>{card.trendLabel}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Pending Alert ── */}
            {stats && stats.pendingApproval > 0 && (
                <div className="anim-fade-up" style={ {
                    background: isDark ? 'rgba(217,119,6,.1)': '#FFFBEB',
                    border: '1px solid rgba(217,119,6,.3)',
                    borderRadius: 14, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                }}>
                    <AlertTriangle size={18} style={ { color: '#D97706', flexShrink: 0 }} />
                    <div style={ { flex: 1 }}>
                        <p style={ { fontSize: 14, fontWeight: 600, color: isDark ? '#FBB040': '#92400E' }}>
                            يوجد {stats.pendingApproval} محتوى بانتظار مراجعتك
                        </p>
                        <p style={ { fontSize: 12, color: isDark ? '#D97706': '#B45309', marginTop: 2 }}>
                            يرجى مراجعة المحتوى المرفوع من المعلمين واعتماده قبل نشره للطلاب
                        </p>
                    </div>
                    <Link to="/admin/content-approval" style={ {
                        background: '#D97706', color: '#fff', borderRadius: 8,
                        padding: '8px 16px', fontSize: 13, fontWeight: 600,
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'opacity .2s',
                    }}>
                        مراجعة الآن
                        <ArrowLeft size={14} />
                    </Link>
                </div>
            )}

            {/* ── Charts Row 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 anim-fade-up delay-3">
                {/* Weekly Activity — takes 2 cols */}
                <div className="page-card lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 style={ { fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>النشاط الأسبوعي</h2>
                            <p style={ { fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                                الطلاب النشطون والاختبارات
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {[{
                                color: 'var(--teal)', label: 'طلاب'
                            },
                                {
                                    color: '#F59E0B', label: 'اختبارات'
                                },
                            ].map(l => (
                                    <div key={l.label} className="flex items-center gap-1.5">
                                        <div style={ { width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                                        <span style={ { fontSize: 11, color: 'var(--text-muted)' }}>{l.label}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="day" tick={ { fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={ { fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="students" fill="var(--teal)" radius={[5, 5, 0, 0]} />
                            <Bar dataKey="exams" fill="#F59E0B" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Growth mini chart */}
                <div className="page-card">
                    <div className="mb-5">
                        <h2 style={ { fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>نمو المنصة</h2>
                        <p style={ { fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                            آخر 6 أشهر
                        </p>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                        <span style={ { fontSize: 32, fontWeight: 900, color: 'var(--text)', fontFamily: 'Tajawal', lineHeight: 1 }}>1,240</span>
                        <span style={ { fontSize: 13, color: '#22C55E', fontWeight: 600, paddingBottom: 4 }}>↑ +18%</span>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--teal)" stopOpacity={.25} />
                                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="var(--teal)" strokeWidth={2}
                                fill="url(#tealGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Charts Row 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 anim-fade-up delay-4">
                {/* Score Distribution */}
                <div className="page-card">
                    <h2 style={ { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>توزيع الدرجات</h2>
                    <p style={ { fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                        عدد الطلاب حسب نطاق الدرجة
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={scoreData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                            <XAxis type="number" tick={ { fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="range" type="category" tick={ { fontSize: 11, fill: axisColor }} width={85} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill={isDark ? '#14B8A6': '#0F766E'} radius={[0, 5, 5, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions */}
                <div className="page-card">
                    <h2 style={ { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>الإجراءات السريعة</h2>
                    <div style={ { display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[{
                            icon: <FileCheck size={18} />, label: 'اعتماد المحتوى المعلّق', sub: `${stats?.pendingApproval ?? 0} ينتظر`, to: '/admin/content-approval', color: '#D97706'
                        },
                            {
                                icon: <Users size={18} />, label: 'إدارة المستخدمين', sub: `${stats?.totalStudents ?? 0} طالب`, to: '/admin/users', color: '#2563EB'
                            },
                            {
                                icon: <TrendingUp size={18} />, label: 'تقارير الأثر', sub: 'عرض التحليلات', to: '/donor', color: '#7C3AED'
                            },
                        ].map(action => (
                                <Link
                                    key={action.to}
                                    to={action.to}
                                    style={ {
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 14px', borderRadius: 10,
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        textDecoration: 'none',
                                        transition: 'all .2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'var(--surface-3)'
                                        e.currentTarget.style.borderColor = 'var(--border-strong)'
                                        e.currentTarget.style.transform = 'translateX(-2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'var(--surface-2)'
                                        e.currentTarget.style.borderColor = 'var(--border)'
                                        e.currentTarget.style.transform = 'translateX(0)'
                                    }}
                                    >
                                    <div style={ {
                                        width: 36, height: 36, borderRadius: 9,
                                        background: action.color + '18',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: action.color, flexShrink: 0,
                                    }}>
                                        {action.icon}
                                    </div>
                                    <div style={ { flex: 1 }}>
                                        <p style={ { fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                            {action.label}
                                        </p>
                                        <p style={ { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                            {action.sub}
                                        </p>
                                    </div>
                                    <ArrowLeft size={15} style={ { color: 'var(--text-subtle)' }} />
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
}