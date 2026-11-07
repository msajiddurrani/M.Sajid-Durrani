import { useEffect, useRef, useState } from 'react'
import { identity } from '../data/portfolio'

const links = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'expertise', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
]

export function SiteNavigation() {
  const header = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ active: '', light: false })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const darkPanels = ['hero', 'work', 'contact'].map((id) => document.getElementById(id))
    const sections = links.map(({ id }) => ({ id, element: document.getElementById(id) }))
    let frame = 0

    function update() {
      frame = 0
      const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      let active = nearBottom ? 'contact' : ''
      if (!nearBottom) {
        for (const { id, element } of sections) {
          if (element && element.getBoundingClientRect().top <= 146) active = id
        }
      }
      const light = !darkPanels.some((panel) => {
        const rect = panel?.getBoundingClientRect()
        return rect && rect.top <= 34 && rect.bottom > 34
      })
      setPosition((previous) => previous.active === active && previous.light === light
        ? previous
        : { active, light })
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const initial = window.requestAnimationFrame(() => {
      if (!window.scrollY && window.location.hash.length > 1) {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
      }
      scheduleUpdate()
    })
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(initial)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      toggle.current?.focus()
    }

    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenuOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [menuOpen])

  return (
    <header ref={header} className="masthead" data-light={position.light} data-menu-open={menuOpen}>
      <div className="masthead-bar">
        <a className="signature" href="#top" onClick={() => setMenuOpen(false)}><span className="strike-text">{identity.shortName}</span></a>
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'} <span className="menu-toggle-icon" aria-hidden="true" />
        </button>
        <nav id="site-navigation" className="masthead-nav" aria-label="Main">
          {links.map(({ id, label }) => (
            <a key={id} href={'#' + id} aria-current={position.active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>
              <span className="strike-text">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
