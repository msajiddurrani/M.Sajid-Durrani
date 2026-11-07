import gsap from 'gsap'
import type { FluidReveal } from './fluidReveal'

const clamp=(x:number)=>Math.min(1,Math.max(0,x))
const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
function noise(x:number,y:number){
  const ix=Math.floor(x),iy=Math.floor(y)
  let fx=x-ix,fy=y-iy
  fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy)
  const a=hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx
  const b=hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx
  return a*(1-fy)+b*fy
}
const fbm=(x:number,y:number)=>noise(x,y)*.58+noise(x*2.03+4.7,y*2.03+4.7)*.28+noise(x*4.11-2.1,y*4.11-2.1)*.14
const flow=(x:number,y:number)=>({x:x+(fbm(x*3.2+2.7,y*3.2)-.5)*.34,y:y+(fbm(x*3.2+8.1,y*3.2)-.5)*.34})

/** The same spreading interaction remains available when the browser has no WebGL context. */
export function createSvgFluidSpread(frame:HTMLButtonElement):FluidReveal {
  const portrait=frame.closest<HTMLElement>('.portrait')!
  const hero=frame.closest<HTMLElement>('.hero')!
  const top=frame.querySelector<HTMLElement>('.portrait-top')!
  const bottom=frame.querySelector<HTMLElement>('.portrait-bottom')!
  const canvas=document.createElement('canvas')
  const width=96,height=120
  canvas.width=width;canvas.height=height
  const ctx=canvas.getContext('2d')!,image=ctx.createImageData(width,height)
  const cells=new Float32Array(width*height*3),arrival=new Float32Array(width*height)
  const previous=[top.style.maskImage,top.style.maskComposite,bottom.style.maskImage,bottom.style.maskComposite,top.style.maskSize,top.style.maskRepeat,bottom.style.maskSize,bottom.style.maskRepeat]
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x,p=flow(x/(width-1),y/(height-1))
    const channels=Math.sin(p.y*15+p.x*7+fbm(p.x*4,p.y*4)*5)
    const branches=Math.sin(p.x*13-p.y*8+noise(p.x*3.7+6,p.y*3.7+6)*4)
    cells.set([p.x,p.y,.85+noise(p.x*5.1,p.y*5.1)*.42+channels*.2+branches*.13],i*3)
    image.data.set([255,255,255,0],i*4)
  }
  let spread=0,inside=false,keyboard=false,visible=true,running=false,disposed=false,last=0,tapUntil=0,lastPaint=0
  let point:{x:number;y:number}|null=null
  let cursor={x:.5,y:.5}
  function seed(x:number,y:number){
    if(Math.hypot(cursor.x-x,cursor.y-y)<.0001&&arrival[0]!==0)return
    cursor={x,y}
    const origin=flow(x,y)
    for(let i=0;i<arrival.length;i++)arrival[i]=Math.min(1.02,Math.max(.008,Math.hypot((cells[i*3]-origin.x)*.9,(cells[i*3+1]-origin.y)*1.05)*cells[i*3+2]))
  }
  seed(.5,.5)
  function paint(){
    const front=spread*1.12-.035
    const bounds=frame.getBoundingClientRect()
    const radius=Math.min(innerWidth<680?52:84,bounds.width*.26)
    const rx=radius/Math.max(1,bounds.width),ry=radius/Math.max(1,bounds.height)
    const time=performance.now()/1000
    for(let i=0;i<arrival.length;i++){
      const phase=clamp((front-arrival[i]+.018)/.036)
      const dx=((i%width)/(width-1)-cursor.x)/rx,dy=(Math.floor(i/width)/(height-1)-cursor.y)/ry
      const angle=Math.atan2(dy,dx+.00001)
      const edge=.82+.11*Math.sin(angle*3+time*1.1)+.075*Math.sin(angle*5-time*1.4)+.025*Math.sin(angle*7+time*.9)
      const local=clamp((Math.hypot(dx,dy)-(edge-.1))/(Math.min(.98,edge+.055)-(edge-.1)))
      const locality=1-local*local*(3-2*local)
      image.data[i*4+3]=Math.round(255*phase*phase*(3-2*phase)*locality)
    }
    ctx.putImageData(image,0,0)
    const mask='url("'+canvas.toDataURL()+'")'
    top.style.maskImage='url(#hero-helmet), '+mask
    top.style.maskComposite='subtract'
    bottom.style.maskImage='url(#hero-face), '+mask
    bottom.style.maskComposite='add'
    frame.dataset.waterSpread=spread.toFixed(4)
  }
  function stop(){gsap.ticker.remove(tick);running=false}
  function wake(){
    if(disposed||running||!visible||document.hidden)return
    running=true;last=performance.now();gsap.ticker.add(tick)
  }
  function syncPointer(){
    if(!point){inside=false;return}
    const box=frame.getBoundingClientRect(),x=(point.x-box.left)/box.width,y=(point.y-box.top)/box.height
    inside=x>=0&&x<=1&&y>=0&&y<=1
    if(inside)seed(x,y)
  }
  function tick(){
    const now=performance.now(),dt=Math.min(.06,(now-last)/1000);last=now
    syncPointer()
    const wet=inside||keyboard||now<tapUntil
    spread+=((wet?1:0)-spread)*(1-Math.exp(-dt*(wet?3.6:2.8)))
    if(spread>.999)spread=1
    if(spread<.0001)spread=0
    if(now-lastPaint>=31||spread===0||spread===1){paint();lastPaint=now}
    if(Math.abs(spread-(wet?1:0))<.0001)stop()
  }
  function move(event:PointerEvent){if(event.pointerType==='touch')return;point={x:event.clientX,y:event.clientY};syncPointer();wake()}
  function leave(){point=null;inside=false;wake()}
  function tap(event:PointerEvent){
    if(event.pointerType!=='touch')return
    const box=frame.getBoundingClientRect(),x=(event.clientX-box.left)/box.width,y=(event.clientY-box.top)/box.height
    if(x<0||x>1||y<0||y>1)return
    seed(x,y);tapUntil=performance.now()+650;wake()
  }
  function visibility(){if(document.hidden||!visible)stop();else wake()}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility()})
  observer.observe(hero)
  hero.addEventListener('pointermove',move,{passive:true})
  hero.addEventListener('pointerleave',leave)
  hero.addEventListener('pointerdown',tap,{passive:true})
  document.addEventListener('visibilitychange',visibility)
  portrait.dataset.fluid='svg';portrait.dataset.fluidState='fallback'
  top.style.maskSize=bottom.style.maskSize='100% 100%'
  top.style.maskRepeat=bottom.style.maskRepeat='no-repeat'
  paint()
  return{
    syncPointer,
    setScrollProgress(){syncPointer();wake()},
    setKeyboard(active){keyboard=active;if(active)seed(.5,.51);wake()},
    destroy(){
      disposed=true;stop();observer.disconnect()
      hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);hero.removeEventListener('pointerdown',tap)
      document.removeEventListener('visibilitychange',visibility)
      top.style.maskImage=previous[0];top.style.maskComposite=previous[1];bottom.style.maskImage=previous[2];bottom.style.maskComposite=previous[3]
      top.style.maskSize=previous[4];top.style.maskRepeat=previous[5];bottom.style.maskSize=previous[6];bottom.style.maskRepeat=previous[7]
      delete frame.dataset.waterSpread;delete portrait.dataset.fluid;delete portrait.dataset.fluidState
    },
  }
}
