import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Eye, FileText, Video, Music, BookOpen, AlertTriangle, Search } from 'lucide-react'
import { api } from '../../api/client'
import { useThemeStore } from '../../store/themeStore'

interface ContentItem {
  id: string; titleAr: string; type: string; subject: string
  gradeLevel: number; status: string; createdBy: string
  fileUrl: string | null; fileSizeMb: number; durationMinutes: number | null
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  LESSON: <BookOpen size={14} />, VIDEO: <Video size={14} />,
  AUDIO: <Music size={14} />,     WORKSHEET: <FileText size={14} />, QUIZ: <FileText size={14} />,
}
const TYPE_LABELS: Record<string, string> = {
  LESSON: 'درس', VIDEO: 'فيديو', AUDIO: 'صوتي', WORKSHEET: 'ورقة عمل', QUIZ: 'اختبار'
}

export default function ContentApproval() {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  const [rejectId, setRejectId]         = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [filterStatus, setFilterStatus] = useState<'REVIEW' | 'PUBLISHED' | 'ALL'>('REVIEW')
  const [search, setSearch]             = useState('')

  const { data, isLoading, isError } = useQuery<{ content: ContentItem[] }>({
    queryKey: ['content', filterStatus],
    queryFn: () => api.get('/content', {
      params: { size: 50, ...(filterStatus !== 'ALL' && { status: filterStatus }) }
    }).then(r => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/content/${id}/status`, { status: 'PUBLISHED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content'] }),
  })
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/content/${id}/status`, { status: 'ARCHIVED', reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); setRejectId(null); setRejectReason('') },
  })

  const items = (data?.content ?? []).filter(i =>
    !search || i.titleAr.includes(search) || i.subject?.includes(search)
  )
  const pendingCount = data?.content?.filter(i => i.status === 'REVIEW').length ?? 0

  const statusStyle: Record<string, { color: string; bg: string }> = {
    REVIEW:    { color: '#D97706', bg: isDark ? 'rgba(217,119,6,.12)' : '#FFFBEB' },
    PUBLISHED: { color: '#15803D', bg: isDark ? 'rgba(21,128,61,.12)'  : '#F0FDF4' },
    ARCHIVED:  { color: '#64748B', bg: isDark ? 'rgba(100,116,139,.1)' : '#F8FAFC' },
    DRAFT:     { color: '#2563EB', bg: isDark ? 'rgba(37,99,235,.12)'  : '#EFF6FF' },
  }
  const statusLabel: Record<string, string> = {
    REVIEW: 'بانتظار المراجعة', PUBLISHED: 'منشور', ARCHIVED: 'مؤرشف', DRAFT: 'مسودة'
  }

  return (
    <div className="space-y-4 md:space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 anim-fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-black" style={{ fontFamily: 'Tajawal', color: 'var(--text)' }}>
            اعتماد المحتوى
          </h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            مراجعة المحتوى المرفوع من المعلمين
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: isDark ? 'rgba(217,119,6,.12)' : '#FFFBEB', border: '1px solid rgba(217,119,6,.3)', color: '#D97706' }}>
            <AlertTriangle size={13} />
            {pendingCount} بانتظار
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 anim-fade-up delay-1">
        {/* Tab pills */}
        <div className="flex p-1 gap-1 rounded-lg overflow-x-auto flex-shrink-0"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {(['REVIEW', 'PUBLISHED', 'ALL'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: filterStatus === s ? 'var(--surface)' : 'transparent',
                color: filterStatus === s ? 'var(--text)' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
                boxShadow: filterStatus === s ? 'var(--shadow-sm)' : 'none',
              }}>
              {s === 'REVIEW' ? `بانتظار ${pendingCount > 0 ? `(${pendingCount})` : ''}` : s === 'PUBLISHED' ? 'منشور' : 'الكل'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pr-9 text-sm h-9" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : isError || items.length === 0 ? (
        <div className="page-card text-center py-12">
          <CheckCircle size={36} className="mx-auto mb-3" style={{ color: 'var(--text-subtle)' }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>
            {isError ? 'حدث خطأ في التحميل' : 'لا يوجد محتوى هنا'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const st = statusStyle[item.status] ?? statusStyle.DRAFT
            return (
              <div key={item.id}
                className={`page-card anim-fade-up delay-${Math.min(i + 1, 6)}`}
                style={{ padding: '12px 14px' }}
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }}>
                    {TYPE_ICONS[item.type] ?? <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.titleAr}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}44` }}>
                        {statusLabel[item.status] ?? item.status}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {[TYPE_LABELS[item.type], item.subject, `الصف ${item.gradeLevel}`, `${item.fileSizeMb?.toFixed(1)} MB`]
                        .filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                      بواسطة: {item.createdBy}
                    </p>
                  </div>
                </div>

                {/* Actions — only for pending */}
                {item.status === 'REVIEW' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    {item.fileUrl && (
                      <a href={item.fileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                        <Eye size={13} /> معاينة
                      </a>
                    )}
                    <button onClick={() => setRejectId(item.id)} disabled={rejectMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: isDark ? 'rgba(239,68,68,.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,.25)', color: '#EF4444', cursor: 'pointer' }}>
                      <XCircle size={13} /> رفض
                    </button>
                    <button onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mr-auto"
                      style={{ background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', opacity: approveMutation.isPending ? .6 : 1 }}>
                      <CheckCircle size={13} />
                      {approveMutation.isPending ? '...' : 'اعتماد'}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setRejectId(null)}>
          <div className="anim-scale-in w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>رفض المحتوى</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>اذكر سبب الرفض ليتمكن المعلم من التحسين</p>
            <textarea rows={3} className="input-field text-sm resize-none"
              placeholder="سبب الرفض (اختياري)..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex gap-2.5 mt-4">
              <button onClick={() => { setRejectId(null); setRejectReason('') }}
                className="btn-secondary flex-1 py-2.5 rounded-xl text-sm">إلغاء</button>
              <button onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                disabled={rejectMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity"
                style={{ background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', opacity: rejectMutation.isPending ? .6 : 1 }}>
                {rejectMutation.isPending ? '...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
