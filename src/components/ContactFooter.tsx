import { useEffect, useRef } from 'react'
import { contact, identity } from '../data/portfolio'
import { useEntrance } from './ui/useEntrance'

import { createHeroField } from './hero/fluidField'
import { MotionHeading } from './ui/MotionHeading'

const destinations = [['About', '#about'], ['Work', '#work'], ['Stack', '#expertise'], ['Contact', '#contact']]

function Signature() {
  const signature = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const element = signature.current!
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | null = null
    function synchronize() {
      observer?.disconnect()
      element.dataset.signature = 'static'
      if (motion.matches || typeof IntersectionObserver === 'undefined') return
      element.dataset.signature = 'waiting'
      observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio >= .2) element.dataset.signature = 'draw'
        else if (!entry.isIntersecting) element.dataset.signature = 'waiting'
      }, { threshold: [0, .2] })
      observer.observe(element)
    }
    synchronize()
    motion.addEventListener('change', synchronize)
    return () => { observer?.disconnect(); motion.removeEventListener('change', synchronize) }
  }, [])
  return (
    <svg ref={signature} data-signature="waiting" className="footer-signature" viewBox="0 0 650 255" role="img" aria-label="Handwritten MSD monogram">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="signature-main" pathLength="1" d="M22 209C60 207 91 124 127 60C139 39 146 42 137 71L106 167C123 144 155 92 174 82C192 73 185 104 174 130L158 165C180 142 219 84 237 77C252 71 250 88 238 115C222 153 221 172 243 168C268 162 288 135 309 114M309 114C327 99 371 77 374 57C377 41 348 38 322 49C299 59 282 75 287 88C293 103 337 104 347 123C359 146 324 172 295 174C266 176 258 161 274 149C288 138 315 137 338 141C374 148 390 142 410 116M410 116C426 94 440 68 449 53C455 42 461 40 457 56C449 92 434 139 420 173C414 188 405 194 402 188C395 174 423 141 441 127C467 108 519 110 538 79C554 53 534 34 508 37C483 40 467 54 453 73M439 61C481 29 557 30 567 76C578 123 501 177 430 181C415 182 409 177 414 170" />
        <path className="signature-pressure" pathLength="1" d="M112 161C135 130 157 93 174 82M166 147C184 128 220 84 237 77M291 85C295 103 337 104 347 123C359 146 324 172 295 174M448 72C440 106 431 143 420 173M563 66C583 110 518 162 451 177" />
        <path className="signature-flourish" pathLength="1" d="M102 217C197 195 317 188 422 201C468 207 542 202 615 185" />
        <path className="signature-accent" pathLength="1" d="M563 204C591 200 614 194 633 187" />
      </g>
    </svg>
  )
}

export function ContactFooter() {
  const section = useRef<HTMLElement>(null)
  useEntrance(section)
  useEffect(() => {
    if (!section.current) return
    const waves = createHeroField(section.current)
    return () => waves.destroy()
  }, [])
  return (
    <footer id="contact" ref={section} className="closing" aria-labelledby="contact-title">
      <canvas className="closing-contours" aria-hidden="true" />
      <div className="wrap">
        <div className="closing-header section-entrance">
          <p className="eyebrow"><span>05</span> / Contact</p>
          <MotionHeading id="contact-title" first="LET’S BUILD" second="WHAT’S NEXT." className="motion-title-stacked" />
          <p className="mono closing-role">{identity.role}</p>
        </div>
        <div className="closing-stage">
          <nav className="closing-column closing-explore section-entrance" aria-label="Explore portfolio">
            <h3 className="mono">Explore</h3>
            {destinations.map(([label, href]) => <a key={href} href={href}><span className="strike-text">{label}</span></a>)}
          </nav>
          <div className="closing-mark"><Signature /></div>
          <nav id="connect" className="closing-column closing-connect section-entrance" aria-label="Contact and profiles">
            <h3 className="mono">Connect</h3>
            {contact.map(({ label, url }) => <a key={label} href={url}><span className="strike-text">{label}</span><span aria-hidden="true"> ↗</span></a>)}
          </nav>
        </div>
        <div className="closing-action section-entrance">
          <a className="closing-cta mono" href={contact.find(({ label }) => label === 'WhatsApp')?.url} target="_blank" rel="noreferrer">Let’s talk on WhatsApp <span aria-hidden="true">↗</span></a>
        </div>
        <div className="closing-bottom mono section-entrance">
          <span>© {identity.year} {identity.shortName}</span>
          <a href="#top"><span className="strike-text">Back to top</span> <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  )
}
