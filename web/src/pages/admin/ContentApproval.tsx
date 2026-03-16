import {
    useState
} from 'react'
import {
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import {
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    Video,
    Music,
    BookOpen,
    AlertTriangle,
    Search,
    Filter
} from 'lucide-react'
import {
    api
} from '../../api/client'
import {
    useThemeStore
} from '../../store/themeStore'

interface ContentItem {
    id: string; titleAr: string; type: string; subject: string
    gradeLevel: number; status: string; createdBy: string
    fileUrl: string | null; fileSizeMb: number; durationMinutes: number | null
    downloadCount: number
}

const TYPE_ICONS: Record < string, React.ReactNode > = {
    LESSON: <BookOpen size={15} />,
    VIDEO: <Video size={15} />,
    AUDIO: <Music size={15} />,
    WORKSHEET: <FileText size={15} />,
    QUIZ: <FileText size={15} />,
}
const TYPE_LABELS: Record < string, string > = {
    LESSON: 'درس',
    VIDEO: 'فيديو',
    AUDIO: 'صوتي',
    WORKSHEET: 'ورقة عمل',
    QUIZ: 'اختبار'
}

export default function ContentApproval() {
    const queryClient = useQueryClient()
    const {
        resolvedTheme
    } = useThemeStore()
    const isDark = resolvedTheme === 'dark'

    const [rejectId,
        setRejectId] = useState < string | null > (null)
    const [rejectReason,
        setRejectReason] = useState('')
    const [filterStatus,
        setFilterStatus] = useState < 'REVIEW' | 'PUBLISHED' | 'ALL' > ('REVIEW')
    const [search,
        setSearch] = useState('')

    const {
        data,
        isLoading,
        isError
    } = useQuery < {
        content: ContentItem[]
    } > ({
            queryKey: ['content', filterStatus],
            queryFn: () => api.get('/content', {
                params: {
                    size: 50, ...(filterStatus !== 'ALL' && {
                        status: filterStatus
                    })
                }
            }).then(r => r.data),
        })

    const approveMutation = useMutation( {
        mutationFn: (id: string) => api.patch(`/content/${id}/status`, {
            status: 'PUBLISHED'
        }),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['content']
        }),
    })
    const rejectMutation = useMutation( {
        mutationFn: ({
            id, reason
        }: {
            id: string; reason: string
        }) =>
        api.patch(`/content/${id}/status`, {
            status: 'ARCHIVED', reason
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['content']
            })
            setRejectId(null); setRejectReason('')
        },
    })

    const items = (data?.content ?? []).filter(i =>
        !search || i.titleAr.includes(search) || i.subject?.includes(search) || i.createdBy?.includes(search)
    )
    const pending = items.filter(i => i.status === 'REVIEW')

    const statusMeta: Record < string,
    {
        label: string; bg: string; color: string; border: string
    } > = {
        REVIEW: {
            label: 'بانتظار المراجعة',
            bg: isDark ? 'rgba(217,119,6,.12)': '#FFFBEB',
            color: '#D97706',
            border: 'rgba(217,119,6,.3)'
        },
        PUBLISHED: {
            label: 'منشور',
            bg: isDark ? 'rgba(21,128,61,.12)': '#F0FDF4',
            color: '#15803D',
            border: 'rgba(21,128,61,.3)'
        },
        ARCHIVED: {
            label: 'مؤرشف',
            bg: isDark ? 'rgba(100,116,139,.12)': '#F8FAFC',
            color: '#64748B',
            border: 'rgba(100,116,139,.3)'
        },
        DRAFT: {
            label: 'مسودة',
            bg: isDark ? 'rgba(37,99,235,.12)': '#EFF6FF',
            color: '#2563EB',
            border: 'rgba(37,99,235,.3)'
        },
    }

    const tabs = [{
        key: 'REVIEW' as const,
        label: 'بانتظار المراجعة',
        count: data?.content?.filter(i => i.status === 'REVIEW').length
    },
        {
            key: 'PUBLISHED' as const,
            label: 'المنشور',
            count: undefined
        },
        {
            key: 'ALL' as const,
            label: 'الكل',
            count: undefined
        },
    ]

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="anim-fade-up flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 style={ { fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal' }}>
                        اعتماد المحتوى
                    </h1>
                    <p style={ { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        مراجعة واعتماد المحتوى المرفوع من المعلمين
                    </p>
                </div>
                {pending.length > 0 && (
                    <div style={ {
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: isDark ? 'rgba(217,119,6,.12)': '#FFFBEB',
                        border: '1px solid rgba(217,119,6,.3)',
                        borderRadius: 10, padding: '8px 14px',
                    }}>
                        <AlertTriangle size={15} style={ { color: '#D97706' }} />
                        <span style={ { fontSize: 13, fontWeight: 700, color: '#D97706' }}>
                            {pending.length} بانتظار
                        </span>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="anim-fade-up delay-1 flex items-center gap-3 flex-wrap">
                {/* Tabs */}
                <div style={ {
                    display: 'flex', background: 'var(--surface-2)',
                    border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 2,
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterStatus(tab.key)}
                            style={ {
                                padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: filterStatus === tab.key ? 700: 500,
                                background: filterStatus === tab.key ? 'var(--surface)': 'transparent',
                                color: filterStatus === tab.key ? 'var(--text)': 'var(--text-muted)',
                                border: 'none', cursor: 'pointer',
                                boxShadow: filterStatus === tab.key ? 'var(--shadow-sm)': 'none',
                                transition: 'all .2s',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                            >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span style={ {
                                    background: '#D97706', color: '#fff',
                                    fontSize: 10, fontWeight: 700, borderRadius: 100,
                                    padding: '1px 6px', lineHeight: 1.5,
                                }}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={ { position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
                    <Search size={14} style={ {
                        position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    }} />
                    <input
                    className="input-field"
                    style={ { paddingRight: 34, fontSize: 13 }}
                    placeholder="بحث في المحتوى..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    />
            </div>
        </div>

        {/* Content List */}
        {isLoading ? (
            <div style={ { display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="skeleton" style={ { height: 80, borderRadius: 14 }} />
                ))}
            </div>
        ): isError || items.length === 0 ? (
            <div className="page-card" style={ { textAlign: 'center', padding: 48 }}>
                <CheckCircle size={40} style={ { color: 'var(--text-subtle)', margin: '0 auto 12px' }} />
                <p style={ { color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isError ? 'حدث خطأ في تحميل البيانات': 'لا يوجد محتوى في هذا التبويب'}
                </p>
            </div>
        ): (
            <div style={ { display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => {
                    const meta = statusMeta[item.status] ?? statusMeta.DRAFT
                    return (
                        <div
                            key={item.id}
                            className={`anim-fade-up delay-${Math.min(i + 1, 6)}`}
                            style={ {
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 14,
                                padding: '14px 18px',
                                display: 'flex', alignItems: 'flex-start', gap: 14,
                                transition: 'border-color .2s, box-shadow .2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--border-strong)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                            >
                            {/* Type icon */}
                            <div style={ {
                                width: 38, height: 38, borderRadius: 9,
                                background: 'var(--teal-bg)',
                                border: '1px solid var(--teal-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--teal)', flexShrink: 0,
                            }}>
                                {TYPE_ICONS[item.type] ?? <FileText size={15} />}
                            </div>

                            {/* Info */}
                            <div style={ { flex: 1, minWidth: 0 }}>
                                <div style={ { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                                    <div>
                                        <p style={ { fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                            {item.titleAr}
                                        </p>
                                        <div style={ { display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                                            {[
                                                TYPE_LABELS[item.type],
                                                item.subject,
                                                `الصف ${item.gradeLevel}`,
                                                `${item.fileSizeMb?.toFixed(1)} MB`,
                                                item.durationMinutes ? `${item.durationMinutes} دقيقة`: null,
                                            ].filter(Boolean).map((tag, ti) => (
                                                    <span key={ti} style={ { fontSize: 11, color: 'var(--text-muted)' }}>
                                                        {ti > 0 && <span style={ { marginLeft: 6, opacity: .4 }}>·</span>}
                                                        {tag}
                                                    </span>
                                                ))}
                                        </div>
                                        <p style={ { fontSize: 11, color: 'var(--text-subtle)', marginTop: 3 }}>
                                            رُفع بواسطة: {item.createdBy}
                                        </p>
                                    </div>
                                    <span style={ {
                                        fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600,
                                        background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
                                        flexShrink: 0,
                                    }}>
                                        {meta.label}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            {item.status === 'REVIEW' && (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    {item.fileUrl && (
                                        <a href={item.fileUrl} target="_blank" rel="noreferrer"
                                            style={ {
                                                width: 34, height: 34, borderRadius: 8,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'var(--surface-2)', border: '1px solid var(--border)',
                                                color: 'var(--text-muted)', textDecoration: 'none',
                                                transition: 'all .2s',
                                            }}
                                            title="معاينة"
                                            >
                                            <Eye size={15} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setRejectId(item.id)}
                                        disabled={rejectMutation.isPending}
                                        style={ {
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                            color: '#EF4444', background: isDark ? 'rgba(239,68,68,.1)': '#FEF2F2',
                                            border: '1px solid rgba(239,68,68,.25)', cursor: 'pointer',
                                            transition: 'all .2s',
                                        }}
                                        >
                                        <XCircle size={14} /> رفض
                                    </button>
                                    <button
                                        onClick={() => approveMutation.mutate(item.id)}
                                        disabled={approveMutation.isPending}
                                        style={ {
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                            color: '#fff', background: 'var(--teal)',
                                            border: 'none', cursor: 'pointer',
                                            transition: 'all .2s', opacity: approveMutation.isPending ? .6: 1,
                                        }}
                                        >
                                        <CheckCircle size={14} />
                                        {approveMutation.isPending ? '...': 'اعتماد'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )}

        {/* Reject Modal */}
        {rejectId && (
            <div style={ {
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
            }}
                onClick={e => e.target === e.currentTarget && setRejectId(null)}
                >
                <div className="anim-scale-in" style={ {
                    background: 'var(--surface)', borderRadius: 18,
                    border: '1px solid var(--border)',
                    padding: 24, width: '100%', maxWidth: 420,
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    <h3 style={ { fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>رفض المحتوى</h3>
                    <p style={ { fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        اذكر سبب الرفض حتى يتمكن المعلم من التحسين
                    </p>
                    <textarea
                        rows={3}
                        className="input-field"
                        style={ { resize: 'none', fontSize: 13 }}
                        placeholder="سبب الرفض (اختياري)..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        />
                    <div style={ { display: 'flex', gap: 10, marginTop: 16 }}>
                        <button
                            onClick={() => { setRejectId(null); setRejectReason('') }}
                            className="btn-secondary"
                            style={ { flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13 }}
                            >
                            إلغاء
                        </button>
                        <button
                            onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                            disabled={rejectMutation.isPending}
                            style={ {
                                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer',
                                opacity: rejectMutation.isPending ? .6: 1, transition: 'opacity .2s',
                            }}
                            >
                            {rejectMutation.isPending ? '...': 'تأكيد الرفض'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
)
}