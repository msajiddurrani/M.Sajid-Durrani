import { contact, identity } from '../data/portfolio'

export function ContactFooter() {
  return (
    <footer id="contact" className="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="eyebrow"><span>06</span> / Get in touch</p>
        <div className="contact-grid">
          <h2 id="contact-title">HAVE SOMETHING<br />WORTH BUILDING<span className="red">?</span></h2>
          <p>I’m interested in collaborating on software products, retrieval-powered AI and interfaces that make complex work easier.</p>
        </div>
        <nav className="contact-links mono" aria-label="Contact and profiles">
          {contact.map(({ label, url }) => <a key={label} href={url}>{label}<span aria-hidden="true">↗</span></a>)}
        </nav>
        <div className="footer-line mono">
          <span>{identity.fullName} / {identity.year}</span>
          <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  )
}
