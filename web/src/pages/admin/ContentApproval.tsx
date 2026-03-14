import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Eye, FileText, Video, Music, BookOpen, AlertTriangle, Filter } from 'lucide-react'
import { api } from '../../api/client'

interface ContentItem {
  id: string
  titleAr: string
  type: string
  subject: string
  gradeLevel: number
  status: string
  createdBy: string
  fileUrl: string | null
  fileSizeMb: number
  durationMinutes: number | null
  downloadCount: number
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  LESSON:    <BookOpen size={16} />,
  VIDEO:     <Video size={16} />,
  AUDIO:     <Music size={16} />,
  WORKSHEET: <FileText size={16} />,
  QUIZ:      <FileText size={16} />,
}

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'درس', VIDEO: 'فيديو', AUDIO: 'صوتي', WORKSHEET: 'ورقة عمل', QUIZ: 'اختبار'
}

const STATUS_COLORS: Record<string, string> = {
  REVIEW:    'bg-amber-100 text-amber-700 border-amber-200',
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
  ARCHIVED:  'bg-gray-100 text-gray-500 border-gray-200',
  DRAFT:     'bg-blue-100 text-blue-700 border-blue-200',
}

const STATUS_LABELS: Record<string, string> = {
  REVIEW: 'بانتظار المراجعة', PUBLISHED: 'منشور', ARCHIVED: 'مؤرشف', DRAFT: 'مسودة'
}

export default function ContentApproval() {
  const queryClient = useQueryClient()
  const [rejectId, setRejectId]     = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [filterStatus, setFilterStatus] = useState<'REVIEW' | 'PUBLISHED' | 'ALL'>('REVIEW')

  const { data, isLoading, isError } = useQuery<{ content: ContentItem[] }>({
    queryKey: ['content', filterStatus],
    queryFn: () => api.get('/content', {
      params: { size: 50, ...(filterStatus !== 'ALL' ? { status: filterStatus } : {}) }
    }).then(r => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/content/${id}/status`, { status: 'PUBLISHED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/content/${id}/status`, { status: 'ARCHIVED', reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
      setRejectId(null)
      setRejectReason('')
    },
  })

  const items = data?.content ?? []
  const pending = items.filter(i => i.status === 'REVIEW')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">اعتماد المحتوى</h1>
          <p className="text-gray-500 text-sm mt-1">مراجعة واعتماد المحتوى المرفوع من المعلمين</p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-amber-700 font-semibold text-sm">{pending.length} بانتظار</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['REVIEW', 'PUBLISHED', 'ALL'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filterStatus === s
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'REVIEW' ? `بانتظار المراجعة ${pending.length > 0 ? `(${pending.length})` : ''}` :
             s === 'PUBLISHED' ? 'المنشور' : 'الكل'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          حدث خطأ في تحميل البيانات. تأكد من الاتصال بالخادم.
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا يوجد محتوى بانتظار المراجعة ✅</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:border-gray-300 transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                {TYPE_ICONS[item.type] ?? <FileText size={16} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.titleAr}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{TYPE_LABELS[item.type]}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{item.subject}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">الصف {item.gradeLevel}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{item.fileSizeMb?.toFixed(1)} MB</span>
                      {item.durationMinutes && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{item.durationMinutes} دقيقة</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">رُفع بواسطة: {item.createdBy}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {item.status === 'REVIEW' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer"
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      title="معاينة">
                      <Eye size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => setRejectId(item.id)}
                    disabled={rejectMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    رفض
                  </button>
                  <button
                    onClick={() => approveMutation.mutate(item.id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    {approveMutation.isPending ? 'جاري...' : 'اعتماد'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">رفض المحتوى</h3>
            <p className="text-sm text-gray-500 mb-4">اذكر سبب الرفض حتى يتمكن المعلم من التحسين</p>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="سبب الرفض (اختياري)..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectId(null); setRejectReason('') }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                disabled={rejectMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'جاري...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
