import { PortraitReveal } from './PortraitReveal'

const top = 'M0 25l23 6 8-2 20 6 15-2 17 6 31-2 8 3 24-3 14 4 19-1 9-4 26 1 15-5 18-2 9 2 16-5 28-2 10 3 23-4 13 1 15-5 16 1 19-6 10 1 12-4 22 3 13-1 23 4 19-1 8 2 28-1 19 5 13-3 22 2 19 5 15-1 9 3 14-3 21 4 17-2 9 4 22-3 13 1 21-6 8 1 20-3 18-6 11 1 22-5 26 1 17-4 10 2 14-3 29 3 18-2 18 4 21 1 19 4 8-2 21 5 17-1 10 4 21-1 15 4 14-2 26 4 12-2 20 2 17-4 12 1 19-5 20 1 19-3 21 2 11-2 24 3 11-4 18 2 19-5 19 1 12-4 18 2 12-4 20 1 21-5 15 3 20-5 23 2 24-7 16 2 21-6 28-4 24-5L1440 64H0Z'
const bottom = 'M0 42l18-5 18-7 18 1 14-7 16 1 17-4 23 1 17-6 15 2 22-3 15 5 20-1 10 4 24-1 18 6 14-2 19 5 13-3 21 4 13-1 24 4 19-2 19 3 13-5 20 1 26-5 12 2 25-7 18 2 14-4 24 2 18-4 12 2 16-5 16 2 20-6 19 3 16-3 18 4 22-2 17 7 10-3 25 5 18-2 19 6 16-1 23 6 10-2 25 6 14-3 21 4 11-3 21 2 12-4 24 2 14-3 17 2 15-5 24 3 15-3 13 3 25-5 19 2 20-5 12 2 16-5 23 2 12-4 24 4 16-3 19 4 13-2 20 6 14-2 18 5 16-2 23 6 12-2 16 5 24-3 17 5 19-2 20 5 17-4 24 2 18-3 17 2 15-5 23 1 18-7L1440 0H0Z'

export function TornPaperStage() {
  return (
    <section className="stage" aria-labelledby="stage-title">
      <svg className="tear tear-top" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true"><path d={top} /></svg>
      <div className="stage-inner">
        <p className="stage-index mono"><span className="red">FIG. 01</span> / Portrait study</p>
        <h2 id="stage-title" className="visually-hidden">The person behind the system</h2>
        <div className="stage-type" aria-hidden="true"><span>BEHIND</span><span>THE SYSTEM</span></div>
        <p id="portrait-description" className="visually-hidden">A black stone portrait wears red-lit VR goggles. The reveal shows Muhammad Sajid Durrani in a black turtleneck.</p>
        <PortraitReveal />
        <p id="portrait-instructions" className="stage-caption mono">
          <span className="stage-caption-action"><i className="registration" /> <span className="mouse-hint">Move to reveal</span><span className="touch-hint">Touch &amp; drag to reveal</span><span className="fallback-hint">Activate to switch portraits</span></span>
          <span className="keyboard-hint">Enter / Space to reveal <span aria-hidden="true">·</span> Esc to reset</span>
        </p>
      </div>
      <svg className="tear tear-bottom" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true"><path d={bottom} /></svg>
    </section>
  )
}
