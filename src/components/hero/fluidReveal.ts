import gsap from 'gsap'
import { vertexSource, fragmentSource } from './fluidShader'
import { createHeadlineFluid } from './headlineFluid'

type Point={x:number;y:number}
export type FluidReveal = {
  setScrollProgress:(progress:number)=>void
  syncPointer:()=>void
  setKeyboard:(active:boolean)=>void
  destroy:()=>void
}
export const fluidSettings={ entranceSeconds:1.8, stablePaintSeconds:.16, pointerDamping:11, pixelRatio:1.4, spreadIn:3.6, spreadOut:2.8, hoverRadius:84, touchRadius:52 }

/** Both textures occupy the original portrait frame. Only their spatial mask and boundary UVs move. */
export function createFluidReveal(frame:HTMLButtonElement, silhouette:string, scrollProgress:number, onContextLost?:()=>void):FluidReveal|null {
  const hero=frame.closest<HTMLElement>('.hero')!
  const portrait=frame.closest<HTMLElement>('.portrait')!
  const composite=frame.querySelector<HTMLElement>('.portrait-composite')!
  const canvas=document.createElement('canvas')
  canvas.className='portrait-fluid';canvas.setAttribute('aria-hidden','true')
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,powerPreference:'low-power'})
  if(!gl)return null
  const shaders:WebGLShader[]=[]
  function compile(type:number,source:string){
    const shader=gl!.createShader(type)!
    gl!.shaderSource(shader,source);gl!.compileShader(shader)
    if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)){const message=gl!.getShaderInfoLog(shader);gl!.deleteShader(shader);throw new Error(message??'Hero shader compilation failed')}
    shaders.push(shader);return shader
  }
  const program=gl.createProgram()!
  try {
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource))
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource))
    gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Hero shader link failed')
  }catch{
    for(const shader of shaders)gl.deleteShader(shader)
    gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();return null
  }
  gl.useProgram(program)
  const buffer=gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
  const position=gl.getAttribLocation(program,'aPosition')
  gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0)
  const uniforms=Object.fromEntries(['uTime','uProgress','uPointer','uCursor','uRadius','uVelocity','uHover','uSpread','uOrigin','uResolution','uImpulses[0]'].map(name=>[name,gl.getUniformLocation(program,name)]))
  const images=Array.from(frame.querySelectorAll('img'))
  const base=images.find(image=>image.parentElement!.classList.contains('portrait-top'))!
  const face=images.find(image=>image.parentElement!.classList.contains('portrait-bottom'))!
  const textures:WebGLTexture[]=[]
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true)
  for(const [index,image] of [base,face].entries()){
    const source=document.createElement('canvas')
    source.width=base.naturalWidth;source.height=base.naturalHeight
    const ctx=source.getContext('2d')!
    if(index===0){
      ctx.scale(source.width,source.height);ctx.clip(new Path2D(silhouette));ctx.setTransform(1,0,0,1,0,0)
      ctx.drawImage(image,0,0,source.width,source.height)
    }else{
      const style=getComputedStyle(frame)
      const scale=parseFloat(style.getPropertyValue('--image2-scale'))
      const x=parseFloat(style.getPropertyValue('--image2-x'))/100
      const y=parseFloat(style.getPropertyValue('--image2-y'))/100
      const height=source.width*image.naturalHeight/image.naturalWidth
      ctx.drawImage(image,source.width*((1-scale)/2+x),height*y,source.width*scale,height*scale)
    }
    const texture=gl.createTexture()!
    textures.push(texture);gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source)
    gl.uniform1i(gl.getUniformLocation(program,index===0?'uBaseTexture':'uRevealTexture'),index)
  }

  const headlines=createHeadlineFluid(hero)
  const origin=performance.now()/1000
  const pointer={x:.5,y:.5},target={...pointer},velocity={x:0,y:0}
  const impulses=new Float32Array(16)
  for(let i=0;i<4;i++)impulses[i*4+2]=-10
  const drive={progress:0}
  let scroll=scrollProgress, scrollOwned=scrollProgress>.002
  let progress=scrollOwned?scroll:0,hover=0,spread=0,tapUntil=0, keyboard=false, subject=false
  let point:Point|null=null,visible=true,running=false,disposed=false,lost=false,last=performance.now(),lastPaint=0
  let impulseIndex=0,lastImpulse=-10,deadline=0
  let intro:gsap.core.Timeline|null=null
  const motion=matchMedia('(prefers-reduced-motion: reduce)')
  let entrancePending=!scrollOwned&&!motion.matches

  function time(){return performance.now()/1000-origin}
  function wake(){
    if(disposed||lost||motion.matches||!visible||document.hidden)return
    if(!running){running=true;last=performance.now();gsap.ticker.add(tick)}
    canvas.dataset.running='true'
  }
  function sleep(){gsap.ticker.remove(tick);running=false;canvas.dataset.running='false'}
  function impulse(x:number,y:number,strength:number){
    const now=time()
    if(now-lastImpulse<.095)return
    impulses.set([x,y,now,strength],impulseIndex*4);impulseIndex=(impulseIndex+1)%4
    lastImpulse=now;deadline=performance.now()+2200;wake()
  }
  function syncPointer(){
    if(!point){subject=false;return}
    const rect=frame.getBoundingClientRect()
    const x=(point.x-rect.left)/rect.width,y=(point.y-rect.top)/rect.height
    subject=x>=0&&x<=1&&y>=0&&y<=1
    if(subject){target.x=x;target.y=y}
  }
  function paint(){
    if(lost||disposed)return
    gl!.useProgram(program)
    gl!.uniform1f(uniforms.uTime,time())
    gl!.uniform1f(uniforms.uProgress,progress)
    gl!.uniform2f(uniforms.uPointer,pointer.x,pointer.y)
    gl!.uniform2f(uniforms.uCursor,target.x,target.y)
    const bounds=frame.getBoundingClientRect()
    const radius=Math.min(innerWidth<680?fluidSettings.touchRadius:fluidSettings.hoverRadius,bounds.width*.26)
    gl!.uniform2f(uniforms.uRadius,radius/Math.max(1,bounds.width),radius/Math.max(1,bounds.height))
    gl!.uniform2f(uniforms.uVelocity,velocity.x,velocity.y)
    gl!.uniform1f(uniforms.uHover,hover)
    gl!.uniform1f(uniforms.uSpread,spread)
    gl!.uniform2f(uniforms.uOrigin,pointer.x,pointer.y)
    gl!.uniform2f(uniforms.uResolution,canvas.width,canvas.height)
    gl!.uniform4fv(uniforms['uImpulses[0]'],impulses)
    gl!.drawArrays(gl!.TRIANGLES,0,6)
    canvas.dataset.progress=progress.toFixed(4)
    canvas.dataset.hover=hover.toFixed(4)
    canvas.dataset.spread=spread.toFixed(4)
  }
  function tick(){
    const now=performance.now(),dt=Math.min(.06,(now-last)/1000)
    last=now
    syncPointer()
    const previous={...pointer},ease=1-Math.exp(-dt*fluidSettings.pointerDamping)
    if(keyboard){target.x=.5;target.y=.51}
    pointer.x+=(target.x-pointer.x)*ease;pointer.y+=(target.y-pointer.y)*ease
    velocity.x+=(Math.max(-.7,Math.min(.7,(pointer.x-previous.x)/Math.max(dt,.001)))-velocity.x)*ease
    velocity.y+=(Math.max(-.7,Math.min(.7,(pointer.y-previous.y)/Math.max(dt,.001)))-velocity.y)*ease
    hover+=((subject||keyboard?1:0)-hover)*ease
    const wet=subject||keyboard||now<tapUntil
    spread+=((wet?1:0)-spread)*(1-Math.exp(-dt*(wet?fluidSettings.spreadIn:fluidSettings.spreadOut)))
    if(spread>.999)spread=1
    if(spread<.0001)spread=0
    const desired=scrollOwned?scroll:drive.progress
    progress+=(desired-progress)*(1-Math.exp(-dt*14))
    if(Math.abs(desired-progress)<.0001)progress=desired
    const type=headlines.update(point,time(),dt)
    if(type.active && !subject && point){
      const rect=frame.getBoundingClientRect()
      impulse(Math.max(.1,Math.min(.9,(point.x-rect.left)/rect.width)),.28,.18)
    }
    if(now-lastPaint>=(innerWidth<680?31:15.3)){paint();lastPaint=now}
    const unsettled=Math.abs(desired-progress)>.0001 || Math.abs(hover-(subject||keyboard?1:0))>.001 || Math.abs(spread-(wet?1:0))>.0001
      || Math.hypot(velocity.x,velocity.y)>.001 || type.unsettled
    if(!entrancePending&&!intro?.isActive()&&!type.active&&!unsettled&&now>deadline){
      hover=subject||keyboard?1:0;velocity.x=0;velocity.y=0;paint();sleep()
      portrait.dataset.fluidState=scrollOwned?'scroll':'settled'
    }
  }
  function resize(){
    if(lost||disposed)return
    const dpr=Math.min(devicePixelRatio||1,innerWidth<680?1.25:fluidSettings.pixelRatio)
    canvas.width=Math.max(1,Math.round(frame.offsetWidth*dpr))
    canvas.height=Math.max(1,Math.round(frame.offsetHeight*dpr))
    gl!.viewport(0,0,canvas.width,canvas.height)
    headlines.measure();paint();wake()
  }
  function track(event:PointerEvent){
    if(event.pointerType==='touch')return
    point={x:event.clientX,y:event.clientY};syncPointer()
    if(subject)impulse(target.x,target.y,.72)
    wake()
  }
  function leave(){point=null;subject=false;wake()}
  function tap(event:PointerEvent){
    if(event.pointerType!=='touch')return
    const rect=frame.getBoundingClientRect()
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)return
    target.x=pointer.x=(event.clientX-rect.left)/rect.width
    target.y=pointer.y=(event.clientY-rect.top)/rect.height
    tapUntil=performance.now()+650
    impulse(target.x,target.y,.8)
  }
  function synchronize(){
    if(lost||disposed)return
    if(motion.matches){
      entrancePending=false;intro?.kill();drive.progress=scroll;progress=scroll;keyboard=false;point=null;subject=false
      hover=0;spread=0;impulses.fill(0);headlines.update(null,time(),1);sleep();paint()
      portrait.dataset.fluid='reduced';portrait.dataset.fluidState='static'
    }else{
      portrait.dataset.fluid='webgl'
      if(visible&&!document.hidden){intro?.resume();wake()}else{intro?.pause();sleep()}
    }
  }
  function contextLost(event:Event){
    event.preventDefault();lost=true;intro?.kill();sleep()
    delete portrait.dataset.fluid;portrait.dataset.fluidState='fallback'
    headlines.destroy();canvas.style.display='none'
    onContextLost?.()
  }
  const observer=new ResizeObserver(resize)
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;synchronize()})
  observer.observe(frame);observer.observe(hero);intersection.observe(hero)
  window.addEventListener('resize',resize,{passive:true})
  hero.addEventListener('pointermove',track,{passive:true})
  hero.addEventListener('pointerleave',leave)
  hero.addEventListener('pointerdown',tap,{passive:true})
  document.addEventListener('visibilitychange',synchronize)
  motion.addEventListener('change',synchronize)
  canvas.addEventListener('webglcontextlost',contextLost)
  composite.append(canvas)
  portrait.dataset.fluid='webgl';portrait.dataset.fluidState='loading'
  resize()
  if(!scrollOwned&&!motion.matches){
    intro=gsap.timeline({delay:fluidSettings.stablePaintSeconds,
      onStart:()=>{portrait.dataset.fluidState='entrance';wake()},
      onUpdate:wake,onComplete:()=>{entrancePending=false;portrait.dataset.fluidState='settling';wake()}})
      .to(drive,{progress:.42,duration:fluidSettings.entranceSeconds*.45,ease:'sine.inOut'})
      .to(drive,{progress:0,duration:fluidSettings.entranceSeconds*.55,ease:'sine.inOut'})
  }else{drive.progress=scroll;progress=scroll}
  synchronize()

  return {
    setScrollProgress(value){
      scroll=Math.max(0,Math.min(1,value))
      if(scroll>.002&&!scrollOwned){scrollOwned=true;entrancePending=false;intro?.kill();intro=null;portrait.dataset.fluidState='scroll'}
      if(motion.matches){progress=scroll;paint()}else wake()
    },
    syncPointer,
    setKeyboard(active){keyboard=active;if(active)impulse(.5,.51,.35);wake()},
    destroy(){
      disposed=true;intro?.kill();sleep();observer.disconnect();intersection.disconnect()
      window.removeEventListener('resize',resize)
      hero.removeEventListener('pointermove',track);hero.removeEventListener('pointerleave',leave);hero.removeEventListener('pointerdown',tap)
      document.removeEventListener('visibilitychange',synchronize);motion.removeEventListener('change',synchronize)
      canvas.removeEventListener('webglcontextlost',contextLost)
      if(!lost)headlines.destroy()
      for(const texture of textures)gl!.deleteTexture(texture)
      gl!.deleteBuffer(buffer);for(const shader of shaders)gl!.deleteShader(shader);gl!.deleteProgram(program)
      gl!.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove();delete portrait.dataset.fluid;delete portrait.dataset.fluidState
    },
  }
}
