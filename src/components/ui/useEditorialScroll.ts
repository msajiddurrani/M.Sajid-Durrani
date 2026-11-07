import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export function useEditorialScroll(section: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    if (!section.current) return
    const media = gsap.matchMedia(section.current)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      section.current!.querySelectorAll<HTMLElement>('[data-split-title]').forEach(element => {
        const words = element.querySelectorAll('span')
        gsap.set(element, { perspective: 900 })
        words.forEach((word,index)=>{
          const direction=index%2===0 ? -1 : 1
          gsap.fromTo(word, {x:direction*55,y:14,rotationY:direction*-24,z:-45,opacity:.2}, {
            x:0,y:0,rotationY:0,z:0,opacity:1,ease:'power2.out',
            scrollTrigger:{trigger:element,start:'top 95%',end:'top 70%',scrub:.5,invalidateOnRefresh:true},
          })
        })
      })
      section.current!.querySelectorAll<HTMLElement>('[data-enter]').forEach(element => {
        gsap.fromTo(element, { x: Number(element.dataset.enter) * 65, opacity: .15 }, {
          x: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: element, start: 'top 95%', end: 'top 70%', scrub: .35, invalidateOnRefresh: true },
        })
      })
    })
    return () => media.revert()
  }, [section])
}
