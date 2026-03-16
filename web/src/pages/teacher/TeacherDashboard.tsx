import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Upload, Plus, Trash2, BookOpen, FileText, ClipboardList,
  CheckCircle, X, AlertCircle, TrendingUp, Users, Eye
} from 'lucide-react'
import { api } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

interface ContentItem {
  id: string; titleAr: string; type: string; subject: string
  gradeLevel: number; status: string; fileSizeMb: number; downloadCount: number
}
interface Question { questionTextAr: string; options: string[]; correctOptionIndex: number; explanation: string }

const SUBJECTS = ['رياضيات', 'عربي', 'علوم', 'إنجليزي', 'تاريخ', 'جغرافيا', 'تربية إسلامية']
const GRADES   = [1,2,3,4,5,6,7,8,9,10,11,12]
const TYPES    = [{ value: 'LESSON', label: 'درس' }, { value: 'VIDEO', label: 'فيديو' }, { value: 'AUDIO', label: 'صوتي' }, { value: 'WORKSHEET', label: 'ورقة عمل' }]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'مسودة',            color: '#2563EB', bg: 'rgba(37,99,235,.1)' },
  REVIEW:    { label: 'بانتظار المراجعة', color: '#D97706', bg: 'rgba(217,119,6,.1)' },
  PUBLISHED: { label: 'منشور',            color: '#15803D', bg: 'rgba(21,128,61,.1)' },
  ARCHIVED:  { label: 'مؤرشف',            color: '#64748B', bg: 'rgba(100,116,139,.1)' },
}

