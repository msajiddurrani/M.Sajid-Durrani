import { useEffect, useMemo, useRef, useState } from 'react'
import { getVisibleTechnologies, stackFilters, technologies } from '../../data/techStack'
import type { StackFilter } from '../../data/techStack'
import type { CSSProperties } from 'react'
import { brandSurfaces, neutralSurface } from '../../data/brandSurfaces'
import { usePhysicsEngine } from './usePhysicsEngine'
import './TechStackSection.css'
import { MotionHeading } from '../ui/MotionHeading'

export function TechStackSection() {
  const arena = useRef<HTMLUListElement>(null)
  const [filter, setFilter] = useState<StackFilter>('all')
  const [width, setWidth] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const limit = width < 430 ? 14 : width < 740 ? 16 : width < 950 ? 18 : 20
  const visible = useMemo(() => getVisibleTechnologies(filter, limit), [filter, limit])
  const activeIds = useMemo(() => new Set(visible.map(({ id }) => id)), [visible])
  const inspected = visible.find(({ id }) => id === (focused ?? hovered))

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  usePhysicsEngine(arena, visible, !reducedMotion, setWidth)

  return (
    <div className="tech-stack">
      <header className="stack-heading">
        <div>
          <p className="stack-kicker mono">03 / Technology &amp; Expertise</p>
          <MotionHeading id="expertise-title" first="WHAT I" second="BUILD WITH." />
        </div>
        <p className="stack-intro">From interfaces and scalable backends to intelligent AI systems — the technologies behind my work.</p>
      </header>

      <div className="stack-controls">
        <div className="stack-filters mono" role="group" aria-label="Technology categories">
          {stackFilters.map(({ id, name }) => (
            <button key={id} type="button" aria-pressed={filter === id} aria-controls="technology-balls" onClick={() => setFilter(id)}>
              {name}
            </button>
          ))}
        </div>
        <p className="stack-count mono" role="status">
          {filter === 'all' ? visible.length + ' of ' + technologies.length : visible.length} technologies
        </p>
      </div>

      <div className="stack-field">
        <p className="stack-inspected mono" aria-live="polite">{inspected?.name ?? "\u00a0"}</p>
        <ul id="technology-balls" ref={arena} className="tech-arena" aria-label="Technologies in the selected category">
          {technologies.map((technology) => {
            const active = activeIds.has(technology.id)
            return (
              <li
                key={technology.id}
                className="stack-ball"
                style={{ "--ball-color":(brandSurfaces[technology.id]??neutralSurface).color } as CSSProperties}
                data-technology={technology.id}
                data-active={active}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
                onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(technology.id) }}
                onPointerLeave={() => setHovered((current) => current === technology.id ? null : current)}
                onFocus={() => setFocused(technology.id)}
                onBlur={() => setFocused(null)}
              >
                <span className="stack-ball-face" data-light-backing={technology.lightBacking || undefined}>
                  {technology.logo
                    ? <img src={technology.logo} alt="" width="48" height="48" decoding="async" draggable={false} />
                    : <span className="stack-ball-type mono" aria-hidden="true">{technology.mark}</span>}
                </span>
                <span className="stack-ball-text">{technology.name}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
