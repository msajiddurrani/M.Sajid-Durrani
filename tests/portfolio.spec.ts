import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'
import sharp from 'sharp'

async function boxOf(element: Locator) {
  const box = await element.boundingBox()
  if (!box) throw new Error('Expected an on-screen element')
  return box
}

async function pixel(buffer: Buffer, left: number, top: number) {
  return sharp(buffer).extract({ left, top, width: 1, height: 1 }).removeAlpha().raw().toBuffer()
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test('layout and anchors at ' + width + ' px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    const wordmark = await page.locator('.cover h1').evaluate((heading) => {
      const range = document.createRange()
      range.selectNodeContents(heading)
      const { left, right } = range.getBoundingClientRect()
      return { left, right }
    })
    expect(wordmark.left).toBeGreaterThanOrEqual(0)
    expect(wordmark.right).toBeLessThanOrEqual(width)
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' }).click()
    await expect(page).toHaveURL(/#work$/)
    await expect(page.getByRole('heading', { level: 3 }).filter({ hasText: 'Axiom AI' })).toBeVisible()
    await expect(page.locator('.work-item')).toHaveCount(6)
    await expect(page.locator('.capabilities > li')).toHaveCount(5)
    await expect(page.locator('.record-list > li')).toHaveCount(6)
  })
}

test('approved external destinations and SEO', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Muhammad Sajid Durrani \| Full-Stack AI Engineer/)
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href')!.slice(1)).filter((id) => !document.getElementById(id)),
  )
  expect(brokenAnchors).toEqual([])
  const links = await page.locator('a[href]:not([href^="#"])').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')))
  expect(links).toEqual(['https://msajid.vercel.app', 'https://github.com/msajiddurrani', 'https://linkedin.com/in/sajiddurrani'])
  expect(await page.locator('img').evaluateAll((images) => images.map((image) => image.getAttribute('src')))).toEqual([
    expect.stringContaining('image2-640'), expect.stringContaining('image1-640'),
  ])
})

test('mouse mask changes actual pixels locally, follows position, and resets', async ({ page }) => {
  await page.goto('/')
  const frame = page.getByRole('button', { name: /Reveal Muhammad/ })
  await frame.scrollIntoViewIfNeeded()
  await frame.locator('img').evaluateAll((images) => Promise.all(images.map((image) => (image as HTMLImageElement).decode())))
  const rect = await boxOf(frame)
  const top = frame.locator('.portrait-top')
  await expect(top).toHaveCSS('z-index', '3')
  await expect(frame.locator('.portrait-bottom')).toHaveCSS('z-index', '2')
  await expect(top).toHaveCSS('--aperture', '0px')
  const before = await frame.screenshot({ scale: 'css' })
  const x = Math.floor(rect.width * .5)
  const y = Math.floor(rect.height * .5)
  await page.mouse.move(rect.x + x, rect.y + y)
  await expect(top).toHaveCSS('--aperture', '180px')
  await expect(top).toHaveCSS('--center-x', x + 'px')
  await expect(top).toHaveCSS('--center-y', y + 'px')
  const after = await frame.screenshot({ scale: 'css' })
  const beforeCenter = await pixel(before, x, y)
  const afterCenter = await pixel(after, x, y)
  expect(afterCenter.reduce((difference, channel, index) => difference + Math.abs(channel - beforeCenter[index]), 0)).toBeGreaterThan(80)
  expect(await pixel(after, x, y + 195)).toEqual(await pixel(before, x, y + 195))
  expect(await pixel(after, x - 195, y)).toEqual(await pixel(before, x - 195, y))

  await page.mouse.move(rect.x + 30, rect.y + 165)
  await expect(top).toHaveCSS('--center-x', '30px')
  await expect(top).toHaveCSS('--center-y', '165px')
  await page.mouse.move(rect.x + 111, rect.y + 317)
  await expect(top).toHaveCSS('--center-x', '111px')
  await expect(top).toHaveCSS('--center-y', '317px')
  const darkBacking = await pixel(await frame.screenshot({ scale: 'css' }), 111, 317)
  expect([...darkBacking]).toEqual([16, 14, 14])
  await page.evaluate(() => window.scrollBy(0, 35))
  await expect(top).toHaveCSS('--center-y', '352px')
  await page.setViewportSize({ width: 1024, height: 900 })
  const resized = await boxOf(frame)
  await page.mouse.move(Math.round(resized.x) + 220, Math.round(resized.y) + 300)
  const center = await top.evaluate((element) => parseFloat(getComputedStyle(element).getPropertyValue('--center-x')))
  expect(center).toBeCloseTo(220, 0)
  await page.mouse.move(0, 0)
  await expect(top).toHaveCSS('--aperture', '0px')
  await expect(frame).not.toHaveAttribute('data-pointer')
})

