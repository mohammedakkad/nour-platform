import {
    useQuery
} from '@tanstack/react-query'
import {
    Users,
    BookOpen,
    FileCheck,
    TrendingUp,
    AlertTriangle
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
    Line
} from 'recharts'
import {
    api
} from '../../api/client'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface DashboardStats {
    totalStudents: number
    totalTeachers: number
    publishedContent: number
    pendingApproval: number
    averageScore: number
    activeSchools: number
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export default function AdminDashboard() {
    const {
        data: stats,
        isLoading
    } = useQuery < DashboardStats > ({
            queryKey: ['admin-stats'],
            queryFn: () => api.get('/admin/stats').then(r => r.data)
        })

    // Mock data for charts (replace with real API data)
    const weeklyActivityData = [{
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

    const scoreDistribution = [{
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
                <p className="text-gray-500 text-sm mt-1">
                    نظرة عامة على أداء المنصة
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="إجمالي الطلاب"
                    value={stats?.totalStudents?.toLocaleString('ar') ?? '—'}
                    icon={<Users className="h-6 w-6" />}
                    color="teal"
                    trend="+12% هذا الشهر"
                    />
                <StatCard
                    title="المعلمون النشطون"
                    value={stats?.totalTeachers?.toLocaleString('ar') ?? '—'}
                    icon={<BookOpen className="h-6 w-6" />}
                    color="blue"
                    trend="+5 هذا الأسبوع"
                    />
                <StatCard
                    title="المحتوى المنشور"
                    value={stats?.publishedContent?.toLocaleString('ar') ?? '—'}
                    icon={<FileCheck className="h-6 w-6" />}
                    color="green"
                    trend="+23 هذا الشهر"
                    />
                <StatCard
                    title="بانتظار المراجعة"
                    value={stats?.pendingApproval?.toLocaleString('ar') ?? '—'}
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color="amber"
                    trend="يحتاج مراجعة"
                    urgent={(stats?.pendingApproval ?? 0) > 0}
                    />
                <StatCard
                    title="متوسط الدرجات"
                    value={`${stats?.averageScore?.toFixed(1) ?? '—'}%`}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="purple"
                    trend="مقارنة بالشهر السابق"
                    />
                <StatCard
                    title="المدارس النشطة"
                    value={stats?.activeSchools?.toLocaleString('ar') ?? '—'}
                    icon={<Users className="h-6 w-6" />}
                    color="rose"
                    trend="في 5 محافظات"
                    />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">النشاط الأسبوعي</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyActivityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" tick={ { fontSize: 12 }} />
                            <YAxis tick={ { fontSize: 12 }} />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    value,
                                    name === 'students' ? 'طلاب نشطون': 'اختبارات مقدّمة'
                                ]}
                                />
                            <Bar dataKey="students" fill="#0f766e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="exams" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Score Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">توزيع الدرجات</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={scoreDistribution} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tick={ { fontSize: 12 }} />
                            <YAxis dataKey="range" type="category" tick={ { fontSize: 11 }} width={80} />
                            <Tooltip formatter={(v: number) => [v, 'عدد الطلاب']} />
                            <Bar dataKey="count" fill="#1a3a5c" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pending Approval Alert */}
            {stats && stats.pendingApproval > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-amber-800 font-medium">
                            يوجد {stats.pendingApproval} محتوى بانتظار مراجعتك
                        </p>
                        <p className="text-amber-600 text-sm">
                            يرجى مراجعة المحتوى المرفوع من المعلمين واعتماده قبل نشره للطلاب
                        </p>
                    </div>
                    <a
                        href="/admin/content-approval"
                        className="mr-auto bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                        >
                        مراجعة الآن
                    </a>
                </div>
            )}
        </div>
    )
}

    // ──────────────────────────────────────────────
    // Stat Card Component
    // ──────────────────────────────────────────────

    interface StatCardProps {
        title: string
        value: string
        icon: React.ReactNode
        color: 'teal' | 'blue' | 'green' | 'amber' | 'purple' | 'rose'
        trend: string
        urgent?: boolean
    }

    const colorMap = {
        teal: 'bg-teal-50 text-teal-700 border-teal-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
    }

    function StatCard({
        title, value, icon, color, trend, urgent
    }: StatCardProps) {
        return (
            <div className={`bg-white rounded-xl border p-5 ${urgent ? 'border-amber-300 shadow-amber-100 shadow-md': 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
                        {icon}
                    </div>
                    {urgent && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                            عاجل
                        </span>
                    )}
                </div>
                <div className="mt-2">
                    <p className="text-gray-500 text-sm">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {value}
                    </p>
                    <p className={`text-xs mt-1 ${urgent ? 'text-amber-600': 'text-gray-400'}`}>
                        {trend}
                    </p>
                </div>
            </div>
        )
    }