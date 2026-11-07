import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import sharp from 'sharp'
import { fragmentPath } from '../src/components/hero/fluidField'

async function boxOf(element: Locator) {
  const box = await element.boundingBox()
  if (!box) throw new Error('Expected a visible element')
  return box
}
async function pinDistance(page: Page) {
  await expect(page.locator('.pin-spacer > .hero')).toBeAttached()
  return page.locator('.pin-spacer:has(> .hero)').evaluate((element) => parseFloat(getComputedStyle(element).paddingBottom))
}
async function scale(page: Page) {
  return page.locator('.portrait').evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)
}
async function scrollProgress(page: Page, progress: number) {
  const distance = await pinDistance(page)
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(progress * distance))
}
async function openNavigation(page: Page) {
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  if (await menu.isVisible()) await menu.click()
  return page.getByRole('navigation', { name: 'Main' })
}

for (const [width, height] of [[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[360,780],[844,390]]) {
  test('responsive layout and complete hero endpoint at ' + width + ' × ' + height, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await scrollProgress(page, 1)
    await expect(page.locator('.portrait')).toHaveAttribute('data-phase', 'face')
    await expect.poll(() => scale(page)).toBeCloseTo(width <= 700 || height <= 540 ? .48 : .46, 2)
    for (const selector of ['.hero-role-primary', '.hero-role-secondary']) {
      const line = page.locator('.hero-roles > .hero-role-mask > ' + selector)
      const bounds = await line.evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        const { left, right, top, bottom } = range.getBoundingClientRect()
        return { left, right, top, bottom }
      })
      expect(bounds.left).toBeGreaterThanOrEqual(0)
      expect(bounds.right).toBeLessThanOrEqual(width)
      expect(bounds.top).toBeGreaterThan(55)
      expect(bounds.bottom).toBeLessThan(height)
    }
    for (const id of ['about','work','expertise','experience','contact']) {
      await page.locator('#' + id).evaluate((element) => element.scrollIntoView())
      const title = page.locator('#' + id).locator('h2').first()
      expect((await boxOf(title)).y).toBeGreaterThanOrEqual(64)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    await expect(page.locator('.project-screen')).toHaveCount(5)
    await expect(page.locator('.record-list > li')).toHaveCount(6)
  })
}

test('ambient field evolves while idle, scroll fragments grow, and reverse reconstructs the helmet', async ({ page }) => {
  await page.goto('/')
  const portrait = page.locator('.portrait')
  const holes = page.locator('[data-portrait-fragments]').first()
  await expect(portrait).toHaveAttribute('data-phase', 'helmet')
  await expect(holes).toHaveAttribute('d', '')
  const canvas = page.locator('.hero-contours')
  const first = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())
  await expect.poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).not.toBe(first)
  const headerTop = (await boxOf(page.getByRole('banner'))).y
  await scrollProgress(page, .32)
  await expect(portrait).toHaveAttribute('data-phase', 'fragmented')
  await expect.poll(async () => (await holes.getAttribute('d'))?.match(/M/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
  expect((await boxOf(page.locator('.hero'))).y).toBeCloseTo(0, 0)
  await scrollProgress(page, 1)
  await expect(portrait).toHaveAttribute('data-phase', 'face')
  await expect(page.locator('[data-mask-cover]').first()).toHaveAttribute('fill', 'black')
  await expect(page.locator('[data-mask-cover]').last()).toHaveAttribute('fill', 'white')
  await scrollProgress(page, 0)
  await expect(portrait).toHaveAttribute('data-phase', 'helmet')
  await expect(page.locator('[data-mask-cover]').first()).toHaveAttribute('fill', 'white')
  await expect(holes).toHaveAttribute('d', '')
  expect((await boxOf(page.getByRole('banner'))).y).toBe(headerTop)
  expect(fragmentPath(.45, 0)).toBe(fragmentPath(.45, 0))
  expect(fragmentPath(.85, 0)).not.toBe(fragmentPath(.45, 0))
  expect(fragmentPath(0, 100)).toBe('')
  expect(fragmentPath(1, 100)).toBe('')
  await page.getByRole('navigation', {name:'Main'}).getByRole('link',{name:'Work',exact:true}).click()
  await expect(page.locator('.hero')).not.toBeInViewport()
  await page.waitForTimeout(150)
  const paused = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())
  await page.waitForTimeout(180)
  expect(await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).toBe(paused)
})

