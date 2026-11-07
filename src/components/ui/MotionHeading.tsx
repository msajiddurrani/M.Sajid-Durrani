import { useRef } from 'react'
import { useHeadingMotion } from './useHeadingMotion'
import { KineticWord } from './KineticWord'

export function MotionHeading({ id, first, second, className = '' }: {
  id: string; first: string; second: string; className?: string
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useHeadingMotion(heading)
  return <h2 ref={heading} id={id} className={'motion-title ' + className} aria-label={first + ' ' + second}>
    <KineticWord text={first} side="left" />{' '}
    <KineticWord text={second} side="right" />
  </h2>
}
