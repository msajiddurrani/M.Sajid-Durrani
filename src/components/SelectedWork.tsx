import { useEffect, useRef } from 'react'
import { featuredProjects } from '../data/featuredProjects'
import { githubProfile, projectLinks } from '../data/projectLinks'
import { ScrollHeading } from './ui/ScrollHeading'
import type { createProjectWorld } from './work/projectWorld'

const gallery=featuredProjects
const sceneCaptions:Record<string,string>={savyora:'TRAINING / FACILITIES / MEMBERSHIP',vangaurd:'TRAINING / MACROS / ATHLETE WORKSPACE','sop-voice':'VOICE / INTENT / DEPARTMENT ROUTING','axiom-crm':'CONTACTS / DEALS / CUSTOMER WORKSPACE',creamy:'FLAVORS / CUSTOMIZER / SHOPPING BAG'}
const marks:Record<string,string>={savyora:'S',vangaurd:'V','sop-voice':'◉','axiom-crm':'A',creamy:'C'}
const ordinal=(n:number)=>String(n+1).padStart(2,'0')

export function SelectedWork() {
  const section=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const element=section.current!
    let disposed=false,loading=false,world:ReturnType<typeof createProjectWorld>=null
    async function load(){
      if(loading||disposed)return
      loading=true
      try{
        const [{createProjectWorld}]=await Promise.all([import('./work/projectWorld'),document.fonts.ready])
        if(disposed)return
        world=createProjectWorld(element,canvas.current!)
        if(!world)element.dataset.world='fallback'
      }catch{if(!disposed)element.dataset.world='fallback'}
    }
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){void load();observer.disconnect()}},{rootMargin:'400px'})
    observer.observe(element)
    return()=>{disposed=true;observer.disconnect();world?.destroy()}
  },[])

  return <section id="work" ref={section} className="work-gallery" data-world="loading" aria-labelledby="work-title">
    <div className="wrap">
      <ScrollHeading id="work-title" first="SELECTED" second="WORK." number="02" caption="Products, systems & experiences" />
      <p className="work-preface">Selected platforms in fitness, customer operations, AI workflows and digital commerce.</p>
    </div>
    <canvas ref={canvas} className="project-world" aria-hidden="true" />
    <div className="project-chapters">
      {gallery.map((project,index)=>{
        const destination=projectLinks[project.id]
        return <article id={'project-'+project.id} key={project.id} className={'project-chapter project-screen project-'+project.id} aria-labelledby={'title-'+project.id}>
          <div className="project-chapter-top mono"><span>{ordinal(index)} / {ordinal(gallery.length-1)}</span><span>{project.category}</span></div>
          <div className="project-chapter-body">
            <div className="project-copy">
              <h3 id={'title-'+project.id} className="project-reveal">{project.name}<span>.</span></h3>
              <p className="project-context project-reveal">{project.context}</p>
              <p className="project-note project-reveal">{project.architecture[0]}</p>
              <ul className="project-technologies mono project-reveal" aria-label="Project technologies">{project.stack.map(({tech})=><li key={tech}>{tech}</li>)}</ul>
              <div className="project-actions project-reveal">
                <a className="project-visit mono" href={destination?.github??githubProfile} target="_blank" rel="noreferrer" title={destination?.github?'View project repository':'Browse M. Sajid Durrani’s GitHub profile'}><span className="strike-text">Visit GitHub</span> ↗</a>
                {destination?.live?<a className="project-live mono" href={destination.live} target="_blank" rel="noreferrer">Live <span aria-hidden="true">↗</span></a>:<button className="project-live mono" type="button" disabled title="A verified public live URL has not been provided">Live <span className="live-unavailable">Unavailable</span></button>}
              </div>
              <details className="project-more"><summary className="mono">Architecture &amp; contribution</summary><ul>{project.architecture.map(note=><li key={note}>{note}</li>)}</ul></details>
            </div>
            <div className="project-scene-wrap">
              <div className="project-scene" data-project-scene={project.id} aria-hidden="true">
                <div className={'project-scene-fallback fallback-'+project.id}>
                  <div className="fallback-volume"><span>{marks[project.id]}</span><i/><i/><i/><i/><i/></div>
                  <div className="fallback-orbit"/><div className="fallback-orbit orbit-alt"/>
                </div>
              </div>
              <p className="project-scene-caption mono">{sceneCaptions[project.id]}<span aria-hidden="true">↗</span></p>
            </div>
          </div>
        </article>
      })}
    </div>
  </section>
}