test('spreading fluid reveal changes portrait pixels and remains aligned during scaling', async ({ page }) => {
  await page.goto('/')
  const frame = page.getByRole('button', { name: /Reveal Muhammad/ })
  await frame.locator('img').evaluateAll((nodes) => Promise.all((nodes as HTMLImageElement[]).map((image) => image.decode())))
  await expect(page.locator('.portrait')).toHaveAttribute('data-fluid-state', 'settled')
  // Hover reveals the real face, so test it from the sculpture state after scroll reversal.
  await scrollProgress(page,.1)
  await expect.poll(()=>page.locator('.portrait-fluid').getAttribute('data-progress').then(Number)).toBeCloseTo(.1,2)
  await scrollProgress(page,0)
  await expect(page.locator('.portrait-fluid')).toHaveAttribute('data-progress','0.0000')
  await expect.poll(() => scale(page)).toBeCloseTo(1, 2)
  const box = await boxOf(frame)
  const x = Math.round(box.x + box.width * .5), y = Math.round(box.y + box.height * .51)
  const before = await page.screenshot()
  await page.mouse.move(x, y)
  await expect(frame).toHaveCSS('--aperture', '84px')
  const after = await page.screenshot()
  const pixel = (buffer: Buffer, px: number, py: number) => sharp(buffer).extract({left:px,top:py,width:1,height:1}).removeAlpha().raw().toBuffer()
  const a = await pixel(before,x,y), b = await pixel(after,x,y)
  expect(b.reduce((sum,c,i) => sum + Math.abs(c-a[i]),0)).toBeGreaterThan(80)
  await expect.poll(()=>page.locator('.portrait-fluid').getAttribute('data-spread').then(Number)).toBeGreaterThan(.2)
  await scrollProgress(page,.5)
  await expect.poll(() => scale(page)).toBeCloseTo(.73,1)
  const resized = await boxOf(frame)
  const nextX = Math.round(resized.x + resized.width * .42), nextY = Math.round(resized.y + resized.height * .54)
  await page.mouse.move(nextX,nextY)
  const error = await frame.evaluate((element,point) => {
    if (!(element instanceof HTMLButtonElement)) throw new Error('Expected button')
    const bounds=element.getBoundingClientRect(), style=getComputedStyle(element)
    return Math.abs(parseFloat(style.getPropertyValue('--reveal-x'))-(point.x-bounds.left)/bounds.width*element.offsetWidth)
      + Math.abs(parseFloat(style.getPropertyValue('--reveal-y'))-(point.y-bounds.top)/bounds.height*element.offsetHeight)
  },{x:nextX,y:nextY})
  expect(error).toBeLessThan(1)
  await page.mouse.move(0,0)
  await expect(frame).toHaveCSS('--aperture','0px')
})

test('About panels, vertical project actions and footer remain usable by keyboard', async ({ page }) => {
  await page.goto('/')
  const nav=await openNavigation(page)
  await nav.getByRole('link',{name:'About',exact:true}).click()
  await expect(page.locator('.craft-panel h3')).toHaveText(['Design','Engineer','Intelligence'])
  expect(await page.locator('.craft-copy').allTextContents()).toHaveLength(3)
  await nav.getByRole('link',{name:'Work',exact:true}).click()
  for(const id of ['savyora','vangaurd','sop-voice','axiom-crm','creamy']){
    const chapter=page.locator('#project-'+id)
    await chapter.evaluate(e=>e.scrollIntoView({block:'center'}))
    const visit=chapter.getByRole('link',{name:'Visit GitHub'})
    await visit.focus();await expect(visit).toBeFocused()
    const details=chapter.locator('summary');await details.focus();await page.keyboard.press('Enter')
    await expect(chapter.locator('details')).toHaveAttribute('open','')
  }
  await nav.getByRole('link',{name:'Contact',exact:true}).click()
  const footer=page.locator('#contact')
  await expect(footer.locator('.footer-signature')).toHaveCount(1)
  await expect.poll(()=>footer.locator('.signature-main').evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset)),{timeout:5000}).toBe(0)
  await footer.getByRole('link',{name:'Back to top'}).click()
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0)
})

