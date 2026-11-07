import type { PointerEvent } from 'react'

type MagneticLinkProps = {
  href: string
  label: string
  variant: 'primary' | 'secondary'
}

function trackPointer(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
  const link = event.currentTarget
  const bounds = link.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width - .5
  const y = (event.clientY - bounds.top) / bounds.height - .5
  link.style.setProperty('--magnet-x', (x * 12) + 'px')
  link.style.setProperty('--magnet-y', (y * 8) + 'px')
}

function resetPosition(link: HTMLAnchorElement) {
  link.style.removeProperty('--magnet-x')
  link.style.removeProperty('--magnet-y')
}

export function MagneticLink({ href, label, variant }: MagneticLinkProps) {
  return (
    <a
      className={'magnetic-link magnetic-' + variant}
      href={href}
      onPointerMove={trackPointer}
      onPointerLeave={(event) => resetPosition(event.currentTarget)}
      onPointerCancel={(event) => resetPosition(event.currentTarget)}
      onBlur={(event) => resetPosition(event.currentTarget)}
    >
      <span className="magnetic-face">{label}<span aria-hidden="true">↘</span></span>
    </a>
  )
}
