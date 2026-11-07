import { useRef } from 'react'
import { useHeadingMotion } from './useHeadingMotion'
import { KineticWord } from './KineticWord'

export function ScrollHeading({ id, first, second, number, caption }: {
  id: string; first: string; second: string; number: string; caption: string
}) {
  const heading = useRef<HTMLDivElement>(null)
  useHeadingMotion(heading, true)
  return <div className="chapter-heading" ref={heading}>
    <p className="eyebrow"><span>{number}</span> / {caption}</p>
    <h2 id={id} className="converging-title" aria-label={first + ' ' + second}>
      <KineticWord text={first} side="left" />
      <KineticWord text={second} side="right" />
    </h2>
    <div className="chapter-rule" aria-hidden="true"><span /></div>
  </div>
}
