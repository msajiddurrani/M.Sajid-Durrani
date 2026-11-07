import { expect, test } from '@playwright/test'

for(const width of [320,390,768,1440,2560]){
  test('display headings fit and settle without clipping at '+width,async({page})=>{
    await page.setViewportSize({width,height:900})
    await page.goto('/')
    await page.evaluate(()=>document.fonts.ready)
    for(const id of ['about-title','work-title','expertise-title','record-title','contact-title']){
      const title=page.locator('#'+id)
      await title.evaluate(e=>e.scrollIntoView({block:'center'}))
      const words=title.locator('.kinetic-word')
      await expect.poll(()=>words.last().evaluate(e=>parseFloat(getComputedStyle(e).opacity))).toBe(1)
      await expect.poll(()=>words.last().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)).toBeCloseTo(0,1)
      for(const word of await words.all()){
        const box=(await word.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(-1)
        expect(box.x+box.width).toBeLessThanOrEqual(width+1)
      }
      expect(await title.evaluate(e=>getComputedStyle(e).fontFamily)).toContain('Barlow Condensed')
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)
    }
  })
}

test('reduced-motion headings are visible without 3D entrances and react to preference changes',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  const words=page.locator('.kinetic-word')
  for(const word of await words.all()){
    await expect(word).toHaveCSS('transform','none')
    await expect(word).toHaveCSS('opacity','1')
  }
  await expect(page.getByRole('heading',{name:'ABOUT ME.',exact:true})).toHaveCount(1)
  await page.emulateMedia({reducedMotion:'no-preference'})
  await expect.poll(()=>words.first().evaluate(e=>getComputedStyle(e).transform)).not.toBe('none')
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(words.first()).toHaveCSS('transform','none')
})
