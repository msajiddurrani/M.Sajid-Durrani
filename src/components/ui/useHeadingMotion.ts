import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let fontRefreshQueued = false
function refreshAfterFonts() {
  if (fontRefreshQueued) return
  fontRefreshQueued = true
  requestAnimationFrame(() => {
    fontRefreshQueued = false
    ScrollTrigger.refresh()
  })
}

/** One reversible, scroll-driven fold; no extra pinning or per-frame layout work. */
export function useHeadingMotion(ref: RefObject<HTMLElement>, chapter = false) {
  useLayoutEffect(() => {
    if (!ref.current) return
    let active = true
    const media = gsap.matchMedia(ref.current)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: ref.current,
        start: chapter ? 'top 90%' : 'top 94%',
        end: chapter ? 'center 62%' : 'top 72%',
        scrub: .18,
        invalidateOnRefresh: true,
      } })
      ref.current!.querySelectorAll<HTMLElement>('.kinetic-word').forEach((word, index) => {
        const direction = index % 2 === 0 ? -1 : 1
        timeline.fromTo(word, {
          x: () => direction * Math.min(innerWidth * .18, 180),
          y: 0,
          z: -80,
          rotationY: -direction * 18,
          rotationX: 0,
          rotationZ: 0,
          opacity: 0,
          transformOrigin: direction < 0 ? '100% 65%' : '0% 65%',
        }, {
          x: 0, y: 0, z: 0, rotationY: 0, rotationX: 0, rotationZ: 0,
          opacity: 1, duration: 1, ease: 'power3.out',
        }, index * .065)
        timeline.fromTo(word.querySelectorAll('.kinetic-letter'), {
          yPercent: 110, rotationX: -70,
        }, {
          yPercent: 0, rotationX: 0, duration: .72, ease: 'power3.out',
          stagger: { each: .018, from: direction < 0 ? 'start' : 'end' },
        }, index * .065)
      })
    })
    // Variable-font metrics can change wrapping above subsequent sections.
    // Coalesce all heading instances into one refresh after the font settles.
    void document.fonts.ready.then(() => { if (active) refreshAfterFonts() })
    document.fonts.addEventListener('loadingdone', refreshAfterFonts)
    return () => {
      active = false
      document.fonts.removeEventListener('loadingdone', refreshAfterFonts)
      media.revert()
    }
  }, [ref, chapter])
}
