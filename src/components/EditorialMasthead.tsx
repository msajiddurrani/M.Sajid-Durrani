import { identity } from '../data/portfolio'

export function EditorialMasthead() {
  return (
    <header id="top" className="masthead wrap">
      <div className="masthead-bar mono">
        <a className="signature" href="#top" aria-label="M. Sajid Durrani, top of page">
          <svg viewBox="0 0 34 34" aria-hidden="true">
            <rect width="34" height="34" fill="currentColor" />
            <path fill="var(--paper)" d="M6 24V10h4l4 6 4-6h4v14h-4v-8l-4 6-4-6v8z" />
            <path fill="var(--red)" d="M25 20h4v4h-4z" />
          </svg>
          <span>{identity.shortName}</span>
        </a>
        <span className="masthead-edition"><i className="registration" /> Independent portfolio</span>
        <nav aria-label="Main">
          <a href="#work">Work</a>
          <a href="#expertise">Expertise</a>
          <a href="#contact">Contact <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div className="cover">
        <div className="cover-index mono">
          <span>Full-stack engineering <span className="cover-dot">·</span> AI systems <span className="cover-dot">·</span> Interface craft</span>
          <span className="cover-year">ED. {identity.year}</span>
        </div>
        <h1 aria-label={'Portfolio of ' + identity.fullName}>PORTFOLIO<span aria-hidden="true">.</span></h1>
        <div className="cover-credit mono">
          <span><i className="registration" /> {identity.fullName}</span>
          <span>Full-Stack AI Engineer <b>/</b> UI/UX Architect</span>
        </div>
      </div>
    </header>
  )
}
