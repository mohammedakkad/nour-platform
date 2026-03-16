// ════════════════════════════════════════════
// TeacherDashboard.tsx — Responsive
// ════════════════════════════════════════════
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Plus, Trash2, BookOpen, FileText, ClipboardList, CheckCircle, X, AlertCircle, TrendingUp } from 'lucide-react'
import { api } from '../../api/client'
import { useThemeStore } from '../../store/themeStore'

interface ContentItem { id: string; titleAr: string; type: string; subject: string; gradeLevel: number; status: string; fileSizeMb: number; downloadCount: number }
interface Question { questionTextAr: string; options: string[]; correctOptionIndex: number }

const SUBJECTS = ['رياضيات', 'عربي', 'علوم', 'إنجليزي', 'تاريخ', 'جغرافيا', 'تربية إسلامية']
const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: '#2563EB' }, REVIEW: { label: 'قيد المراجعة', color: '#D97706' },
  PUBLISHED: { label: 'منشور', color: '#15803D' }, ARCHIVED: { label: 'مؤرشف', color: '#64748B' },
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-scale-in w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({ titleAr: '', type: 'LESSON', subject: '', gradeLevel: 1 })
  const [success, setSuccess] = useState(false)
  const [dragging, setDragging] = useState(false)

  const upload = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      fd.append('file', file!)
      fd.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
      return api.post('/content', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-content'] }); setSuccess(true); setTimeout(onClose, 1500) },
  })

  if (success) return (
    <div className="text-center py-8">
      <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
      <p className="font-bold" style={{ color: 'var(--text)' }}>تم الرفع بنجاح!</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>عنوان المحتوى</label>
        <input className="input-field text-sm" placeholder="درس الكسور للصف الرابع"
          value={meta.titleAr} onChange={e => setMeta(m => ({ ...m, titleAr: e.target.value }))} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>النوع</label>
          <select className="input-field text-xs py-2" value={meta.type} onChange={e => setMeta(m => ({ ...m, type: e.target.value }))}>
            {[['LESSON','درس'],['VIDEO','فيديو'],['AUDIO','صوتي'],['WORKSHEET','ورقة']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>المادة</label>
          <select className="input-field text-xs py-2" value={meta.subject} onChange={e => setMeta(m => ({ ...m, subject: e.target.value }))}>
            <option value="">اختر</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>الصف</label>
          <select className="input-field text-xs py-2" value={meta.gradeLevel} onChange={e => setMeta(m => ({ ...m, gradeLevel: +e.target.value }))}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      {/* Dropzone */}
      <div onClick={() => document.getElementById('fup')?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]) }}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
        style={{ borderColor: file ? 'var(--teal)' : dragging ? 'var(--gold)' : 'var(--border)', background: file ? 'var(--teal-bg)' : 'var(--surface-2)' }}>
        <input id="fup" type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <><CheckCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--teal)' }} /><p className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>{file.name}</p></>
        ) : (
          <><Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-subtle)' }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>اضغط أو اسحب الملف</p></>
        )}
      </div>
      {upload.isError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> فشل الرفع</p>}
      <div className="flex gap-2 pt-1">
        <button onClick={onClose} className="btn-secondary flex-1 py-2.5 rounded-xl text-sm">إلغاء</button>
        <button onClick={() => upload.mutate()} disabled={upload.isPending || !file || !meta.titleAr || !meta.subject}
          className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
          {upload.isPending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />...</> : <><Upload size={14} />رفع</>}
        </button>
      </div>
    </div>
  )
}

export function TeacherDashboard() {
  const [modal, setModal] = useState<'upload' | 'exam' | null>(null)
  const { data: contentData, isLoading } = useQuery<{ content: ContentItem[] }>({
    queryKey: ['my-content'],
    queryFn: () => api.get('/content', { params: { size: 30 } }).then(r => r.data),
  })
  const items = contentData?.content ?? []

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3 anim-fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-black" style={{ fontFamily: 'Tajawal', color: 'var(--text)' }}>لوحة المعلم</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>ارفع محتوى وأنشئ اختبارات</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('exam')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)', cursor: 'pointer' }}>
            <ClipboardList size={14} /> اختبار
          </button>
          <button onClick={() => setModal('upload')} className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold">
            <Upload size={14} /> رفع محتوى
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-up delay-1">
        {[
          { label: 'الكلي',      value: items.length,                                          icon: <BookOpen size={16} />,     color: '#0F766E' },
          { label: 'منشور',      value: items.filter(c => c.status === 'PUBLISHED').length,    icon: <CheckCircle size={16} />,  color: '#15803D' },
          { label: 'قيد المراجعة', value: items.filter(c => c.status === 'REVIEW').length,    icon: <AlertCircle size={16} />,  color: '#D97706' },
          { label: 'التحميلات', value: items.reduce((a, b) => a + (b.downloadCount ?? 0), 0), icon: <TrendingUp size={16} />,   color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
            <p className="text-2xl font-black leading-none" style={{ fontFamily: 'Tajawal', color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content list */}
      <div className="page-card anim-fade-up delay-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>محتواي</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{items.length} عنصر</span>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center p-10">
            <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-subtle)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>لا يوجد محتوى بعد</p>
            <button onClick={() => setModal('upload')} className="text-xs mt-2 font-semibold" style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer' }}>
              ارفع أول محتوى ←
            </button>
          </div>
        ) : (
          <div>
            {items.map(item => {
              const meta = STATUS_META[item.status] ?? STATUS_META.DRAFT
              return (
                <div key={item.id} className="table-row flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }}>
                    <FileText size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{item.titleAr}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.subject} · ص{item.gradeLevel} · {item.fileSizeMb?.toFixed(1)}MB
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: meta.color + '18', color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal === 'upload' && (
        <Modal title="رفع محتوى جديد" onClose={() => setModal(null)}>
          <UploadForm onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'exam' && (
        <Modal title="إنشاء اختبار" onClose={() => setModal(null)}>
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>سيتم إضافة منشئ الاختبارات قريباً</p>
        </Modal>
      )}
    </div>
  )
}

export default TeacherDashboard
