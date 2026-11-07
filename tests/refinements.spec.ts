import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test('individual navigation links strike through, clean copy, skill index and live footer waves', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main', exact: true })
  expect(await nav.evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  const about = nav.getByRole('link', { name: 'About', exact: true })
  await about.hover()
  await expect.poll(() => about.locator('.strike-text').evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e, '::after').transform).a)).toBe(1)
  await nav.getByRole('link', { name: 'Stack', exact: true }).click()
  await expect(page.locator('.skill-index h3')).toHaveText(['Core', 'Interface', 'Infrastructure', 'Intelligence'])
  await expect(page.locator('.skill-index li')).toHaveCount(24)
  expect(await page.locator('body').innerText()).not.toMatch(/demo|portrait study|system study|concept illustration|provenance/i)
  await nav.getByRole('link', { name: 'Contact', exact: true }).click()
  const waves = page.locator('.closing-contours')
  await expect(waves).toBeInViewport()
  const before = await waves.evaluate(e => (e as HTMLCanvasElement).toDataURL())
  await expect.poll(() => waves.evaluate(e => (e as HTMLCanvasElement).toDataURL())).not.toBe(before)
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(250)
  const paused = await waves.evaluate(e => (e as HTMLCanvasElement).toDataURL())
  await page.waitForTimeout(200)
  expect(await waves.evaluate(e => (e as HTMLCanvasElement).toDataURL())).toBe(paused)
  expect(errors).toEqual([])
})

test('3D logo relief keeps colored centers visible and survives a WebGL loss with usable DOM balls', async ({ page }) => {
  await page.goto('/#expertise')
  await page.getByRole('button', { name: 'Frontend', exact: true }).click()
  const arena = page.locator('.tech-arena')
  await expect(arena.locator('[data-active="true"][data-placed]')).toHaveCount(10)
  const ball = arena.locator('[data-technology="javascript"]')
  await expect(ball).toHaveAttribute('data-three', 'true', { timeout: 15000 })
  await page.waitForTimeout(2200)
  const previous = await ball.boundingBox()
  await page.waitForTimeout(300)
  const box = (await ball.boundingBox())!
  expect(Math.abs(box.y - previous!.y)).toBeLessThan(1)
  const buffer = await page.screenshot({ clip: { x:box.x + box.width * .35, y:box.y + box.height * .35, width:box.width * .3, height:box.height * .3 } })
  const { data } = await sharp(buffer).removeAlpha().raw().toBuffer({resolveWithObject:true})
  let colored = 0
  for (let i=0; i<data.length; i+=3) if(data[i] > 120 && data[i+1] > 100 && data[i+2] < data[i+1] * .7) colored++
  expect(colored).toBeGreaterThan(20)
  const tsBox=(await arena.locator('[data-technology="typescript"]').boundingBox())!
  const tsPixels=await sharp(await page.screenshot({clip:tsBox})).removeAlpha().raw().toBuffer()
  let white=0
  for(let i=0;i<tsPixels.length;i+=3) if(tsPixels[i]>200 && tsPixels[i+1]>200 && tsPixels[i+2]>200) white++
  expect(white).toBeGreaterThan(10)
  expect(white/(tsPixels.length/3)).toBeLessThan(.13)
  await page.locator('.stack-scene').evaluate(e => {
    const gl = (e as HTMLCanvasElement).getContext('webgl2')!
    gl.getExtension('WEBGL_lose_context')!.loseContext()
  })
  await expect(ball).not.toHaveAttribute('data-three')
  await expect(ball.locator('.stack-ball-face')).toBeVisible()
  await ball.focus()
  await expect(ball).toBeFocused()
})

test('content remains bounded on very large screens and small phones', async ({ page }) => {
  for (const [width,height] of [[2560,1440],[1920,1080],[320,780]]) {
    await page.setViewportSize({width,height})
    await page.goto('/#expertise')
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    expect(await page.locator('#expertise').evaluate(e => e.getBoundingClientRect().width)).toBeLessThanOrEqual(1240)
    await page.locator('#expertise').evaluate(e => e.scrollIntoView())
    await expect(page.locator('#expertise h2')).toBeInViewport()
    const heading = (await page.locator('#expertise h2').boundingBox())!
    expect(heading.x).toBeGreaterThanOrEqual(0)
    expect(heading.x+heading.width).toBeLessThanOrEqual(width)
  }
})
