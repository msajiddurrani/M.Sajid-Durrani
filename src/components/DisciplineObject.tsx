import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './discipline-objects.css'

function Solid({ className = '', children }: { className?: string; children?: ReactNode }) {
  return <div className={'object-solid ' + className}>
    <div className="solid-face solid-front">{children}</div>
    {['back', 'left', 'right', 'top', 'bottom'].map(face => <div key={face} className={'solid-face solid-' + face} />)}
  </div>
}

export function DisciplineObject({ id }: { id: string }) {
  const object = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = object.current!
    let visible = false
    const update = () => { element.dataset.live = String(visible && !document.hidden) }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() }, { threshold: .12 })
    observer.observe(element)
    document.addEventListener('visibilitychange', update)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])

  return <div ref={object} className={'discipline-object object-' + id} data-live="false" aria-hidden="true">
    <div className="object-ground" />
    <div className="object-camera">
      {id === 'design' ? <div className="design-volume object-float">
        {[0, 1, 2].map(layer => <div key={layer} className="interface-plane" style={{ '--layer': layer } as CSSProperties}>
          <div className="interface-toolbar"><i /><i /><i /><span /></div>
          <div className="interface-layout"><div><b /><b /><b /><em /></div><span /></div>
          <div className="interface-baseline" />
        </div>)}
        <div className="design-cursor"><svg viewBox="0 0 32 40"><path d="M2 2v31l8-9 6 13 6-3-6-12h12Z" /></svg></div>
      </div> : id === 'engineer' ? <div className="engineer-volume object-float">
        <div className="service-link service-link-one" /><div className="service-link service-link-two" />
        {[0, 1, 2].map(index => <Solid key={index} className={'service-block service-block-' + index}>
          <div className="server-code">{index === 0 ? '</>' : index === 1 ? '{ }' : '|||'}<span /></div>
          <div className="server-slots"><i /><i /><i /></div>
        </Solid>)}
      </div> : <div className="intelligence-volume object-float">
        <div className="neural-orbit orbit-one"><i /><i /></div>
        <div className="neural-orbit orbit-two"><i /><i /></div>
        <div className="neural-orbit orbit-three"><i /><i /></div>
        <Solid className="intelligence-chip"><div className="chip-core"><span /><span /><span /><span /></div></Solid>
        <div className="chip-pins pins-x" /><div className="chip-pins pins-y" />
      </div>}
    </div>
  </div>
}
