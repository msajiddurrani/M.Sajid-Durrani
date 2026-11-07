import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const activeBalls = '.stack-ball[data-active="true"]'
const placedBalls = activeBalls + '[data-placed]'
type BallPosition = { id: string; x: number; y: number; radius: number }

async function openStack(page: Page) {
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Stack' }).click()
  await expect(page).toHaveURL(/#expertise$/)
  return page.locator('#expertise')
}

async function centerArena(arena: Locator) {
  await arena.evaluate((element) => element.scrollIntoView({ block: 'center' }))
}

async function positions(arena: Locator) {
  return arena.locator(placedBalls).evaluateAll((nodes): BallPosition[] => nodes.map((node) => {
    if (!(node instanceof HTMLElement)) throw new Error('Expected a technology ball')
    const rect = node.getBoundingClientRect()
    return { id: node.dataset.technology!, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: node.offsetWidth / 2 }
  }))
}

async function positionOf(ball: Locator) {
  const box = await ball.boundingBox()
  if (!box) throw new Error('Expected a visible technology ball')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, radius: box.width / 2 }
}

async function waitForRest(page: Page, arena: Locator) {
  await expect.poll(async () => {
    const previous = await positions(arena)
    await page.waitForTimeout(220)
    const current = await positions(arena)
    if (!previous.length || current.length !== previous.length) return Infinity
    return Math.max(...current.map((ball, index) => Math.hypot(ball.x - previous[index].x, ball.y - previous[index].y)))
  }, { timeout: 11_000 }).toBeLessThan(.8)
}

async function expectContained(arena: Locator) {
  const field = await arena.boundingBox()
  if (!field) throw new Error('Expected a visible arena')
  const balls = await positions(arena)
  for (const ball of balls) {
    expect(ball.x - ball.radius).toBeGreaterThanOrEqual(field.x - 1)
    expect(ball.x + ball.radius).toBeLessThanOrEqual(field.x + field.width + 1)
    expect(ball.y - ball.radius).toBeGreaterThanOrEqual(field.y - 1)
    expect(ball.y + ball.radius).toBeLessThanOrEqual(field.y + field.height + 1)
  }
}

test('gravity starts on entry, pauses offscreen, and settles without overlapping the circles', async ({ page }) => {
  await page.goto('/')
  const arena = page.getByRole('list', { name: 'Technologies in the selected category' })
  await expect(page.locator('.pin-spacer:has(> .hero)')).toHaveCount(1)
  await expect(arena).toHaveAttribute('data-physics', 'true')
  await expect(arena.locator(placedBalls)).toHaveCount(0)
  await centerArena(arena)
  const first = arena.locator('[data-technology="react"]')
  await expect(first).toHaveAttribute('data-placed', 'true')
  const dropStart = await positionOf(first)
  await expect.poll(async () => (await positionOf(first)).y).toBeGreaterThan(dropStart.y + 60)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(150)
  const paused = await arena.locator(placedBalls).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('style')))
  await page.waitForTimeout(220)
  expect(await arena.locator(placedBalls).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('style')))).toEqual(paused)
  await centerArena(arena)
  await expect(arena.locator(placedBalls)).toHaveCount(20)
  await waitForRest(page, arena)
  await expectContained(arena)

  const balls = await positions(arena)
  expect(new Set(balls.map((ball) => ball.radius)).size).toBe(3)
  expect(Math.max(...balls.map((ball) => ball.y + ball.radius)) - Math.min(...balls.map((ball) => ball.y + ball.radius))).toBeGreaterThan(45)
  for (const [index, ball] of balls.entries()) {
    for (const other of balls.slice(index + 1)) {
      expect(Math.hypot(ball.x - other.x, ball.y - other.y)).toBeGreaterThan(ball.radius + other.radius - 5)
    }
  }
})

