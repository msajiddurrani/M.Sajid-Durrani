import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

async function settle(page:Page) {
  await expect(page.locator('.portrait')).toHaveAttribute('data-fluid','webgl',{timeout:15000})
  await expect(page.locator('.portrait')).toHaveAttribute('data-fluid-state','settled',{timeout:10000})
  await expect(page.locator('.portrait-fluid')).toHaveAttribute('data-running','false')
}
async function progress(page:Page,value:number) {
  const distance=await page.locator('.pin-spacer:has(> .hero)').evaluate(e=>parseFloat(getComputedStyle(e).paddingBottom))
  await page.evaluate(y=>scrollTo(0,y),value*distance)
}

test('asset-ready water entrance returns to the original VR landing portrait and stops rendering',async({page})=>{
  await page.addInitScript(()=>{
    type Sample={p:number;red:number;skin:number;time:number}
    const state=window as typeof window & {fluidSamples:Sample[]}
    state.fluidSamples=[]
    const draw=WebGLRenderingContext.prototype.drawArrays
    WebGLRenderingContext.prototype.drawArrays=function(mode,first,count){
      draw.call(this,mode,first,count)
      const canvas=this.canvas as HTMLCanvasElement
      if(!canvas.classList?.contains('portrait-fluid'))return
      const now=performance.now()
      if(now-(state.fluidSamples.at(-1)?.time??-100)<70)return
      const program=this.getParameter(this.CURRENT_PROGRAM) as WebGLProgram
      const p=this.getUniform(program,this.getUniformLocation(program,'uProgress')!) as number
      const pixels=new Uint8Array(64*96*4)
      this.readPixels(Math.round(canvas.width*.5)-32,Math.round(canvas.height*.5)-48,64,96,this.RGBA,this.UNSIGNED_BYTE,pixels)
      let red=0,skin=0
      for(let i=0;i<pixels.length;i+=4){
        const r=pixels[i],g=pixels[i+1],b=pixels[i+2]
        if(r>85&&r>g*1.7&&r>b*1.4)red++
        if(r>100&&g>65&&r>g*1.08&&g>b*1.05&&r<g*1.65)skin++
      }
      state.fluidSamples.push({p,red,skin,time:now})
    }
  })
  const errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/')
  await settle(page)
  expect(await page.evaluate(()=>scrollY)).toBe(0)
  const samples=await page.evaluate(()=>(window as typeof window & {fluidSamples:{p:number;red:number;skin:number;time:number}[]}).fluidSamples)
  expect(samples.length).toBeGreaterThan(12)
  expect(samples[0].p).toBeLessThan(.02)
  expect(samples.at(-1)!.p).toBeLessThan(.001)
  expect(Math.max(...samples.map(frame=>frame.p))).toBeGreaterThan(.2)
  expect(samples.some(frame=>frame.p>.12&&frame.p<.85&&frame.red>25&&frame.skin>25)).toBe(true)
  const end=await page.locator('.portrait-fluid').getAttribute('data-progress')
  await page.waitForTimeout(200)
  expect(await page.locator('.portrait-fluid').getAttribute('data-progress')).toBe(end)
  expect(errors).toEqual([])
})

test('pointer inertia, keyboard activation, exit decay and original scrolling cooperate',async({page})=>{
  await page.goto('/')
  await settle(page)
  const frame=page.locator('.portrait-frame'),canvas=page.locator('.portrait-fluid')
  const box=(await frame.boundingBox())!
  await page.mouse.move(box.x+box.width*.45,box.y+box.height*.48)
  await expect.poll(()=>canvas.getAttribute('data-hover').then(Number)).toBeGreaterThan(.8)
  for(const [x,y] of [[.6,.55],[.35,.42],[.68,.6],[.5,.5]])await page.mouse.move(box.x+box.width*x,box.y+box.height*y,{steps:3})
  await progress(page,.5)
  await expect.poll(()=>canvas.getAttribute('data-progress').then(Number)).toBeCloseTo(.5,2)
  await page.mouse.move(1,1)
  await expect(canvas).toHaveAttribute('data-running','false',{timeout:6000})
  await expect.poll(()=>canvas.getAttribute('data-hover').then(Number)).toBeLessThan(.002)
  await frame.focus();await page.keyboard.press('Enter')
  await expect(frame).toHaveAttribute('aria-pressed','true')
  await expect.poll(()=>canvas.getAttribute('data-hover').then(Number)).toBeGreaterThan(.8)
  await page.keyboard.press('Escape')
  await expect(frame).toHaveAttribute('aria-pressed','false')
  await progress(page,1)
  await expect.poll(()=>canvas.getAttribute('data-progress').then(Number)).toBe(1)
  await progress(page,0)
  await expect.poll(()=>canvas.getAttribute('data-progress').then(Number)).toBe(0)
})

