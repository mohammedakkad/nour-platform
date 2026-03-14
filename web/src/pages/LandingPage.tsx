import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [counters, setCounters] = useState({ c1: 0, c2: 0, c3: 0, c4: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  // ── Particle Canvas ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let animId: number

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    type P = { x:number; y:number; size:number; speedX:number; speedY:number; color:string }
    const particles: P[] = Array.from({ length: 100 }, () => {
      const opacity = Math.random() * 0.5 + 0.1
      const r = Math.random()
      return {
        x: Math.random() * W, y: Math.random() * H,
        size: Math.random() * 1.5 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.1,
        color: r > 0.6
          ? `rgba(245,158,11,${opacity})`
          : r > 0.3
          ? `rgba(20,184,166,${opacity})`
          : `rgba(255,255,255,${opacity * 0.5})`,
      }
    })

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY
        if (p.y < -10) { p.y = H + 10 }
        if (p.x < -10) { p.x = W + 10 }
        if (p.x > W + 10) { p.x = -10 }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // ── Nav scroll ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Counter animation ──
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted.current) {
        counted.current = true
        const targets = [60, 6, 100, 5]
        const keys = ['c1', 'c2', 'c3', 'c4'] as const
        targets.forEach((target, i) => {
          let val = 0
          const step = target / 80
          const timer = setInterval(() => {
            val = Math.min(val + step, target)
            setCounters(prev => ({ ...prev, [keys[i]]: Math.floor(val) }))
            if (val >= target) clearInterval(timer)
          }, 20)
        })
      }
    }, { threshold: 0.5 })
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const roles = [
    { emoji: '👨‍🎓', title: 'الطالب', desc: 'يتعلم ويحل اختبارات ويتابع تقدمه — حتى بدون إنترنت.', tags: ['اختبارات offline', 'محتوى مسبق التحميل', 'تتبع التقدم'], gradient: 'from-teal-500 to-cyan-400' },
    { emoji: '👩‍🏫', title: 'المعلم', desc: 'يرفع المحتوى ويُنشئ الاختبارات ويتابع أداء طلابه.', tags: ['رفع محتوى', 'إنشاء اختبارات', 'تقارير الأداء'], gradient: 'from-blue-600 to-blue-400' },
    { emoji: '🏫', title: 'مشرف المدرسة', desc: 'يدير المستخدمين ويعتمد المحتوى ويراقب المنصة.', tags: ['اعتماد محتوى', 'إدارة مستخدمين', 'لوحة تحكم'], gradient: 'from-orange-600 to-orange-400' },
    { emoji: '👨‍👩‍👧', title: 'ولي الأمر', desc: 'يتابع تقدم أبنائه ونتائجهم ومواظبتهم.', tags: ['تقدم الأبناء', 'النتائج والدرجات', 'الإشعارات'], gradient: 'from-purple-600 to-purple-400' },
    { emoji: '🤝', title: 'المانح', desc: 'يرى أثر مساهمته بأرقام وتقارير حقيقية.', tags: ['تقارير الأثر', 'الخرائط الجغرافية', 'إحصائيات حية'], gradient: 'from-amber-500 to-yellow-400' },
    { emoji: '⚙️', title: 'المدير العام', desc: 'يدير المنصة بأكملها عبر جميع المدارس والمناطق.', tags: ['تحكم كامل', 'جميع المدارس', 'تقارير شاملة'], gradient: 'from-rose-600 to-rose-400' },
  ]

  const steps = [
    { icon: '📲', num: '١', title: 'حمّل التطبيق', desc: 'APK خفيف 5MB فقط يعمل على أي هاتف Android 5.0 وأعلى' },
    { icon: '🔑', num: '٢', title: 'سجّل دخولك', desc: 'حساب واحد يعطيك وصولاً كاملاً حسب دورك في المنصة' },
    { icon: '📚', num: '٣', title: 'تعلّم بلا حدود', desc: 'محتوى يُحمّل مسبقاً ويعمل 100% بدون إنترنت في أي وقت' },
  ]

  const impacts = [
    { icon: '🎓', num: '١٠٠٠+', label: 'طالب نشط بعد 3 أشهر من الإطلاق' },
    { icon: '👩‍🏫', num: '٢٠٠+', label: 'معلم يرفع محتوى شهرياً' },
    { icon: '📈', num: '٦٠٪+', label: 'معدل فتح الإشعارات المستهدف' },
    { icon: '⭐', num: '٤.٢+', label: 'تقييم رضا المستخدمين من 5' },
  ]

  return (
    <div style={{ background: '#060a10', color: '#f8fafc', fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif", direction: 'rtl', overflowX: 'hidden' }}>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.6 }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '14px 48px' : '20px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all .4s ease',
        background: scrolled ? 'rgba(6,10,16,.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.07)' : 'none',
      }}>
        <span style={{ fontFamily: 'Tajawal', fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          نور
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['problem','التحدي'],['roles','المستخدمون'],['howto','كيف يعمل'],['impact','الأثر']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}>
              {label}
            </button>
          ))}
        </div>
        <Link to="/login" style={{
          background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000',
          padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14,
          textDecoration: 'none', boxShadow: '0 0 24px rgba(245,158,11,.3)',
          transition: 'all .2s',
        }}>
          دخول المنصة ←
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', zIndex: 1 }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-60%)', width: 700, height: 700, background: 'radial-gradient(ellipse,rgba(245,158,11,.12) 0%,transparent 65%)', pointerEvents: 'none', borderRadius: '50%', animation: 'pulse 4s ease-in-out infinite' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', color: '#f59e0b', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, letterSpacing: '.08em', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            منصة تعليمية · offline-first · مناطق النزاع
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(80px,16vw,180px)', fontWeight: 900, lineHeight: .9, letterSpacing: -4, background: 'linear-gradient(180deg,#fff 0%,rgba(255,255,255,.7) 60%,rgba(245,158,11,.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8, filter: 'drop-shadow(0 0 60px rgba(245,158,11,.2))' }}>
            نور
          </h1>
          <p style={{ fontSize: 'clamp(14px,2vw,20px)', fontWeight: 300, color: 'rgba(255,255,255,.3)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 28 }}>
            NOUR · PLATFORM
          </p>
          <p style={{ maxWidth: 560, margin: '0 auto 48px', fontSize: 'clamp(15px,1.8vw,19px)', color: 'rgba(255,255,255,.55)', lineHeight: 1.8, fontWeight: 300 }}>
            منصة تعليمية متكاملة تعمل بدون إنترنت،<br />
            تربط الطلاب بالمعلمين والمحتوى التعليمي<br />
            في أصعب الظروف.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/login" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000', padding: '16px 36px', borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 40px rgba(245,158,11,.4)', transition: 'all .3s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              ابدأ الآن ←
            </Link>
            <button onClick={() => scrollTo('problem')} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'white', padding: '16px 36px', borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all .3s' }}>
              اعرف أكثر
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.25)', fontSize: 11, letterSpacing: '.1em' }}>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom,rgba(255,255,255,.3),transparent)', animation: 'pulse 2s infinite' }} />
          اسحب للأسفل
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 1200, margin: '0 auto 0' }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(15,118,110,.15),rgba(245,158,11,.08))', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: '40px 48px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', backdropFilter: 'blur(20px)' }}>
          {[
            { num: counters.c1, suffix: '%', label: 'من الأطفال في مناطق النزاع خارج المدارس' },
            { num: counters.c2, suffix: '', label: 'أدوار مستخدم مُدارة بالكامل' },
            { num: counters.c3, suffix: '%', label: 'وظائف تعمل بدون اتصال' },
            { num: counters.c4, suffix: ' MB', label: 'فقط حجم التطبيق' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderLeft: i < 3 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
              <span style={{ fontFamily: 'Tajawal', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', lineHeight: 1, marginBottom: 6 }}>
                {s.num}{s.suffix}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.4 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section id="problem" style={{ position: 'relative', zIndex: 1, padding: '120px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,118,110,.15)', border: '1px solid rgba(20,184,166,.2)', color: '#14b8a6', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              التحدي
            </div>
            <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
              التعليم لا يتوقف<br />
              <span style={{ color: '#f59e0b' }}>حين تتوقف الكهرباء</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.5)', fontWeight: 300, lineHeight: 1.7, marginBottom: 32 }}>
              ملايين الأطفال في مناطق النزاع يُحرمون من التعليم بسبب انقطاع الإنترنت وضعف البنية التحتية. نور يُغيّر هذه المعادلة.
            </p>
            {[
              { icon: '📶', title: 'انقطاع الإنترنت المستمر', sub: 'المنصة تعمل كاملاً بدون اتصال بالشبكة' },
              { icon: '📱', title: 'أجهزة قديمة ومحدودة', sub: 'تطبيق خفيف يعمل على Android 5.0+' },
              { icon: '🔄', title: 'صعوبة مشاركة المحتوى', sub: 'P2P عبر WiFi Direct بدون إنترنت' },
            ].map(p => (
              <div key={p.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: 'rgba(245,158,11,.1)', flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <strong style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.title}</strong>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ fontSize: 100, animation: 'float 4s ease-in-out infinite', filter: 'drop-shadow(0 0 30px rgba(245,158,11,.3))' }}>🕯️</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,118,110,.15)', border: '1px solid rgba(20,184,166,.2)', color: '#14b8a6', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', marginBottom: 20 }}>
              من يستخدم نور؟
            </div>
            <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.1 }}>
              منصة واحدة، <span style={{ color: '#14b8a6' }}>ستة أدوار متكاملة</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {roles.map(role => (
              <div key={role.title}
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 28, transition: 'all .3s', cursor: 'default', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-6px)'
                  el.style.background = 'rgba(255,255,255,.06)'
                  el.style.borderColor = 'rgba(255,255,255,.12)'
                  el.style.boxShadow = '0 20px 60px rgba(0,0,0,.3)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(0)'
                  el.style.background = 'rgba(255,255,255,.03)'
                  el.style.borderColor = 'rgba(255,255,255,.07)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 18, display: 'block' }}>{role.emoji}</div>
                <h3 style={{ fontFamily: 'Tajawal', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{role.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, marginBottom: 16 }}>{role.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {role.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.07)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howto" style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,118,110,.15)', border: '1px solid rgba(20,184,166,.2)', color: '#14b8a6', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', marginBottom: 20 }}>
              كيف يعمل
            </div>
            <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.1 }}>
              ثلاث خطوات بسيطة، <span style={{ color: '#f59e0b' }}>لبدء التعلم</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {steps.map(step => (
              <div key={step.num} style={{ textAlign: 'center', padding: '0 24px' }}>
                <div
                  style={{ width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'linear-gradient(135deg,rgba(245,158,11,.15),rgba(249,115,22,.1))', border: '1px solid rgba(245,158,11,.2)', fontSize: 36, transition: 'all .3s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,.2)'; e.currentTarget.style.transform = 'scale(1.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {step.icon}
                </div>
                <h3 style={{ fontFamily: 'Tajawal', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section id="impact" style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,118,110,.15)', border: '1px solid rgba(20,184,166,.2)', color: '#14b8a6', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', marginBottom: 20 }}>
            الرؤية
          </div>
          <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, marginBottom: 64 }}>أهداف المنصة</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {impacts.map(item => (
              <div key={item.num}
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: '32px 24px', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)' }}
              >
                <span style={{ fontSize: 40, marginBottom: 16, display: 'block' }}>{item.icon}</span>
                <span style={{ fontFamily: 'Tajawal', fontSize: 40, fontWeight: 900, background: 'linear-gradient(135deg,#14b8a6,#0f766e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', marginBottom: 4 }}>{item.num}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '80px 48px', background: 'linear-gradient(135deg,rgba(245,158,11,.08),rgba(249,115,22,.05))', border: '1px solid rgba(245,158,11,.15)', borderRadius: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(ellipse,rgba(245,158,11,.1),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: 'Tajawal', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
              ابدأ مع نور <span style={{ color: '#f59e0b' }}>اليوم</span>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,.5)', marginBottom: 40, lineHeight: 1.7 }}>
              سواء كنت معلماً أو مشرفاً أو مانحاً،<br />لوحة الإدارة جاهزة لاستقبالك.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/login" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000', padding: '16px 36px', borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 40px rgba(245,158,11,.4)' }}>
                دخول لوحة الإدارة ←
              </Link>
              <Link to="/register" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: 'white', padding: '16px 36px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'Tajawal', fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>نور</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>منصة التعليم في مناطق النزاع · Nour Platform v2.0</div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['login','تسجيل الدخول'],['register','إنشاء حساب']].map(([to, label]) => (
              <Link key={to} to={`/${to}`} style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.3)')}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ── CSS Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @media(max-width:900px){
          nav > div { display: none; }
        }
        @media(max-width:768px){
          #problem > div, #roles > div > div:last-child { grid-template-columns: 1fr !important; }
          #howto > div > div:last-child { grid-template-columns: 1fr !important; }
          #impact > div > div:last-child { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
