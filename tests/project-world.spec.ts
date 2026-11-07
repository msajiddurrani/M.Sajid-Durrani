import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test('one renderer supplies five distinct dimensional scenes and stops offscreen',async({page})=>{
  await page.goto('/')
  const world=page.locator('.project-world')
  await expect(world).toHaveCount(1)
  const images:Buffer[]=[]
  for(const id of ['savyora','vangaurd','sop-voice','axiom-crm','creamy']){
    const scene=page.locator('[data-project-scene="'+id+'"]')
    await scene.evaluate(e=>e.scrollIntoView({block:'center'}))
    await expect(page.locator('#work')).toHaveAttribute('data-world','webgl',{timeout:15000})
    await expect(scene).toHaveAttribute('data-scene-ready','true')
    await expect(world).toHaveAttribute('data-running','true')
    await page.waitForTimeout(300)
    const screenshot=await scene.screenshot()
    const stats=await sharp(screenshot).stats()
    // Lit ivory/coral geometry must actually appear over the near-black field.
    expect(stats.channels[0].max).toBeGreaterThan(140)
    expect(stats.channels[0].stdev).toBeGreaterThan(12)
    images.push(screenshot)
  }
  expect(new Set(images.map(image=>image.toString('base64'))).size).toBe(5)
  const scene=page.locator('[data-project-scene="savyora"]')
  const before=await scene.screenshot()
  await page.waitForTimeout(350)
  expect((await scene.screenshot()).equals(before)).toBe(false)
  await page.evaluate(()=>scrollTo(0,0))
  await expect(world).toHaveAttribute('data-running','false')
  await expect(world).toBeHidden()
})

test('reduced motion keeps static 3D and context loss restores usable fallback content',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  const scene=page.locator('[data-project-scene="vangaurd"]'),world=page.locator('.project-world')
  await scene.evaluate(e=>e.scrollIntoView({block:'center'}))
  await expect(page.locator('#work')).toHaveAttribute('data-world','webgl',{timeout:15000})
  await expect(world).toHaveAttribute('data-running','false')
  const image=await scene.screenshot()
  await page.waitForTimeout(250)
  expect((await scene.screenshot()).equals(image)).toBe(true)
  await world.evaluate(e=>(e as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext())
  await expect(page.locator('#work')).toHaveAttribute('data-world','fallback')
  await expect(scene.locator('.project-scene-fallback')).toBeVisible()
  await expect(page.locator('#project-vangaurd').getByRole('link',{name:'Visit GitHub'})).toBeVisible()
})

test('no WebGL retains every project and dimensional CSS fallback',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type,...options){
      if(type==='webgl'||type==='webgl2')return null
      return original.call(this,type,...options)
    } as typeof original
  })
  await page.goto('/')
  await page.locator('#project-savyora').scrollIntoViewIfNeeded()
  await expect(page.locator('#work')).toHaveAttribute('data-world','fallback',{timeout:15000})
  await expect(page.locator('.project-chapter')).toHaveCount(5)
  await expect(page.locator('.project-scene-fallback')).toHaveCount(5)
  await expect(page.locator('#project-savyora').getByRole('link',{name:'Visit GitHub'})).toBeVisible()
})
