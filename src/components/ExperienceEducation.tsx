import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { education, experience } from '../data/portfolio'
import { ScrollHeading } from './ui/ScrollHeading'

gsap.registerPlugin(ScrollTrigger)
const practices=[['ZE','Agency & product delivery'],['SM','Full-stack & applied AI'],['SF','Testing & governance']]

export function ExperienceEducation() {
  const section=useRef<HTMLElement>(null)
  useLayoutEffect(()=>{
    const element=section.current!
    const media=gsap.matchMedia(element)
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      element.querySelectorAll<HTMLElement>('.record-entry').forEach((entry,index)=>{
        const timeline=gsap.timeline({scrollTrigger:{trigger:entry,start:'top 94%',end:'top 61%',scrub:.22,invalidateOnRefresh:true}})
        timeline.fromTo(entry,{y:40,x:index%2?24:-24,rotation:index%2?1.4:-1.4,opacity:0},{y:0,x:0,rotation:0,opacity:1,duration:1,ease:'power2.out'})
        timeline.fromTo(entry.querySelector('.record-entry-rule'),{scaleX:0},{scaleX:1,duration:.65,ease:'none'},.25)
      })
      gsap.fromTo('.record-route-fill',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.record-experience',start:'top 75%',end:'bottom 45%',scrub:.2,invalidateOnRefresh:true}})
    })
    return()=>media.revert()
  },[])
  return <section id="experience" ref={section} className="record wrap" aria-labelledby="record-title">
    <ScrollHeading id="record-title" first="THE" second="RECORD." number="04" caption="Experience & education" />
    <p className="record-caption">The work, the practice, and the learning behind it.</p>
    <div className="record-dossier">
      <section className="record-experience" aria-labelledby="experience-title">
        <div className="record-section-heading"><p className="mono">01 / IN PRACTICE</p><h3 id="experience-title">Experience<span>.</span></h3></div>
        <div className="record-route" aria-hidden="true"><span className="record-route-fill"/></div>
        <ol className="record-list career-list">
          {experience.map(({name,role,description},index)=><li key={name} className="record-entry career-entry">
            <div className="career-entry-top"><span className="career-stamp mono" aria-hidden="true">{practices[index][0]}</span><span className="mono">{practices[index][1]}</span><span className="record-number mono">0{index+1}</span></div>
            <h4 className="record-company">{name}</h4>
            <p className="record-role">{role}</p>
            <p className="record-description">{description}</p>
            <span className="record-entry-rule" aria-hidden="true"/>
          </li>)}
        </ol>
      </section>
      <section className="record-education" aria-labelledby="education-title">
        <div className="record-section-heading"><p className="mono">02 / FOUNDATIONS</p><h3 id="education-title">Education<span>.</span></h3></div>
        <ol className="record-list study-list">
          {education.map(({course,institution},index)=><li key={course} className="record-entry study-card">
            <div className="study-tab mono">LEARNING / 0{index+1}</div>
            <div className="study-card-top"><span className="study-seal" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="m4 15 16-8 16 8-16 8Zm7 5v10c5 4 13 4 18 0V20M36 15v14"/></svg></span><span className="mono record-number">0{index+1}</span></div>
            <h4>{course}</h4><p className="study-institution">{institution}</p>
            <div className="study-bottom mono"><span>{index===0?'APPLIED DEVELOPMENT':'ACADEMIC FOUNDATION'}</span><span aria-hidden="true">↗</span></div>
            <span className="record-entry-rule" aria-hidden="true"/>
          </li>)}
        </ol>
      </section>
    </div>
  </section>
}
