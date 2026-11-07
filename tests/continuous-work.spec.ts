import { expect, test } from '@playwright/test'

for(const width of [390,1440]){
 test('Work scrolls vertically with reversible GSAP reveals and no slide rail at '+width,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready)
  const chapter=page.locator('#project-axiom-crm'),title=chapter.locator('h3')
  await chapter.evaluate(e=>e.scrollIntoView({block:'center'}))
  await expect(page.locator('#work')).toHaveAttribute('data-world','webgl',{timeout:15000})
  await expect.poll(()=>title.evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBe(1)
  const top=await chapter.evaluate(e=>e.getBoundingClientRect().top+scrollY)
  await page.evaluate(y=>scrollTo(0,y),top-1050)
  await expect.poll(()=>title.evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBeLessThan(.01)
  await chapter.evaluate(e=>e.scrollIntoView({block:'center'}))
  await expect.poll(()=>title.evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBe(1)
  const before=await page.evaluate(()=>scrollY)
  await page.mouse.move(width*.5,600);await page.mouse.wheel(0,350)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+250)
  expect(await page.evaluate(()=>scrollX)).toBe(0)
  await expect(page.locator('.project-track,.project-stage,.project-controls,.gallery-diagram')).toHaveCount(0)
 })
}

test('fresh root reload starts at the VR hero after leaving the hero',async({page})=>{
  await page.goto('/')
  for(let attempt=0;attempt<3;attempt++){
    await page.evaluate(()=>scrollTo(0,4000))
    await page.reload()
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0)
    await expect(page.locator('.hero')).toBeInViewport({ratio:.95})
    await expect(page.locator('.portrait')).toHaveAttribute('data-fluid-state','settled',{timeout:10000})
    await expect(page.locator('.portrait-fluid')).toHaveAttribute('data-progress','0.0000')
    await expect(page.locator('.portrait')).toHaveAttribute('data-phase','helmet')
  }
})
