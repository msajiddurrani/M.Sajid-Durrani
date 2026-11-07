import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createProjectModel } from './projectModels'

gsap.registerPlugin(ScrollTrigger)

/** One viewport-sized renderer draws only the project scenes currently on screen. */
export function createProjectWorld(section:HTMLElement,canvas:HTMLCanvasElement) {
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'})
  if(!context)return null
  const renderer=new WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'})
  const pixelRatio=()=>Math.min(devicePixelRatio||1,innerWidth<700?1.1:1.35,Math.sqrt(2_400_000/(innerWidth*innerHeight)))
  renderer.setPixelRatio(pixelRatio())
  renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.35
  renderer.autoClear=false;renderer.setClearColor(0x000000,0)
  const entries=Array.from(section.querySelectorAll<HTMLElement>('[data-project-scene]')).map(element=>{
    const scene=new Scene(),camera=new PerspectiveCamera(32,1,.1,50)
    camera.position.set(4.4,2.5,8.8);camera.lookAt(0,0,0)
    scene.add(new AmbientLight(0xf2f0eb,1.5))
    const key=new DirectionalLight(0xffffff,3.1);key.position.set(-3,6,5);scene.add(key)
    const rim=new DirectionalLight(0xf2f0eb,1.8);rim.position.set(5,2,-3);scene.add(rim)
    const model=createProjectModel(element.dataset.projectScene!);scene.add(model.root)
    const state={assembly:1,turn:0,pointerX:0,pointerY:0}
    element.dataset.sceneReady='true'
    return {element,scene,camera,model,state,rect:element.getBoundingClientRect()}
  })
  let frame=0,visible=false,disposed=false,lost=false,dirty=true,rectDirty=true,lastPaint=0,lastScroll=0,width=innerWidth,height=innerHeight,activeScenes=0
  const motion=matchMedia('(prefers-reduced-motion: reduce)')
  const media=gsap.matchMedia(section)
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    entries.forEach(({element,state})=>{
      const row=element.closest<HTMLElement>('.project-chapter')!
      const timeline=gsap.timeline({scrollTrigger:{trigger:row,start:'top 96%',end:'bottom 8%',scrub:.2,invalidateOnRefresh:true,onUpdate:wake}})
      timeline.fromTo(state,{assembly:0,turn:-.38},{assembly:1,turn:.28,duration:1,ease:'none'},0)
      timeline.fromTo(row.querySelectorAll('.project-reveal'),{y:30,opacity:0},{y:0,opacity:1,stagger:.035,duration:.32,ease:'power2.out'},0)
    })
  })
  media.add('(prefers-reduced-motion: reduce)',()=>{
    entries.forEach(({state})=>{state.assembly=1;state.turn=0})
  })

  function updateRects(){entries.forEach(entry=>{entry.rect=entry.element.getBoundingClientRect()});rectDirty=false}
  function paint(now:number) {
    if(rectDirty)updateRects()
    renderer.setScissorTest(false);renderer.clear(true,true,true);renderer.setScissorTest(true)
    let count=0
    const t=motion.matches?0:now/1000
    for(const entry of entries){
      const {rect,model,state,camera,scene}=entry
      if(rect.bottom<72||rect.top>height||rect.right<0||rect.left>width||rect.width<1||rect.height<1)continue
      const assembly=motion.matches?1:Math.min(1,state.assembly/.52)
      model.parts.forEach(part=>part.node.position.lerpVectors(part.away,part.home,1-(1-assembly)**3))
      model.root.rotation.y=state.turn+Math.sin(t*.32)*.045+state.pointerX*.08
      model.root.rotation.x=Math.sin(t*.27)*.025-state.pointerY*.04
      model.root.position.y=Math.sin(t*.65)*.045
      model.update(t)
      camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()
      renderer.setViewport(rect.left,height-rect.bottom,rect.width,rect.height)
      renderer.setScissor(Math.max(0,rect.left),Math.max(0,height-rect.bottom),Math.min(width,rect.right)-Math.max(0,rect.left),Math.min(height,rect.bottom)-Math.max(72,rect.top))
      renderer.render(scene,camera);count++
    }
    activeScenes=count
    if(canvas.dataset.visibleScenes!==String(count))canvas.dataset.visibleScenes=String(count)
    const visibility=count?'visible':'hidden'
    if(canvas.style.visibility!==visibility)canvas.style.visibility=visibility
    lastPaint=now;dirty=false
  }
  function tick(now:number) {
    frame=0
    if(disposed||lost||!visible||document.hidden)return
    const interval=now-lastScroll<180?15:32
    if(dirty||!motion.matches&&now-lastPaint>=interval)paint(now)
    if(!motion.matches&&activeScenes>0||dirty)frame=requestAnimationFrame(tick)
    else canvas.dataset.running='false'
  }
  function wake(){
    dirty=true
    if(!frame&&visible&&!document.hidden&&!lost&&!disposed){canvas.dataset.running='true';frame=requestAnimationFrame(tick)}
  }
  function scroll(){rectDirty=true;lastScroll=performance.now();wake()}
  function layout(){rectDirty=true;ScrollTrigger.refresh();wake()}
  function resize(){
    width=innerWidth;height=innerHeight
    renderer.setPixelRatio(pixelRatio());renderer.setSize(width,height,false)
    rectDirty=true;wake()
  }
  function visibility(){
    if(!visible||document.hidden){cancelAnimationFrame(frame);frame=0;canvas.dataset.running='false';canvas.style.visibility='hidden'}else{rectDirty=true;wake()}
  }
  function pointer(event:PointerEvent){
    if(event.pointerType!=='mouse'||motion.matches)return
    for(const entry of entries){const r=entry.rect
      entry.state.pointerX=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom?(event.clientX-r.left)/r.width-.5:0
      entry.state.pointerY=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom?(event.clientY-r.top)/r.height-.5:0
    }
    wake()
  }
  function leave(){entries.forEach(({state})=>{state.pointerX=state.pointerY=0});wake()}
  function contextLost(event:Event){event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;canvas.dataset.running='false';section.dataset.world='fallback';canvas.style.visibility='hidden'}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility()})
  observer.observe(section)
  const resizeObserver=new ResizeObserver(()=>{rectDirty=true;wake()});resizeObserver.observe(section)
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize)
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',scroll)
  section.addEventListener('pointermove',pointer,{passive:true});section.addEventListener('pointerleave',leave)
  section.addEventListener('toggle',layout,true)
  canvas.addEventListener('webglcontextlost',contextLost)
  ScrollTrigger.addEventListener('refresh',scroll)
  section.dataset.world='webgl';resize()
  return {destroy(){
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();media.revert()
    window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize)
    document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',scroll)
    section.removeEventListener('pointermove',pointer);section.removeEventListener('pointerleave',leave)
    section.removeEventListener('toggle',layout,true)
    canvas.removeEventListener('webglcontextlost',contextLost);ScrollTrigger.removeEventListener('refresh',scroll)
    entries.forEach(({model,element})=>{model.dispose();delete element.dataset.sceneReady})
    renderer.dispose();renderer.forceContextLoss();delete section.dataset.world
  }}
}
