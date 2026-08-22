import React, { useEffect } from 'react'
import { profile, nav, about, loves, character, conflicts, facts, goals, quotes, socials, socialsTitle, footer, privacy } from './data'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useActiveSection() {
  const [active, setActive] = React.useState(null)

  useEffect(() => {
    const ids = nav.map((n) => n.id)

    const onEnter = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      })
    }

    const io = new IntersectionObserver(onEnter, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0,
    })

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })

    return () => io.disconnect()
  }, [])

  return active
}

function useMobileTransToggle() {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onTap = (e) => {
      if (!mq.matches) return
      const tapped = e.target.closest('.trans')
      const host = (tapped ? tapped.parentElement : e.target).closest(
        '.lead, .card-desc, .trait-pole, .hero-code, .hero-meta, .fact-text'
      )
      if (host) host.classList.toggle('trans-open')
    }
    document.addEventListener('click', onTap)
    return () => document.removeEventListener('click', onTap)
  }, [])
}

function Sidebar() {
  const active = useActiveSection()

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">g</span>
          <span className="brand-name">{profile.name}</span>
        </a>
        <nav className="nav">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={`nav-link ${active === n.id ? 'is-active' : ''}`}>
              <span className="nav-dot" />
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function Topbar() {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)
  const navRef = React.useRef(null)
  const active = useActiveSection()

  useEffect(() => {
    if (!open) return
    const onScroll = () => setOpen(false)
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusables = ref.current?.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const first = navRef.current?.querySelector('a')
    if (first) first.focus()
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      if (getComputedStyle(el).display === 'none') return
      const h = el.getBoundingClientRect().height
      document.documentElement.style.setProperty('--topbar-h', `${h}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.setProperty('--topbar-h', '')
    }
  }, [])

  return (
    <header className="topbar" ref={ref}>
      <a href="#top" className="brand">
        <span className="brand-mark">g</span>
        <span className="brand-name">{profile.name}</span>
      </a>
      <button
        className="burger"
        aria-label="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>
      {open && (
        <nav className="topbar-nav" ref={navRef}>
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={active === n.id ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function getAge(birthDate) {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
  return age
}

function Hero() {
  const age = getAge(profile.birth)

  return (
    <section id="top" className="hero">
      <p className="hero-code" data-reveal>
        {profile.role}
        <span className="hero-caret" aria-hidden />
        <span className="trans">{profile.roleEn}</span>
      </p>
      <h1 className="hero-name" data-reveal>
        {profile.name}
      </h1>
      <div className="hero-meta" data-reveal>
        {profile.alias} · {profile.birthRu} ({age}) · {profile.city}
        <span className="trans">
          {profile.aliasEn} · {profile.birthEn} ({age}) · {profile.cityEn}
        </span>
      </div>
      <div className="hero-scroll" aria-hidden>
        <span className="hero-scroll-label">scroll</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  )
}

function SectionHead({ title, titleRu, index }) {
  return (
    <div className="section-head" data-reveal>
      <span className="section-index">0{index}</span>
      <h2 className="section-title">
        {title} <span className="section-title-ru">{titleRu}</span>
      </h2>
    </div>
  )
}

function About() {
  return (
    <section id="about" className="section">
      <SectionHead title={about.title} titleRu={about.titleRu} index={1} />
      <div className="section-body" data-reveal>
        {about.text.map((p, i) => (
          <p key={i} className="lead">
            {p.ru}
            <span className="trans">{p.en}</span>
          </p>
        ))}
      </div>
    </section>
  )
}

function Loves() {
  return (
    <section id="loves" className="section">
      <SectionHead title={loves.title} titleRu={loves.titleRu} index={2} />
      <div className="grid grid-2">
        {loves.items.map((item, i) => (
          <div key={i} className="card">
            <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="card-title">{item.label}</h3>
            <p className="card-desc">
              {item.desc}
              <span className="trans">{item.en}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Character() {
  return (
    <section id="character" className="section">
      <SectionHead title={character.title} titleRu={character.titleRu} index={3} />
      <div className="traits" data-reveal>
        {character.traits.map((t, i) => (
          <div key={i} className="trait">
            <div className="trait-row">
              <span className="trait-pole trait-pole-left">
                {t.left}
                <span className="trans">{t.leftEn}</span>
              </span>
              <span className="trait-value">{t.level}%</span>
              <span className="trait-pole trait-pole-right">
                {t.right}
                <span className="trans trait-trans">{t.en}</span>
              </span>
            </div>
            <span
              className="trait-bar"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={t.level}
              aria-label={`${t.right} — ${t.level}%`}
            >
              <span className="trait-bar-fill" style={{ '--target': `${t.level}%`, '--delay': `${i * 0.12}s` }} />
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Conflicts() {
  return (
    <section id="conflicts" className="section">
      <SectionHead title={conflicts.title} titleRu={conflicts.titleRu} index={4} />
      <div className="conflicts" data-reveal>
        {conflicts.items.map((c, i) => (
          <div key={i} className="conflict">
            <div className="trait-row">
              <span className="trait-pole trait-pole-left">
                {c.left}
                <span className="trans">{c.leftEn}</span>
              </span>
              <span className="trait-pole trait-pole-right">
                {c.right}
                <span className="trans trait-trans">{c.rightEn}</span>
              </span>
            </div>
            <span className="conflict-bar" aria-hidden="true">
              <span className="conflict-cursor" style={{ '--delay': `${i * 0.15}s` }} />
            </span>
            <span className="sr-only">
              напряжение между «{c.left}» и «{c.right}»
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Facts() {
  return (
    <section id="facts" className="section">
      <SectionHead title={facts.title} titleRu={facts.titleRu} index={5} />
      <ul className="facts" data-reveal>
        {facts.items.map((f, i) => (
          <li key={i} className="fact">
            <span className="fact-mark">[ {String(i + 1).padStart(2, '0')} ]</span>
            <span className="fact-text">
              {f.ru}
              <span className="trans">{f.en}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Goals() {
  return (
    <section id="goals" className="section">
      <SectionHead title={goals.title} titleRu={goals.titleRu} index={6} />
      <ul className="facts goals" data-reveal>
        {goals.items.map((g, i) => (
          <li key={i} className="fact">
            <span className="fact-mark">[ {String(i + 1).padStart(2, '0')} ]</span>
            <span className="fact-text">
              {g.ru}
              <span className="trans">{g.en}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Quotes() {
  return (
    <section id="quotes" className="section">
      <SectionHead title={quotes.title} titleRu={quotes.titleRu} index={7} />
      <ul className="facts" data-reveal>
        {quotes.items.map((q, i) => (
          <li key={i} className="fact">
            <span className="fact-mark">[ {String(i + 1).padStart(2, '0')} ]</span>
            <span className="fact-text">
              {q.ru}
              <span className="trans">{q.en}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Socials() {
  return (
    <section id="socials" className="section">
      <SectionHead title={socialsTitle.title} titleRu={socialsTitle.titleRu} index={8} />
      <div className="socials" data-reveal>
        {socials.map((s) => (
          <a key={s.id} className="social" href={s.href} target="_blank" rel="noreferrer">
            <span className="social-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d={s.icon} />
              </svg>
            </span>
            <span className="social-main">
              <span className="social-label">{s.label}</span>
              <span className="social-handle">{s.handle}</span>
            </span>
            <span className="social-hint">{s.hint}</span>
            <span className="social-arrow" aria-hidden>
              ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

function PrivacyModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">
          {privacy.title} <span className="modal-title-ru">{privacy.titleRu}</span>
        </h3>
        <p className="modal-updated">{privacy.updated}</p>
        <div className="modal-body">
          {privacy.sections.map((s, i) => (
            <section key={i} className="modal-section">
              <h4 className="modal-section-title">
                {s.title} <span className="modal-title-ru">{s.titleEn}</span>
              </h4>
              <p className="modal-section-body">{s.body}</p>
              <p className="modal-section-body modal-section-body-en">{s.bodyEn}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  useReveal()
  useMobileTransToggle()
  const [policyOpen, setPolicyOpen] = React.useState(false)
  return (
    <div className="app">
      <Sidebar />
      <Topbar />
      <main className="content">
        <Hero />
        <About />
        <Loves />
        <Character />
        <Conflicts />
        <Facts />
        <Goals />
        <Quotes />
        <Socials />
        <footer className="footer">
          <span>
            {footer.line} ·{' '}
            <button className="footer-policy" onClick={() => setPolicyOpen(true)}>
              {footer.policy}
            </button>
          </span>
        </footer>
      </main>
      <PrivacyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </div>
  )
}

export default App
