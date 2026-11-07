import { expect, test } from '@playwright/test'

for (const width of [1440,390]) {
  test('signature waits for its viewport entry and redraws on return at '+width, async ({page}) => {
    await page.setViewportSize({width,height:900})
    await page.goto('/')
    const signature=page.locator('.footer-signature'),stroke=signature.locator('.signature-main')
    await page.waitForTimeout(2100)
    await expect(signature).toHaveAttribute('data-signature','waiting')
    await expect(stroke).toHaveCSS('animation-name','none')
    expect(await stroke.evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset))).toBeCloseTo(1.06)
    const top=await signature.evaluate(e=>e.getBoundingClientRect().top+scrollY)
    await page.evaluate(y=>scrollTo(0,y),top-940)
    await expect(signature).toHaveAttribute('data-signature','waiting')
    await signature.evaluate(e=>e.scrollIntoView({block:'center'}))
    await expect(signature).toHaveAttribute('data-signature','draw')
    await expect(stroke).toHaveCSS('animation-name','sign-draw')
    await expect.poll(()=>stroke.evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset))).toBe(0)
    await page.evaluate(()=>scrollTo(0,0))
    await expect(signature).toHaveAttribute('data-signature','waiting')
    await signature.evaluate(e=>e.scrollIntoView({block:'center'}))
    await expect(signature).toHaveAttribute('data-signature','draw')
    await expect.poll(()=>stroke.evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset))).toBe(0)
  })
}
