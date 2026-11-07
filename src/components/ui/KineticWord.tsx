export function KineticWord({ text, side }: { text: string; side: 'left' | 'right' }) {
  return <span className="kinetic-word" data-heading-left={side === 'left' ? '' : undefined} data-heading-right={side === 'right' ? '' : undefined} aria-hidden="true">
    <span className="kinetic-letter-line">{Array.from(text, (letter, index) =>
      <span key={index} className={'kinetic-letter' + (letter === '.' ? ' kinetic-stop' : '')}>{letter === ' ' ? '\u00a0' : letter}</span>,
    )}</span>
  </span>
}
