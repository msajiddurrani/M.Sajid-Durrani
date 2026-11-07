import { expect, test } from '@playwright/test'
import sharp from 'sharp'

for(const backend of ['webgl','svg']){
  test('wider fluid hover follows the cursor and leaves distant portrait areas unchanged: '+backend,async({page})=>{
    if(backend==='svg')await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
        if(type==='webgl'||type==='webgl2')return null
        return Reflect.apply(get,this,[type,...args])
      } as typeof HTMLCanvasElement.prototype.getContext
    })
    await page.goto('/')
    await expect(page.locator('.portrait')).toHaveAttribute('data-fluid',backend,{timeout:15000})
    const frame=page.locator('.portrait-frame')
    if(backend==='webgl'){
      await expect(page.locator('.portrait')).toHaveAttribute('data-fluid-state','settled',{timeout:10000})
      const distance=await page.locator('.pin-spacer:has(> .hero)').evaluate(e=>parseFloat(getComputedStyle(e).paddingBottom))
      await page.evaluate(y=>scrollTo(0,y),distance*.1)
      await expect.poll(()=>page.locator('.portrait-fluid').getAttribute('data-progress').then(Number)).toBeCloseTo(.1,2)
      await page.evaluate(()=>scrollTo(0,0))
      await expect(page.locator('.portrait-fluid')).toHaveAttribute('data-progress','0.0000')
    }
    const box=(await frame.boundingBox())!
    const skin=async(x:number,y:number)=>{
      const pixels=await sharp(await page.screenshot({clip:{x:box.x+box.width*x-6,y:box.y+box.height*y-8,width:12,height:16}})).removeAlpha().raw().toBuffer()
      let count=0
      for(let i=0;i<pixels.length;i+=3){
        const r=pixels[i],g=pixels[i+1],b=pixels[i+2]
        if(r>100&&g>65&&r>g*1.08&&g>b*1.05&&r<g*1.65)count++
      }
      return count
    }
    const near={x:.5,y:.51},far={x:.64,y:.61}
    expect(await skin(far.x,far.y)).toBeLessThan(10)
    await page.mouse.move(box.x+box.width*near.x,box.y+box.height*near.y)
    await expect.poll(()=>skin(near.x,near.y)).toBeGreaterThan(80)
    await page.waitForTimeout(2000)
    expect(await skin(far.x,far.y)).toBeLessThan(10)
    await page.mouse.move(box.x+box.width*far.x,box.y+box.height*far.y)
    await expect.poll(()=>skin(far.x,far.y)).toBeGreaterThan(80)
    expect(await skin(near.x,near.y)).toBeLessThan(10)
    await page.mouse.move(1,1)
    const signal=backend==='webgl'?page.locator('.portrait-fluid'):frame
    await expect(signal).toHaveAttribute(backend==='webgl'?'data-spread':'data-water-spread','0.0000',{timeout:7000})
    expect(await skin(far.x,far.y)).toBeLessThan(10)
  })
}
