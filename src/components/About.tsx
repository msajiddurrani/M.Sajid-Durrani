import { identity } from '../data/portfolio'

export function About() {
  return (
    <section id="about" className="about wrap" aria-labelledby="about-title">
      <div className="about-heading">
        <p className="eyebrow"><span>01</span> / Introduction</p>
        <h2 id="about-title">HELLO<span className="red">.</span></h2>
      </div>
      <div className="about-copy">
        <p className="about-lead">I build the system<br />{' '}and the experience.</p>
        <p>I’m {identity.fullName}, a {identity.role} based in Peshawar. I build software products, retrieval-powered AI experiences and interfaces shaped by how people use them.</p>
        <p>As a co-founder at Zentrix Edge, I work across product architecture, implementation and delivery.</p>
      </div>
      <aside className="snapshot" aria-label="Technical snapshot">
        <p className="eyebrow"><i className="registration" /> What I build</p>
        <ol className="mono">
          <li><span>01</span> Full-stack SaaS</li>
          <li><span>02</span> Retrieval-powered AI</li>
          <li><span>03</span> Interactive interfaces</li>
        </ol>
        <p className="snapshot-location mono">{identity.location}</p>
      </aside>
    </section>
  )
}
