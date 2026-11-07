import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { Technology } from '../../data/techStack'
import type { PhysicsWorld } from './physicsWorld'

export function usePhysicsEngine(
  arena: RefObject<HTMLUListElement>,
  technologies: readonly Technology[],
  enabled: boolean,
  onWidth: (width: number) => void,
) {
  const world = useRef<PhysicsWorld | null>(null)
  const selection = useRef(technologies)

  useLayoutEffect(() => {
    selection.current = technologies
    world.current?.setTechnologies(technologies)
  }, [technologies])

  useLayoutEffect(() => {
    const element = arena.current
    if (!element) return

    let disposed = false
    let inView = false
    function measure() {
      if (!element) return
      onWidth(element.clientWidth)
      world.current?.resize(element.clientWidth, element.clientHeight)
    }
    function syncVisibility() {
      world.current?.setVisible(inView && !document.hidden)
    }

    measure()
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : undefined
    resize?.observe(element)
    const observer = enabled && resize && typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => {
        inView = entry.intersectionRatio >= .12
        syncVisibility()
      }, { threshold: [.12] })
      : undefined

    if (observer) {
      observer.observe(element)
      document.addEventListener('visibilitychange', syncVisibility)
      void import('./physicsWorld').then(({ createPhysicsWorld }) => {
        if (disposed) return
        const simulation = createPhysicsWorld(element)
        world.current = simulation
        measure()
        simulation.setTechnologies(selection.current)
        syncVisibility()
      }).catch(() => {
        // The labelled grid remains available if the animation module cannot load.
        world.current?.destroy()
        world.current = null
      })
    }

    return () => {
      disposed = true
      resize?.disconnect()
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncVisibility)
      world.current?.destroy()
      world.current = null
    }
  }, [arena, enabled, onWidth])
}
