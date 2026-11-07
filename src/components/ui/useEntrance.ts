import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useEntrance(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    element.dataset.entrance = 'waiting'
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      element.dataset.entrance = 'entered'
      observer.disconnect()
    }, { threshold: .12 })
    observer.observe(element)
    return () => {
      observer.disconnect()
      delete element.dataset.entrance
    }
  }, [ref])
}