test('mobile vertical touch scroll passes naturally through the project chapters',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2})
 try{
  const page=await context.newPage(),cdp=await context.newCDPSession(page)
  await page.goto('/')
  await page.locator('#project-savyora').evaluate(e=>e.scrollIntoView({block:'center'}))
  const before=await page.evaluate(()=>scrollY)
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:650}]})
  for(let step=1;step<=10;step++){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:650-step*45}]})
   await page.waitForTimeout(18)
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+250)
  expect(await page.evaluate(()=>scrollX)).toBe(0)
  await expect(page.locator('.project-track,.project-stage')).toHaveCount(0)
 }finally{await context.close()}
})

test('reduced motion exposes both portraits and a static signature without a pin', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  const canvas=page.locator('.hero-contours')
  const image=await canvas.evaluate(e=>(e as HTMLCanvasElement).toDataURL())
  await page.waitForTimeout(180)
  expect(await canvas.evaluate(e=>(e as HTMLCanvasElement).toDataURL())).toBe(image)
  const toggle=page.getByRole('button',{name:'Show face',exact:true})
  await toggle.click()
  await expect(page.locator('.portrait')).toHaveAttribute('data-phase','face')
  await page.getByRole('button',{name:'Show helmet',exact:true}).click()
  await expect(page.locator('.portrait')).toHaveAttribute('data-phase','helmet')
  const portrait=page.getByRole('button',{name:/Reveal Muhammad/})
  await portrait.focus()
  await page.keyboard.press('Enter')
  await expect(portrait).toHaveCSS('--aperture','84px')
  await page.keyboard.press('Escape')
  await expect(portrait).toHaveCSS('--aperture','0px')
  await page.locator('#contact').evaluate(e=>e.scrollIntoView())
  await expect(page.locator('.signature-main')).toHaveCSS('stroke-dashoffset','0px')
  await expect(page.locator('.signature-main')).toHaveCSS('animation-name','none')
})

test('approved identity and destinations, preserved data and accessibility', async ({ page }) => {
  const errors:string[]=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/')
  await expect(page).toHaveTitle(/Muhammad Sajid Durrani/)
  expect(await page.locator('a[href^="#"]').evaluateAll(links=>links.map(e=>e.getAttribute('href')!.slice(1)).filter(id=>!document.getElementById(id)))).toEqual([])
  expect(await page.locator('a[href]:not([href^="#"])').evaluateAll(links=>[...new Set(links.map(e=>e.getAttribute('href'))) ].sort())).toEqual([
    'https://github.com/msajiddurrani','https://github.com/msajiddurrani/savyora','https://linkedin.com/in/sajiddurrani','mailto:sajiddurrani987@gmail.com','https://wa.me/923199644343','https://savyora.vercel.app',
    'https://github.com/msajiddurrani/vangaurd-lab','https://vangaurd-beta.vercel.app/',
    'https://github.com/msajiddurrani/SOP-FORGE','https://ai-sop-forge.vercel.app',
    'https://github.com/msajiddurrani/axiom','https://axiom-sable.vercel.app/',
    'https://github.com/msajiddurrani/creamy','https://creamy-henna.vercel.app',
  ].sort())
  await expect(page.locator('.project-screen')).toHaveCount(5)
  await expect(page.getByRole('button',{name:/Select Context Bridge/})).toHaveCount(0)
  await expect(page.locator('.record-list > li')).toHaveCount(6)
  const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
  expect(violations.map(({id,nodes})=>({id,targets:nodes.map(({target})=>target)}))).toEqual([])
  expect(errors).toEqual([])
})