test('headline glyphs move locally, preserve typography geometry and return to rest',async({page})=>{
  await page.goto('/')
  await progress(page,1)
  await expect(page.locator('.portrait')).toHaveAttribute('data-fluid','webgl')
  const line=page.locator('.hero-roles > .hero-role-mask > .hero-role-primary')
  await expect.poll(()=>line.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m42)).toBe(0)
  const source=line.locator('.hero-type-source')
  await expect(source).toHaveText('FULL-STACK DEVELOPER')
  const before=await source.boundingBox()
  const box=(await line.boundingBox())!
  await page.mouse.move(box.x+box.width*.28,box.y+box.height*.55)
  await expect.poll(()=>line.locator('.hero-type-glyph[style*="translate"]').count()).toBeGreaterThan(2)
  const moving=await line.locator('.hero-type-glyph').evaluateAll(nodes=>nodes.map(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform)).filter(m=>m.e!==0||m.f!==0).map(m=>Math.hypot(m.e,m.f)))
  expect(moving.length).toBeLessThan(14)
  expect(Math.max(...moving)).toBeLessThan(4)
  expect(await source.boundingBox()).toEqual(before)
  await expect(line.locator('.hero-type-glyphs')).toHaveAttribute('aria-hidden','true')
  await page.mouse.move(1,1)
  await expect(line.locator('.hero-type-glyph[style*="translate"]')).toHaveCount(0)
})

test('touch runs the entrance and a reversible tap ripple without blocking vertical scrolling',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})
  try{
    const page=await context.newPage()
    await page.goto('/');await settle(page)
    const canvas=page.locator('.portrait-fluid')
    expect(await canvas.evaluate(e=>(e as HTMLCanvasElement).width)).toBeLessThanOrEqual(390*1.25)
    const box=(await page.locator('.portrait-frame').boundingBox())!
    await page.touchscreen.tap(box.x+box.width*.5,box.y+box.height*.45)
    await expect(canvas).toHaveAttribute('data-running','true')
    await expect(canvas).toHaveAttribute('data-running','false',{timeout:6000})
    const cdp=await context.newCDPSession(page),before=await page.evaluate(()=>scrollY)
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650}]})
    for(let i=1;i<=8;i++){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:650-i*45}]})
      await page.waitForTimeout(18)
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+80)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390)
  }finally{await context.close()}
})

test('reduced motion, runtime media changes, resize and context loss retain coherent fallback images',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  await expect(page.locator('.portrait-fluid')).toHaveCount(0)
  await expect(page.locator('.portrait-top img')).toBeVisible()
  await page.emulateMedia({reducedMotion:'no-preference'})
  await expect(page.locator('.portrait-fluid')).toHaveCount(1)
  await expect(page.locator('.hero-type-glyphs')).toHaveCount(4)
  for(const [width,height] of [[768,1024],[360,780],[1440,900]]){
    await page.setViewportSize({width,height})
    await expect.poll(()=>page.locator('.portrait-fluid').evaluate(e=>(e as HTMLCanvasElement).width)).toBeGreaterThan(100)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)
    await expect.poll(()=>page.locator('.hero-roles > .hero-role-mask > .hero-role-primary').evaluate(line=>{
      const source=line.querySelector('.hero-type-source')!
      // Compare intrinsic positions before the paragraph's new 3D entrance transform.
      const paragraph=line as HTMLElement
      const transform=paragraph.style.transform
      paragraph.style.transform='none'
      const last=source.textContent!.length-1
      const range=document.createRange()
      range.setStart(source.firstChild!,last);range.setEnd(source.firstChild!,last+1)
      const expected=range.getBoundingClientRect().left-line.getBoundingClientRect().left
      const glyph=line.querySelector<HTMLElement>('.hero-type-glyph:last-child')!
      const difference=Math.abs(parseFloat(glyph.style.left)-expected)
      paragraph.style.transform=transform
      return difference
    })).toBeLessThan(.1)
  }
  await page.locator('.portrait-fluid').evaluate(e=>(e as HTMLCanvasElement).getContext('webgl')!.getExtension('WEBGL_lose_context')!.loseContext())
  await expect(page.locator('.portrait')).toHaveAttribute('data-fluid-state','fallback')
  await expect(page.locator('.portrait-top img')).toBeVisible()
  await expect(page.locator('.hero-type-glyphs')).toHaveCount(0)
})

test('no WebGL preserves the original DOM hero and source assets remain exact',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      if(type==='webgl'||type==='webgl2')return null
      return Reflect.apply(original,this,[type,...args])
    } as typeof HTMLCanvasElement.prototype.getContext
  })
  await page.goto('/')
  await expect(page.locator('.portrait')).toHaveAttribute('data-fluid-state','fallback',{timeout:15000})
  await expect(page.locator('.portrait-top img')).toBeVisible()
  await expect(page.locator('.portrait-fluid')).toHaveCount(0)
  for(const [file,hash] of [
    ['image1.png','e4bf7b8925b63bbb2457639263f8e8332309ba276d976159c0c05e6e1fbf285f'],
    ['image2.png','bee5f3d67e72b898ef4bee75eef483aa46042c9de0a0a13c78e6ac3fbd4c15a7'],
  ])expect(createHash('sha256').update(readFileSync('public/assets/'+file)).digest('hex')).toBe(hash)
})
