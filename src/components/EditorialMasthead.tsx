import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { identity } from '../data/portfolio'
import { PortraitReveal } from './PortraitReveal'
import type { PortraitRevealHandle } from './PortraitReveal'
import { createHeroField } from './hero/fluidField'
import '../hero.css'

gsap.registerPlugin(ScrollTrigger)

export function EditorialMasthead() {
  const scene = useRef<HTMLElement>(null)
  const reveal = useRef<PortraitRevealHandle>(null)
  const field = useRef<ReturnType<typeof createHeroField> | null>(null)
  const [showFace, setShowFace] = useState(false)

  useLayoutEffect(() => {
    const hero = scene.current
    if (!hero) return
    const flow = createHeroField(hero)
    field.current = flow

    const media = gsap.matchMedia(hero)
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      compact: '(max-width: 700px), (max-height: 540px)',
    }, ({ conditions }) => {
      if (!conditions?.motion) return
      const compact = conditions.compact
      const animation = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          flow.setProgress(animation.progress())
          reveal.current?.setScrollProgress(animation.progress())
          reveal.current?.syncPointer()
        },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: () => '+=' + Math.round(hero.clientHeight * (compact ? .64 : .96)),
          pin: true,
          scrub: compact ? .22 : .36,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      animation
        .fromTo('.portrait', { scale: 1, y: () => hero.clientHeight * -.055 }, {
          scale: compact ? .48 : .46,
          y: () => hero.clientHeight * (compact ? .105 : .14),
          duration: 1,
        }, 0)
        .fromTo('.hero-progress-fill', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        .fromTo('[data-role-line="primary"]', { yPercent: 105, rotationX: -28, rotationY: 12, z: -90 }, { yPercent: 0, rotationX: 0, rotationY: 0, z: 0, duration: .52, ease: 'power1.out' }, .22)
        .fromTo('[data-role-line="secondary"]', { yPercent: -108, rotationX: 28, rotationY: -12, z: -90 }, { yPercent: 0, rotationX: 0, rotationY: 0, z: 0, duration: .56, ease: 'power1.out' }, .32)
      return () => flow.setProgress(0)
    })

    return () => {
      media.revert()
      flow.destroy()
      field.current = null
    }
  }, [])

  return (
    <section id="hero" ref={scene} className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="visually-hidden">{identity.shortName}</h1>
      <canvas className="hero-contours" aria-hidden="true" />
      <svg className="hero-mask-defs" aria-hidden="true">
        <defs>
          <mask id="hero-helmet" maskContentUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
            <rect width="1" height="1" fill="white" data-mask-cover="" />
            <path fill="black" data-portrait-fragments="" />
          </mask>
          <mask id="hero-face" maskContentUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
            <rect width="1" height="1" fill="black" data-mask-cover="" />
            <path fill="white" data-portrait-fragments="" />
          </mask>
          <mask id="hero-glyphs" maskContentUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
            <path fill="white" data-glyph-field="" />
          </mask>
        </defs>
      </svg>


      <div className="hero-roles">
        <div className="hero-role-mask"><p className="hero-role-primary" data-role-line="primary">FULL-STACK DEVELOPER</p></div>
        <div className="hero-role-mask"><p className="hero-role-secondary" data-role-line="secondary">AI ENGINEER</p></div>
        <div className="hero-roles-overlay" aria-hidden="true">
          <div className="hero-role-mask"><p className="hero-role-primary" data-role-line="primary">FULL-STACK DEVELOPER</p></div>
          <div className="hero-role-mask"><p className="hero-role-secondary" data-role-line="secondary">AI ENGINEER</p></div>
        </div>
      </div>
      <p id="portrait-description" className="visually-hidden">A black stone portrait wears red-lit VR goggles. The reveal shows Muhammad Sajid Durrani in a black turtleneck.</p>
      <div className="hero-portrait"><PortraitReveal ref={reveal} /></div>
      <div className="hero-footer mono">
        <p id="portrait-instructions">
          <span className="hero-instructions-mark" aria-hidden="true" />
          <span className="mouse-hint visually-hidden">Move to reveal</span>
          <span className="touch-hint visually-hidden">Drag sideways to reveal</span>

          <span className="visually-hidden">Press Enter or Space for a centered reveal, and Escape to close it.</span>
        </p>
        <div className="hero-progress" aria-hidden="true"><span className="hero-progress-fill" /></div>
        <button className="hero-motion-toggle" type="button" aria-pressed={showFace} onClick={() => {
          field.current?.setProgress(showFace ? 0 : 1)
          setShowFace(!showFace)
        }}>{showFace ? 'Show helmet' : 'Show face'}</button>
        <a href="#about" className="hero-scroll"><span className="strike-text">Scroll to explore</span><span aria-hidden="true">↓</span></a>
      </div>
    </section>
  )
}
