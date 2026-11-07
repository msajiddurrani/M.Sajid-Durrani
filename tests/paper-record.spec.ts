import { expect, test } from '@playwright/test'
import { education, experience } from '../src/data/portfolio'

for (const width of [1440, 768, 390, 320]) {
  test('paper dossier preserves every record and stays bounded at '+width, async ({page}) => {
    await page.setViewportSize({width,height:900})
    await page.goto('/')
    await page.evaluate(()=>document.fonts.ready)
    expect(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundImage)).toContain('wrinkled-paper')
    for(const selector of ['.hero','.closing']) {
      expect(await page.locator(selector).evaluate(e=>getComputedStyle(e).backgroundImage)).not.toContain('wrinkled-paper')
    }
    await expect(page.locator('.career-entry h4')).toHaveText(experience.map(e=>e.name))
    await expect(page.locator('.career-entry .record-role')).toHaveText(experience.map(e=>e.role))
    await expect(page.locator('.career-entry .record-description')).toHaveText(experience.map(e=>e.description))
    await expect(page.locator('.study-card h4')).toHaveText(education.map(e=>e.course))
    await expect(page.locator('.study-institution')).toHaveText(education.map(e=>e.institution))
    for(const entry of await page.locator('.record-entry').all()) {
      await entry.evaluate(e=>e.scrollIntoView({block:'center'}))
      await expect.poll(()=>entry.evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBe(1)
      const box=(await entry.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x+box.width).toBeLessThanOrEqual(width)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)
    }
  })
}

test('career entry scrub reverses and reduced motion restores static records',async({page})=>{
  await page.goto('/')
  const entry=page.locator('.career-entry').nth(1)
  await entry.evaluate(e=>e.scrollIntoView({block:'center'}))
  await expect.poll(()=>entry.evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBe(1)
  await page.evaluate(()=>scrollTo(0,0))
  await expect.poll(()=>entry.evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBe(0)
  await page.emulateMedia({reducedMotion:'reduce'})
  for(const item of await page.locator('.record-entry').all()) {
    await expect(item).toHaveCSS('opacity','1')
    expect(await item.evaluate(e=>getComputedStyle(e).transform)).toBe('none')
  }
})

test('all five Live actions open their verified public destination',async({page,context})=>{
  await page.goto('/')
  const urls=['https://savyora.vercel.app/','https://vangaurd-beta.vercel.app/','https://ai-sop-forge.vercel.app/','https://axiom-sable.vercel.app/','https://creamy-henna.vercel.app/']
  // Public pages were also loaded separately; intercept here to keep UI checks deterministic.
  await context.route(url=>urls.includes(url.href),route=>route.fulfill({body:'Verified project destination'}))
  const links=page.locator('#work .project-live[href]')
  await expect(links).toHaveCount(5)
  for(let i=0;i<5;i++) {
    await links.nth(i).scrollIntoViewIfNeeded()
    const opened=context.waitForEvent('page')
    await links.nth(i).click()
    const tab=await opened
    await expect(tab).toHaveURL(urls[i])
    await tab.close()
  }
})