test('filters keep shared bodies and expose all 34 skills with local brand artwork', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#expertise')
  const section = page.locator('#expertise')
  await expect(section.getByRole('heading', { name: 'WHAT I BUILD WITH.' })).toBeInViewport()
  const arena = section.getByRole('list', { name: 'Technologies in the selected category' })
  const filters = section.getByRole('group', { name: 'Technology categories' })
  await expect(filters.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  await expect(arena.locator(placedBalls)).toHaveCount(20)
  await waitForRest(page, arena)
  const shared = arena.locator('[data-technology="nodejs"]')
  const originalHeight = await shared.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)
  await filters.getByRole('button', { name: 'Backend' }).click()
  await expect(arena.locator('[data-technology="react"]')).toBeHidden()
  expect(await shared.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBeGreaterThan(originalHeight - 25)

  const groups = [
    ['Backend', ['Node.js', 'Express.js', 'Python', 'FastAPI', 'Firebase', 'MongoDB', 'PostgreSQL', 'Supabase']],
    ['Frontend', ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Three.js', 'GSAP', 'Vite']],
    ['AI Engineering', ['Gemini API', 'Groq', 'RAG', 'LLM Integration', 'Vector Databases', 'Semantic Search', 'Embeddings', 'AI Workflow Automation', 'Repository Indexing']],
    ['DevOps', ['Git', 'GitHub', 'GitHub Actions', 'Docker', 'Vercel', 'Postman', 'VS Code']],
  ] as const
  for (const [filter, names] of groups) {
    const button = filters.getByRole('button', { name: filter })
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(arena.locator(placedBalls)).toHaveCount(names.length)
    await expect(arena.locator(activeBalls + ' .stack-ball-text')).toHaveText([...names])
  }

  const marks = await arena.locator('img').evaluateAll(async (nodes) => {
    const images = nodes as HTMLImageElement[]
    await Promise.all(images.map((image) => image.decode()))
    return images.map((image) => ({ id: image.closest<HTMLElement>('[data-technology]')!.dataset.technology, source: image.currentSrc, filter: getComputedStyle(image).filter, width: image.naturalWidth }))
  })
  expect(marks).toHaveLength(27)
  expect(marks.every((mark) => mark.width > 0 && (mark.filter === 'none' || (mark.id==='github' && mark.filter==='invert(1)')) && /^(data:image\/svg\+xml|http:\/\/127\.0\.0\.1:4173\/)/.test(mark.source))).toBe(true)
  const colors = await arena.locator('[data-technology="react"] img, [data-technology="javascript"] img, [data-technology="gsap"] img, [data-technology="gemini"] img')
    .evaluateAll((nodes) => Promise.all((nodes as HTMLImageElement[]).map(async (image) => (await (await fetch(image.currentSrc)).text()).toLowerCase())))
  for (const [index, hex] of ['#61dafb', '#f0db4f', '#0ae448', '#3186ff'].entries()) expect(colors[index]).toContain(hex)
  expect(errors).toEqual([])
})

test('cursor repulsion moves a resting ball and dragging lifts it before gravity pulls it back', async ({ page }) => {
  const section = await openStack(page)
  await section.getByRole('button', { name: 'Backend' }).click()
  const arena = section.getByRole('list', { name: 'Technologies in the selected category' })
  await centerArena(arena)
  await expect(arena.locator(placedBalls)).toHaveCount(8)
  await waitForRest(page, arena)
  const resting = (await positions(arena)).sort((a, b) => b.x - a.x)[0]
  const target = arena.locator('[data-technology="' + resting.id + '"]')

  for (let offset = 6; offset >= -4; offset -= 2) {
    await page.mouse.move(resting.x - resting.radius - 4, resting.y + offset)
    await page.waitForTimeout(30)
  }
  await expect.poll(async () => (await positionOf(target)).x).toBeGreaterThan(resting.x + 2)
  await page.mouse.move(0, 0)
  await waitForRest(page, arena)

  const floor = await positionOf(target)
  await page.mouse.move(floor.x, floor.y)
  await expect(section.locator('.stack-inspected')).toHaveText(await target.locator('.stack-ball-text').innerText())
  await page.mouse.down()
  await expect(arena).toHaveAttribute('data-dragging', 'true')
  await page.mouse.move(floor.x - 40, floor.y - 160, { steps: 12 })
  await expect.poll(async () => (await positionOf(target)).y).toBeLessThan(floor.y - 115)
  const lifted = await positionOf(target)
  await page.mouse.up()
  await expect(arena).not.toHaveAttribute('data-dragging')
  await expect.poll(async () => (await positionOf(target)).y).toBeGreaterThan(lifted.y + 65)
  await expectContained(arena)
})

test('resizing retains the scene and adjusts All to 16 tablet and 14 mobile balls', async ({ page }) => {
  const section = await openStack(page)
  const arena = section.getByRole('list', { name: 'Technologies in the selected category' })
  await expect(arena.locator(placedBalls)).toHaveCount(20)
  for (const [width, height, count] of [[768, 1024, 16], [390, 844, 14]]) {
    await page.setViewportSize({ width, height })
    await centerArena(arena)
    await expect(arena.locator(placedBalls)).toHaveCount(count)
    await waitForRest(page, arena)
    await expectContained(arena)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
  const mobile = await positions(arena)
  expect(mobile.every(({ radius }) => radius >= 24 && radius <= 32)).toBe(true)
})

test('a sideways touch can drag a ball and a vertical swipe over a ball scrolls the page', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  try {
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    const section = await openStack(page)
    const arena = section.getByRole('list', { name: 'Technologies in the selected category' })
    await centerArena(arena)
    await expect(arena.locator(placedBalls)).toHaveCount(14)
    await waitForRest(page, arena)
    const ball = arena.locator('[data-technology="react"]')
    const start = await positionOf(ball)
    const x = Math.round(start.x)
    const y = Math.round(start.y)
    const direction = x > 195 ? -1 : 1

    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + direction * 26, y }] })
    await expect(arena).toHaveAttribute('data-dragging', 'true')
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + direction * 54, y: y - 36 }] })
    await expect.poll(async () => Math.abs((await positionOf(ball)).x - x)).toBeGreaterThan(23)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(arena).not.toHaveAttribute('data-dragging')
    await waitForRest(page, arena)

    const gesture = await positionOf(ball)
    const before = await page.evaluate(() => window.scrollY)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(gesture.x), y: Math.round(gesture.y) }] })
    for (let move = 1; move <= 5; move++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(gesture.x), y: Math.round(gesture.y) - move * 26 }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 60)
    await expect(arena).not.toHaveAttribute('data-dragging')
  } finally {
    await context.close()
  }
})

test('reduced motion keeps labelled, keyboard-focusable skills and functional filters', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const section = await openStack(page)
  const arena = section.getByRole('list', { name: 'Technologies in the selected category' })
  await expect(arena).not.toHaveAttribute('data-physics')
  await expect(arena.locator(activeBalls)).toHaveCount(14)
  expect(await arena.evaluate((element) => element.scrollHeight)).toBe(await arena.evaluate((element) => element.clientHeight))
  await expect(arena.locator('[data-technology="react"] .stack-ball-text')).toBeVisible()
  const filter = section.getByRole('button', { name: 'AI Engineering' })
  await filter.focus()
  await page.keyboard.press('Enter')
  await expect(filter).toHaveAttribute('aria-pressed', 'true')
  await expect(arena.locator(activeBalls)).toHaveCount(9)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(arena.locator('[data-technology="gemini"]')).toBeFocused()
  await expect(section.locator('.stack-inspected')).toHaveText('Gemini API')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await centerArena(arena)
  await expect(arena.locator(placedBalls)).toHaveCount(9)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(arena).not.toHaveAttribute('data-physics')
  await expect(arena.locator('[data-technology="gemini"] .stack-ball-text')).toBeVisible()
})
