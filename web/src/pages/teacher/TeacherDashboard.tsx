import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Upload, Plus, Trash2, BookOpen, FileText, ChevronDown,
  ChevronUp, ClipboardList, CheckCircle, X, AlertCircle
} from 'lucide-react'
import { api } from '../../api/client'
import { useAuthStore } from '../../store/authStore'

// ── Types ──────────────────────────────────────────
interface ContentItem {
  id: string; titleAr: string; type: string; subject: string
  gradeLevel: number; status: string; fileSizeMb: number; downloadCount: number
}
interface Question {
  questionTextAr: string
  options: string[]
  correctOptionIndex: number
  explanation: string
}

const SUBJECTS = ['رياضيات', 'عربي', 'علوم', 'إنجليزي', 'تاريخ', 'جغرافيا', 'تربية إسلامية']
const GRADES   = [1,2,3,4,5,6,7,8,9,10,11,12]
const TYPES    = [
  { value: 'LESSON', label: 'درس' },
  { value: 'VIDEO', label: 'فيديو' },
  { value: 'AUDIO', label: 'صوتي' },
  { value: 'WORKSHEET', label: 'ورقة عمل' },
]

// ── Upload Form ────────────────────────────────────
function UploadForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({ titleAr: '', type: 'LESSON', subject: '', gradeLevel: 1 })
  const [success, setSuccess] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return
      const fd = new FormData()
      fd.append('file', file)
      fd.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
      return api.post('/content', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] })
      setSuccess(true)
      setTimeout(onClose, 1500)
    },
  })

  if (success) return (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
      <p className="font-semibold text-gray-900">تم رفع المحتوى بنجاح!</p>
      <p className="text-sm text-gray-500 mt-1">سيُراجعه المشرف قريباً</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المحتوى بالعربية</label>
        <input className="input-field" placeholder="مثال: درس الكسور للصف الرابع"
          value={meta.titleAr} onChange={e => setMeta(m => ({ ...m, titleAr: e.target.value }))} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
          <select className="input-field" value={meta.type}
            onChange={e => setMeta(m => ({ ...m, type: e.target.value }))}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
          <select className="input-field" value={meta.subject}
            onChange={e => setMeta(m => ({ ...m, subject: e.target.value }))}>
            <option value="">اختر</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الصف</label>
          <select className="input-field" value={meta.gradeLevel}
            onChange={e => setMeta(m => ({ ...m, gradeLevel: +e.target.value }))}>
            {GRADES.map(g => <option key={g} value={g}>الصف {g}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الملف</label>
        <div
          onClick={() => document.getElementById('file-input')?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            file ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
          }`}
        >
          <input id="file-input" type="file" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
          {file ? (
            <div>
              <CheckCircle className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="font-medium text-teal-700">{file.name}</p>
              <p className="text-sm text-teal-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">اضغط لاختيار ملف</p>
              <p className="text-gray-400 text-xs mt-1">PDF, MP4, MP3, DOCX — حتى 100 MB</p>
            </div>
          )}
        </div>
      </div>
      {uploadMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          فشل الرفع. تأكد من ملء جميع الحقول.
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 btn-secondary">إلغاء</button>
        <button
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending || !file || !meta.titleAr || !meta.subject}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الرفع...
            </span>
          ) : 'رفع المحتوى'}
        </button>
      </div>
    </div>
  )
}

// ── Create Exam Form ───────────────────────────────
function CreateExamForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [step, setStep] = useState<'info' | 'questions'>('info')
  const [info, setInfo] = useState({
    titleAr: '', classId: user?.classId ?? '', timeLimitMinutes: 30,
    maxAttempts: 3, passScore: 60,
    availableFrom: new Date().toISOString().slice(0, 16),
    availableUntil: new Date(Date.now() + 7*24*3600*1000).toISOString().slice(0, 16),
  })
  const [questions, setQuestions] = useState<Question[]>([
    { questionTextAr: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }
  ])
  const [success, setSuccess] = useState(false)

  const addQuestion = () =>
    setQuestions(q => [...q, { questionTextAr: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }])

  const removeQuestion = (i: number) =>
    setQuestions(q => q.filter((_, idx) => idx !== i))

  const updateQuestion = (i: number, field: keyof Question, value: any) =>
    setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const updateOption = (qi: number, oi: number, value: string) =>
    setQuestions(q => q.map((item, idx) => idx === qi
      ? { ...item, options: item.options.map((o, j) => j === oi ? value : o) }
      : item))

  const createMutation = useMutation({
    mutationFn: () => api.post('/exams', {
      titleAr: info.titleAr,
      classId: info.classId,
      timeLimitMinutes: info.timeLimitMinutes,
      maxAttempts: info.maxAttempts,
      passScore: info.passScore,
      availableFrom: new Date(info.availableFrom).getTime(),
      availableUntil: new Date(info.availableUntil).getTime(),
      shuffleQuestions: true,
      questions: questions.map(q => ({
        questionTextAr: q.questionTextAr,
        options: q.options.filter(Boolean),
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation || undefined,
      }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-exams'] })
      setSuccess(true)
      setTimeout(onClose, 1500)
    },
  })

  if (success) return (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
      <p className="font-semibold text-gray-900">تم إنشاء الاختبار بنجاح!</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Steps */}
      <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {(['info', 'questions'] as const).map((s, i) => (
          <button key={s} onClick={() => setStep(s)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              step === s ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}>
            {i + 1}. {s === 'info' ? 'معلومات الاختبار' : `الأسئلة (${questions.length})`}
          </button>
        ))}
      </div>

      {step === 'info' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الاختبار</label>
            <input className="input-field" placeholder="مثال: اختبار الفصل الأول — رياضيات"
              value={info.titleAr} onChange={e => setInfo(f => ({ ...f, titleAr: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">معرّف الفصل</label>
            <input className="input-field" placeholder="Class ID"
              value={info.classId} onChange={e => setInfo(f => ({ ...f, classId: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">ستجده في إعدادات الفصل الدراسي</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوقت (دقيقة)</label>
              <input type="number" min={5} max={180} className="input-field"
                value={info.timeLimitMinutes}
                onChange={e => setInfo(f => ({ ...f, timeLimitMinutes: +e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد المحاولات</label>
              <input type="number" min={1} max={10} className="input-field"
                value={info.maxAttempts}
                onChange={e => setInfo(f => ({ ...f, maxAttempts: +e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">درجة النجاح %</label>
              <input type="number" min={0} max={100} className="input-field"
                value={info.passScore}
                onChange={e => setInfo(f => ({ ...f, passScore: +e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">يبدأ من</label>
              <input type="datetime-local" className="input-field"
                value={info.availableFrom}
                onChange={e => setInfo(f => ({ ...f, availableFrom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ينتهي في</label>
              <input type="datetime-local" className="input-field"
                value={info.availableUntil}
                onChange={e => setInfo(f => ({ ...f, availableUntil: e.target.value }))} />
            </div>
          </div>
          <button onClick={() => setStep('questions')}
            disabled={!info.titleAr || !info.classId}
            className="w-full btn-primary disabled:opacity-50">
            التالي: إضافة الأسئلة ←
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pl-2">
          {questions.map((q, qi) => (
            <div key={qi} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">السؤال {qi + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)}
                    className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <textarea rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="نص السؤال..."
                value={q.questionTextAr}
                onChange={e => updateQuestion(qi, 'questionTextAr', e.target.value)} />
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qi}`} checked={q.correctOptionIndex === oi}
                      onChange={() => updateQuestion(qi, 'correctOptionIndex', oi)}
                      className="text-teal-600" />
                    <input className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={`الخيار ${oi + 1}`}
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)} />
                    {q.correctOptionIndex === oi && (
                      <span className="text-xs text-green-600 font-medium">✓ صحيح</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={addQuestion}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> إضافة سؤال
          </button>

          {createMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> فشل الإنشاء. تأكد من صحة المعلومات.
            </div>
          )}

          <div className="flex gap-3 sticky bottom-0 bg-white pt-3 border-t border-gray-100">
            <button onClick={() => setStep('info')} className="flex-1 btn-secondary">← رجوع</button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || questions.some(q => !q.questionTextAr)}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإنشاء...
                </span>
              ) : 'إنشاء الاختبار'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────
