import { useRef } from 'react'
import { identity } from '../data/portfolio'
import { ScrollHeading } from './ui/ScrollHeading'
import { useEditorialScroll } from './ui/useEditorialScroll'
import { DisciplineObject } from './DisciplineObject'

const disciplines = [
  { id:'design', name:'Design', title:'Clarity, before everything.', copy:'I design responsive systems around how people read, navigate and act. Typography, spacing and interaction help make each interface easier to understand.', tools:'INTERFACES / TYPOGRAPHY / INTERACTION' },
  { id:'engineer', name:'Engineer', title:'From interface to infrastructure.', copy:'I build across the client, application layer and data model, with clear APIs and predictable behavior where those layers meet.', tools:'ARCHITECTURE / APIs / DELIVERY' },
  { id:'intelligence', name:'Intelligence', title:'Context becomes capability.', copy:'I connect language models to the right context using retrieval, embeddings and RAG, then test the workflow against the questions people actually ask.', tools:'RETRIEVAL / CONTEXT / EVALUATION' },
]

export function About() {
  const section=useRef<HTMLElement>(null)
  useEditorialScroll(section)
  return <section id="about" ref={section} className="about-editorial" aria-labelledby="about-title">
    <div className="wrap">
      <ScrollHeading id="about-title" first="ABOUT" second="ME." number="01" caption="The person behind the work" />
      <div className="about-story">
        <p className="about-manifesto" data-enter="-1">Designed with intent.<br/>Engineered to deliver.<br/><span>Intelligence, applied.</span></p>
        <div className="about-bio" data-enter="1">
          <p className="about-lead">I’m <strong>{identity.shortName}</strong>, a <strong>{identity.role}</strong> and co-founder of <strong>Zentrix Edge</strong>. I turn complex requirements into clear interfaces, dependable applications and practical AI workflows.</p>
          <p>My work connects design with implementation: React and Next.js interfaces, TypeScript and Python services, and retrieval-powered AI systems. From architecture and APIs to testing and delivery, I focus on software that is understandable, maintainable and useful.</p>
          <p className="mono about-location">{identity.location}</p>
          <div className="about-links mono">
            <a href="#work"><span className="strike-text">Selected work</span> ↗</a>
            <a href="#contact"><span className="strike-text">Get in touch</span> ↗</a>
          </div>
        </div>
      </div>
      <div className="discipline-grid">
        {disciplines.map(({id,name,title,copy,tools},index)=><article key={id} className={'craft-panel craft-'+id} data-enter={index===1?'0':index===0?'-1':'1'}>
          <div className="craft-meta mono"><span>0{index+1}</span><span>{name.toUpperCase()}</span><span aria-hidden="true">↗</span></div>
          <DisciplineObject id={id}/>
          <h3>{name}</h3><p className="craft-title">{title}</p><p className="craft-copy">{copy}</p>
          <p className="craft-tools mono">{tools}</p>
        </article>)}
      </div>
    </div>
  </section>
}
