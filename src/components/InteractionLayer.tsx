import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const magneticSelector='.project-actions a, .closing-cta, .about-links a, .closing-column a, .closing-bottom a, .masthead-nav a, .menu-toggle, .stack-filters button'
const interactiveSelector='a, button, summary, input, textarea, select, [role="button"]'

/** One event-driven cursor; no render loop or React state updates per pointer move. */
export function InteractionLayer() {
  const cursor=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const element=cursor.current!, root=document.documentElement
    const media=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    const x=gsap.quickSetter(element,'x','px')
    const y=gsap.quickSetter(element,'y','px')
    let active:HTMLElement|null=null,visible=false
    function resetMagnet() {
      active?.style.removeProperty('--pointer-x')
      active?.style.removeProperty('--pointer-y')
      active=null
    }
    function hide() {
      visible=false; element.dataset.visible='false'
      delete root.dataset.customCursor
      resetMagnet()
    }
    function move(event:PointerEvent) {
      if(!media.matches||event.pointerType!=='mouse') {hide();return}
      if(!visible) {
        gsap.set(element,{x:event.clientX,y:event.clientY})
        visible=true; element.dataset.visible='true'; root.dataset.customCursor='true'
      }
      x(event.clientX);y(event.clientY)
      const target=event.target instanceof Element?event.target:null
      element.dataset.interactive=String(Boolean(target?.closest(interactiveSelector)))
      const button=target?.closest<HTMLElement>(magneticSelector)??null
      if(button!==active) {resetMagnet();active=button}
      if(active) {
        active.classList.add('magnetic-target')
        const rect=active.getBoundingClientRect()
        active.style.setProperty('--pointer-x',Math.max(-7,Math.min(7,(event.clientX-rect.left-rect.width/2)*.12))+'px')
        active.style.setProperty('--pointer-y',Math.max(-5,Math.min(5,(event.clientY-rect.top-rect.height/2)*.16))+'px')
      }
    }
    function key(event:KeyboardEvent) {if(event.key==='Tab')hide()}
    document.addEventListener('pointermove',move,{passive:true})
    document.addEventListener('pointerleave',hide)
    document.addEventListener('keydown',key)
    document.addEventListener('visibilitychange',hide)
    window.addEventListener('blur',hide)
    window.addEventListener('scroll',resetMagnet,{passive:true})
    media.addEventListener('change',hide)
    return()=>{
      hide()
      document.querySelectorAll('.magnetic-target').forEach(node=>node.classList.remove('magnetic-target'))
      document.removeEventListener('pointermove',move)
      document.removeEventListener('pointerleave',hide)
      document.removeEventListener('keydown',key)
      document.removeEventListener('visibilitychange',hide)
      window.removeEventListener('blur',hide)
      window.removeEventListener('scroll',resetMagnet)
      media.removeEventListener('change',hide)
    }
  },[])
  return <div ref={cursor} className="custom-cursor" data-visible="false" aria-hidden="true"><span/></div>
}