// ── Upload Modal ────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [file, setFile]   = useState<File | null>(null)
  const [meta, setMeta]   = useState({ titleAr: '', type: 'LESSON', subject: '', gradeLevel: 1 })
  const [success, setSuccess] = useState(false)
  const [dragging, setDragging] = useState(false)

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
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(21,128,61,.1)', border: '1px solid rgba(21,128,61,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px', color: '#15803D',
      }}>
        <CheckCircle size={28} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>تم رفع المحتوى!</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>سيُراجعه المشرف قريباً</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
          عنوان المحتوى
        </label>
        <input className="input-field" style={{ fontSize: 13 }}
          placeholder="مثال: درس الكسور للصف الرابع"
          value={meta.titleAr} onChange={e => setMeta(m => ({ ...m, titleAr: e.target.value }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'النوع', field: 'type', options: TYPES.map(t => ({ value: t.value, label: t.label })) },
          { label: 'المادة', field: 'subject', options: [{ value: '', label: 'اختر' }, ...SUBJECTS.map(s => ({ value: s, label: s }))] },
          { label: 'الصف', field: 'gradeLevel', options: GRADES.map(g => ({ value: g, label: `الصف ${g}` })) },
        ].map(f => (
          <div key={f.field}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
              {f.label}
            </label>
            <select className="input-field" style={{ fontSize: 12, padding: '8px 10px' }}
              value={(meta as any)[f.field]}
              onChange={e => setMeta(m => ({ ...m, [f.field]: f.field === 'gradeLevel' ? +e.target.value : e.target.value }))}>
              {f.options.map(o => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Dropzone */}
      <div
        onClick={() => document.getElementById('file-input')?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0] ?? null) }}
        style={{
          border: `2px dashed ${file ? 'var(--teal)' : dragging ? 'var(--gold)' : 'var(--border)'}`,
          borderRadius: 12, padding: '28px 16px', textAlign: 'center',
          cursor: 'pointer', transition: 'all .2s',
          background: file ? 'var(--teal-bg)' : dragging ? 'var(--gold-bg)' : 'var(--surface-2)',
        }}
      >
        <input id="file-input" type="file" style={{ display: 'none' }}
          onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <>
            <CheckCircle size={28} style={{ color: 'var(--teal)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>{file.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <Upload size={28} style={{ color: 'var(--text-subtle)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>اضغط أو اسحب الملف هنا</p>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>PDF, MP4, MP3, DOCX — حتى 100 MB</p>
          </>
        )}
      </div>

      {uploadMutation.isError && (
        <div style={{
          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
          borderRadius: 10, padding: '10px 14px', color: '#EF4444', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={14} /> فشل الرفع. تأكد من ملء جميع الحقول.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} className="btn-secondary"
          style={{ flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13 }}>
          إلغاء
        </button>
        <button
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending || !file || !meta.titleAr || !meta.subject}
          className="btn-primary"
          style={{
            flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
            opacity: uploadMutation.isPending || !file || !meta.titleAr || !meta.subject ? .5 : 1,
            cursor: uploadMutation.isPending || !file || !meta.titleAr || !meta.subject ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {uploadMutation.isPending ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> جاري الرفع...</>
          ) : <><Upload size={15} /> رفع المحتوى</>}
        </button>
      </div>
    </div>
  )
}

// ── Create Exam Modal ───────────────────────────────────
function ExamModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'info' | 'questions'>('info')
  const [info, setInfo] = useState({
    titleAr: '', classId: '', timeLimitMinutes: 30, maxAttempts: 3, passScore: 60,
    availableFrom: new Date().toISOString().slice(0, 16),
    availableUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
  })
  const [questions, setQuestions] = useState<Question[]>([
    { questionTextAr: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }
  ])
  const [success, setSuccess] = useState(false)

  const createMutation = useMutation({
    mutationFn: () => api.post('/exams', {
      titleAr: info.titleAr, classId: info.classId,
      timeLimitMinutes: info.timeLimitMinutes, maxAttempts: info.maxAttempts,
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
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(21,128,61,.1)', border: '1px solid rgba(21,128,61,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#15803D' }}>
        <CheckCircle size={28} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>تم إنشاء الاختبار!</p>
    </div>
  )

  const step1Valid = info.titleAr && info.classId

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {[{ key: 'info', label: '1. معلومات الاختبار' }, { key: 'questions', label: `2. الأسئلة (${questions.length})` }].map(s => (
          <button key={s.key} onClick={() => s.key === 'questions' && step1Valid ? setStep('questions') : s.key === 'info' ? setStep('info') : null}
            style={{
              flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: step === s.key ? 'var(--teal)' : 'var(--surface-2)',
              color: step === s.key ? '#fff' : 'var(--text-muted)',
              transition: 'all .2s',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {step === 'info' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>عنوان الاختبار</label>
            <input className="input-field" style={{ fontSize: 13 }} placeholder="مثال: اختبار الفصل الأول"
              value={info.titleAr} onChange={e => setInfo(f => ({ ...f, titleAr: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>معرّف الفصل</label>
            <input className="input-field" style={{ fontSize: 13 }} placeholder="Class ID"
              value={info.classId} onChange={e => setInfo(f => ({ ...f, classId: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'الوقت (دقيقة)', field: 'timeLimitMinutes', min: 5, max: 180 },
              { label: 'المحاولات', field: 'maxAttempts', min: 1, max: 10 },
              { label: 'درجة النجاح %', field: 'passScore', min: 0, max: 100 },
            ].map(f => (
              <div key={f.field}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input type="number" min={f.min} max={f.max} className="input-field" style={{ fontSize: 12, padding: '8px 10px' }}
                  value={(info as any)[f.field]}
                  onChange={e => setInfo(f2 => ({ ...f2, [f.field]: +e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'يبدأ من', field: 'availableFrom' },
              { label: 'ينتهي في', field: 'availableUntil' },
            ].map(f => (
              <div key={f.field}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input type="datetime-local" className="input-field" style={{ fontSize: 12, padding: '8px 10px' }}
                  value={(info as any)[f.field]}
                  onChange={e => setInfo(f2 => ({ ...f2, [f.field]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button onClick={() => setStep('questions')} disabled={!step1Valid}
            className="btn-primary" style={{ padding: '11px 0', borderRadius: 10, fontSize: 13, opacity: step1Valid ? 1 : .4 }}>
            التالي: إضافة الأسئلة ←
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '50vh', overflowY: 'auto' }}>
          {questions.map((q, qi) => (
            <div key={qi} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>السؤال {qi + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions(q => q.filter((_, i) => i !== qi))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <textarea rows={2} className="input-field" style={{ resize: 'none', fontSize: 13, marginBottom: 10 }}
                placeholder="نص السؤال..."
                value={q.questionTextAr}
                onChange={e => setQuestions(qs => qs.map((item, i) => i === qi ? { ...item, questionTextAr: e.target.value } : item))} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctOptionIndex === oi}
                      onChange={() => setQuestions(qs => qs.map((item, i) => i === qi ? { ...item, correctOptionIndex: oi } : item))} />
                    <input className="input-field" style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
                      placeholder={`الخيار ${oi + 1}`}
                      value={opt}
                      onChange={e => setQuestions(qs => qs.map((item, i) => i === qi ? { ...item, options: item.options.map((o, j) => j === oi ? e.target.value : o) } : item))} />
                    {q.correctOptionIndex === oi && <span style={{ fontSize: 10, color: '#15803D', fontWeight: 700 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setQuestions(q => [...q, { questionTextAr: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }])}
            style={{
              border: '2px dashed var(--border)', background: 'none', borderRadius: 10,
              padding: '10px 0', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'border-color .2s, color .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Plus size={14} /> إضافة سؤال
          </button>

          {createMutation.isError && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 12px', color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={13} /> فشل الإنشاء. تأكد من صحة المعلومات.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: 'var(--surface)', paddingTop: 10 }}>
            <button onClick={() => setStep('info')} className="btn-secondary"
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12 }}>← رجوع</button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || questions.some(q => !q.questionTextAr)}
              className="btn-primary"
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
                opacity: createMutation.isPending || questions.some(q => !q.questionTextAr) ? .5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {createMutation.isPending ? '...' : 'إنشاء الاختبار'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { resolvedTheme } = useThemeStore()
  const [modal, setModal] = useState<'upload' | 'exam' | null>(null)

  const { data: contentData, isLoading } = useQuery<{ content: ContentItem[] }>({
    queryKey: ['my-content'],
    queryFn: () => api.get('/content', { params: { size: 30 } }).then(r => r.data),
  })

  const items = contentData?.content ?? []
  const published = items.filter(c => c.status === 'PUBLISHED').length
  const pending   = items.filter(c => c.status === 'REVIEW').length
  const downloads = items.reduce((a, b) => a + (b.downloadCount ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="anim-fade-up flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal' }}>لوحة المعلم</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>ارفع محتوى وأنشئ اختبارات لطلابك</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setModal('exam')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              color: 'var(--teal)', cursor: 'pointer', transition: 'all .2s',
            }}>
            <ClipboardList size={15} /> اختبار جديد
          </button>
          <button onClick={() => setModal('upload')} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
            <Upload size={15} /> رفع محتوى
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-fade-up delay-1">
        {[
          { label: 'المحتوى الكلي', value: String(items.length), icon: <BookOpen size={18} />, color: '#0F766E' },
          { label: 'المنشور',       value: String(published),    icon: <CheckCircle size={18} />, color: '#15803D' },
          { label: 'قيد المراجعة',  value: String(pending),      icon: <AlertCircle size={18} />, color: '#D97706' },
          { label: 'التحميلات',     value: String(downloads),    icon: <TrendingUp size={18} />, color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 10 }}>
              {s.icon}
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Tajawal', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content Table */}
      <div className="page-card anim-fade-up delay-2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>محتواي</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{items.length} عنصر</span>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BookOpen size={36} style={{ color: 'var(--text-subtle)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>لم تقم برفع أي محتوى بعد</p>
            <button onClick={() => setModal('upload')}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 13, cursor: 'pointer', marginTop: 6, fontWeight: 600 }}>
              ارفع أول محتوى الآن ←
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item, i) => {
              const meta = STATUS_META[item.status] ?? STATUS_META.DRAFT
              return (
                <div key={item.id} className={`table-row anim-fade-up delay-${Math.min(i + 1, 6)}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', flexShrink: 0 }}>
                    <FileText size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.titleAr}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {item.subject} · الصف {item.gradeLevel} · {item.fileSizeMb?.toFixed(1)} MB
                    </p>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: meta.bg, color: meta.color, fontWeight: 600, flexShrink: 0 }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)', flexShrink: 0 }}>{item.downloadCount} ↓</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="anim-scale-in" style={{
            background: 'var(--surface)', borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 560, boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                {modal === 'upload' ? 'رفع محتوى جديد' : 'إنشاء اختبار جديد'}
              </h3>
              <button onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            {modal === 'upload' ? <UploadModal onClose={() => setModal(null)} /> : <ExamModal onClose={() => setModal(null)} />}
          </div>
        </div>
      )}
    </div>
  )
}
