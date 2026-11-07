import {expect,test} from '@playwright/test'
import sharp from 'sharp'

test('transparent signature favicon has no background and theme-aware strokes',async({page})=>{
  await page.goto('/')
  const svg=page.locator('link[rel="icon"][type="image/svg+xml"]')
  const response=await page.request.get((await svg.getAttribute('href'))!)
  expect(response.ok()).toBe(true)
  const source=await response.text()
  expect(source).toContain('prefers-color-scheme:dark')
  expect(source).not.toContain('<rect')
  const png=page.locator('link[rel="icon"][sizes="192x192"]')
  const raster=await page.request.get((await png.getAttribute('href'))!)
  const stats=await sharp(await raster.body()).stats()
  expect(stats.isOpaque).toBe(false)
  expect(stats.channels[3].min).toBe(0)
  expect(stats.channels[3].max).toBeGreaterThan(240)
})

for(const width of [1440,390]){
 test('professional copy, separated Work intro and direct footer contacts at '+width,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready)
  await expect(page.locator('.about-lead strong')).toHaveText(['M. Sajid Durrani','Full-Stack AI Engineer & UI/UX Architect','Zentrix Edge'])
  const heading=page.locator('#work .chapter-heading'),intro=page.locator('.work-preface')
  const gap=await intro.evaluate(e=>e.getBoundingClientRect().top-e.previousElementSibling!.getBoundingClientRect().bottom)
  expect(gap).toBeGreaterThanOrEqual(20)
  await heading.scrollIntoViewIfNeeded()
  const connect=page.getByRole('navigation',{name:'Contact and profiles'})
  await expect(connect.getByRole('link',{name:/Mail/})).toHaveAttribute('href','mailto:sajiddurrani987@gmail.com')
  await expect(connect.getByRole('link',{name:/WhatsApp/})).toHaveAttribute('href','https://wa.me/923199644343')
  await expect(connect.getByRole('link',{name:/Portfolio/})).toHaveCount(0)
  const cta=page.getByRole('link',{name:/Let’s talk on WhatsApp/})
  await expect(cta).toHaveAttribute('href','https://wa.me/923199644343')
  await cta.scrollIntoViewIfNeeded();await expect(cta).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)
 })
}

test('cursor and magnetic button coordinate hover, reset and keyboard focus',async({page})=>{
  await page.goto('/')
  const button=page.locator('#project-savyora .project-live')
  await button.scrollIntoViewIfNeeded()
  const bounds=(await button.boundingBox())!
  await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.65)
  const cursor=page.locator('.custom-cursor')
  await expect(cursor).toHaveAttribute('data-visible','true')
  await expect(cursor).toHaveAttribute('data-interactive','true')
  await expect(cursor.locator('span')).toHaveCSS('width','6px')
  await expect(cursor.locator('span')).toHaveCSS('height','6px')
  await expect(cursor.locator('i')).toHaveCount(0)
  const position=await cursor.evaluate(e=>{const matrix=new DOMMatrixReadOnly(getComputedStyle(e).transform);return {x:matrix.m41,y:matrix.m42}})
  expect(position.x).toBeCloseTo(bounds.x+bounds.width*.8,0)
  expect(position.y).toBeCloseTo(bounds.y+bounds.height*.65,0)
  await expect(button).toHaveCSS('background-color','rgb(158, 48, 38)')
  await expect.poll(()=>button.evaluate(e=>parseFloat(getComputedStyle(e).getPropertyValue('--pointer-x')))).toBeGreaterThan(1)
  await page.mouse.move(2,450)
  await expect(cursor.locator('span')).toHaveCSS('width','6px')
  await expect.poll(()=>button.evaluate(e=>getComputedStyle(e).getPropertyValue('--pointer-x'))).toBe('')
  await button.focus();await page.keyboard.press('Tab')
  await expect(cursor).toHaveAttribute('data-visible','false')
  expect(await page.evaluate(()=>document.documentElement.hasAttribute('data-custom-cursor'))).toBe(false)
})

test('reduced motion restores native cursor and disables magnetic translation',async({page})=>{
  await page.goto('/')
  await page.mouse.move(200,200)
  await expect(page.locator('.custom-cursor')).toHaveAttribute('data-visible','true')
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(page.locator('.custom-cursor')).toBeHidden()
  expect(await page.evaluate(()=>document.documentElement.hasAttribute('data-custom-cursor'))).toBe(false)
  const button=page.locator('.closing-cta')
  await button.scrollIntoViewIfNeeded();await button.hover()
  await expect(button).toHaveCSS('translate','none')
})

test('touch retains native controls without custom cursor interception',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  try{
    const page=await context.newPage();await page.goto('/')
    await expect(page.locator('.custom-cursor')).toBeHidden()
    await page.getByRole('button',{name:'Menu',exact:true}).tap()
    await expect(page.getByRole('button',{name:'Close',exact:true})).toHaveAttribute('aria-expanded','true')
    await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Contact',exact:true}).tap()
    await expect(page.locator('.closing-cta')).toHaveAttribute('href','https://wa.me/923199644343')
  }finally{await context.close()}
})