test('keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  for (let index = 0; index < 5; index++) await page.keyboard.press('Tab')
  const frame = page.getByRole('button', { name: /Reveal Muhammad/ })
  await expect(frame).toBeFocused()
  await expect(frame).toHaveCSS('outline-style', 'dashed')
  const top = frame.locator('.portrait-top')
  await expect(top).toHaveCSS('transition-duration', '0s')
  await page.keyboard.press('Enter')
  await expect(frame).toHaveAttribute('aria-pressed', 'true')
  await expect(top).toHaveCSS('--aperture', '180px')
  await expect(top).toHaveCSS('--center-x', '50%')
  await page.keyboard.press('Escape')
  await expect(frame).toHaveAttribute('aria-pressed', 'false')
  await expect(top).toHaveCSS('--aperture', '0px')
  await page.keyboard.press('Space')
  await expect(frame).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Space')
  await expect(frame).toHaveAttribute('aria-pressed', 'false')
})

test('touch drag, release, and cancel at 390 px and DPR 2', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  try {
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await page.goto('/')
    const frame = page.getByRole('button', { name: /Reveal Muhammad/ })
    const top = frame.locator('.portrait-top')
    await frame.scrollIntoViewIfNeeded()
    const rect = await boxOf(frame)
    const x = Math.round(rect.x + 140)
    const y = Math.round(rect.y + 190)
    await expect(page.getByText('Touch & drag to reveal')).toBeVisible()
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await expect(frame).toHaveAttribute('data-pointer', 'touch')
    await expect(top).toHaveCSS('--aperture', '125px')
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 42, y: y + 24 }] })
    expect(await top.evaluate((element) => parseFloat(getComputedStyle(element).getPropertyValue('--center-x')))).toBeCloseTo(182, 0)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(top).toHaveCSS('--aperture', '0px')
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await expect(top).toHaveCSS('--aperture', '125px')
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
    await expect(top).toHaveCSS('--aperture', '0px')
  } finally {
    await context.close()
  }
})

test('mask-disabled fallback swaps portraits on activation', async ({ page }) => {
  // Simulate a browser with no CSS mask support in both feature checks.
  await page.addInitScript(() => {
    const supports = CSS.supports.bind(CSS)
    CSS.supports = (property: string, value?: string) => property === 'mask-image' ? false : value === undefined ? supports(property) : supports(property, value)
  })
  await page.route(/\/assets\/.*\.css$/, async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/\(mask-image:\s*radial-gradient\(transparent,\s*(?:black|#000)\)\)/g, '(unsupported-portrait-feature: none)')
    await route.fulfill({ response, body })
  })
  await page.goto('/')
  const frame = page.getByRole('button', { name: /Reveal Muhammad/ })
  const top = frame.locator('.portrait-top')
  await expect(page.getByText('Activate to switch portraits')).toBeVisible()
  await expect(top).toBeVisible()
  await frame.click()
  await expect(top).toBeHidden()
  await expect(frame.locator('.portrait-bottom')).toBeVisible()
  await frame.press('Escape')
  await expect(top).toBeVisible()
})

test('automated accessibility scan', async ({ page }) => {
  await page.goto('/')
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([])
})