export default function TeacherDashboard() {
  const [modal, setModal] = useState<'upload' | 'exam' | null>(null)

  const { data: contentData, isLoading: loadingContent } = useQuery<{ content: ContentItem[] }>({
    queryKey: ['my-content'],
    queryFn: () => api.get('/content', { params: { size: 20 } }).then(r => r.data),
  })

  const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    DRAFT:     { label: 'مسودة', cls: 'bg-blue-50 text-blue-600' },
    REVIEW:    { label: 'بانتظار المراجعة', cls: 'bg-amber-50 text-amber-600' },
    PUBLISHED: { label: 'منشور', cls: 'bg-green-50 text-green-600' },
    ARCHIVED:  { label: 'مؤرشف', cls: 'bg-gray-100 text-gray-500' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة المعلم</h1>
          <p className="text-gray-500 text-sm mt-1">ارفع محتوى وأنشئ اختبارات لطلابك</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setModal('exam')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 font-medium text-sm transition-colors">
            <ClipboardList size={16} /> اختبار جديد
          </button>
          <button onClick={() => setModal('upload')}
            className="flex items-center gap-2 btn-primary text-sm">
            <Upload size={16} /> رفع محتوى
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'المحتوى المرفوع', value: contentData?.content?.length ?? '—', icon: <BookOpen size={20} />, color: 'teal' },
          { label: 'المنشور', value: contentData?.content?.filter(c => c.status === 'PUBLISHED').length ?? '—', icon: <CheckCircle size={20} />, color: 'green' },
          { label: 'بانتظار المراجعة', value: contentData?.content?.filter(c => c.status === 'REVIEW').length ?? '—', icon: <AlertCircle size={20} />, color: 'amber' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
              stat.color === 'teal' ? 'bg-teal-50 text-teal-700' :
              stat.color === 'green' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{String(stat.value)}</p>
            <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">محتواي</h2>
        </div>
        {loadingContent ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : !contentData?.content?.length ? (
          <div className="p-12 text-center text-gray-400">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>لم تقم برفع أي محتوى بعد</p>
            <button onClick={() => setModal('upload')} className="mt-3 text-teal-600 text-sm font-medium hover:underline">
              ارفع أول محتوى الآن ←
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {contentData.content.map(item => (
              <div key={item.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.titleAr}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subject} · الصف {item.gradeLevel} · {item.fileSizeMb?.toFixed(1)} MB</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_LABELS[item.status]?.cls ?? 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_LABELS[item.status]?.label ?? item.status}
                </span>
                <span className="text-xs text-gray-400">{item.downloadCount} تحميل</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {modal === 'upload' ? 'رفع محتوى جديد' : 'إنشاء اختبار جديد'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {modal === 'upload'
              ? <UploadForm onClose={() => setModal(null)} />
              : <CreateExamForm onClose={() => setModal(null)} />
            }
          </div>
        </div>
      )}
    </div>
  )
}
