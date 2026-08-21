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

function Sidebar() {
  const [active, setActive] = React.useState(null)

  useEffect(() => {
    const ids = nav.map((n) => n.id)
    const onScroll = () => {
      const threshold = window.innerHeight * 0.35
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= threshold) current = id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = ids[ids.length - 1]
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

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
        <div className="sidebar-cmd">{footer.cmd}</div>
      </div>
    </aside>
  )
}

function Topbar() {
  const [open, setOpen] = React.useState(false)
  return (
    <header className="topbar">
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
        <nav className="topbar-nav">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function Hero() {
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
        {profile.alias}
        <span className="trans">{profile.aliasEn}</span>
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
            <span className="trait-bar">
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
            <span className="conflict-bar">
              <span className="conflict-cursor" style={{ '--delay': `${i * 0.15}s` }} />
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
