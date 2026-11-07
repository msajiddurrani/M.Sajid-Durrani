import { expect, test } from '@playwright/test'
import { projectLinks } from '../src/data/projectLinks'

test('chapter words enter from opposing sides, converge and reverse with scroll',async({page})=>{
  await page.goto('/')
  await page.evaluate(()=>document.fonts.ready)
  for(const id of ['about-title','work-title','record-title']){
    const heading=page.locator('#'+id).locator('..')
    const top=await heading.evaluate(e=>e.getBoundingClientRect().top+scrollY)
    const x=()=>heading.locator('[data-heading-left]').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)
    await page.evaluate(y=>scrollTo(0,y-innerHeight-100),top)
    await expect.poll(x).toBeLessThan(-50)
    expect(await heading.locator('[data-heading-right]').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)).toBeGreaterThan(50)
    // These are genuine perspective rotations, not only opposing translations.
    for(const selector of ['[data-heading-left]','[data-heading-right]']){
      const matrix=await heading.locator(selector).evaluate(e=>{
        const m=new DOMMatrixReadOnly(getComputedStyle(e).transform)
        return {rotation:m.m13,depth:m.m43}
      })
      expect(Math.abs(matrix.rotation)).toBeGreaterThan(.1)
      expect(matrix.depth).toBeLessThan(-20)
    }
    expect(await heading.locator('.kinetic-letter').first().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m22)).toBeLessThan(.6)
    await heading.evaluate(e=>e.scrollIntoView({block:'center'}))
    await expect.poll(x).toBeCloseTo(0,1)
    await expect.poll(()=>heading.locator('[data-heading-right]').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)).toBeCloseTo(0,1)
    await expect.poll(()=>heading.locator('[data-heading-left]').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m13)).toBeCloseTo(0,2)
    await expect.poll(()=>heading.locator('.kinetic-letter').last().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m22)).toBeCloseTo(1,2)
    await page.evaluate(y=>scrollTo(0,y-innerHeight-100),top)
    await expect.poll(x).toBeLessThan(-50)
  }
})

for(const [width,height] of [[1440,900],[1024,768],[390,844],[320,780]]){
 test('all five vertical project chapters remain bounded and actionable at '+width,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');await page.evaluate(()=>document.fonts.ready)
  let previous=-1
  for(const id of ['savyora','vangaurd','sop-voice','axiom-crm','creamy']){
    const chapter=page.locator('#project-'+id)
    await chapter.evaluate(e=>e.scrollIntoView({block:'center'}))
    await expect(chapter).not.toHaveAttribute('inert')
    const box=(await chapter.boundingBox())!,top=await chapter.evaluate(e=>e.getBoundingClientRect().top+scrollY)
    expect(top).toBeGreaterThan(previous);previous=top
    expect(box.width).toBeLessThan(width);expect(box.width).toBeLessThanOrEqual(1112)
    for(const selector of ['h3','.project-actions','.project-scene']){
      const bounds=(await chapter.locator(selector).boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x+bounds.width).toBeLessThanOrEqual(width+1)
    }
    await expect(chapter.getByRole('link',{name:'Visit GitHub'})).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)
  }
  await expect(page.locator('.project-track,.project-stage,.project-controls')).toHaveCount(0)
  await expect(page.locator('.pin-spacer #work')).toHaveCount(0)
 })
}

test('reduced motion has static readable chapters, every project and honest outbound actions',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.project-screen')).toHaveCount(5)
  await expect(page.locator('.project-screen[inert]')).toHaveCount(0)
  for(const id of ['savyora','vangaurd','sop-voice','axiom-crm','creamy']){
    const card=page.locator('#project-'+id)
    await card.scrollIntoViewIfNeeded()
    await expect(card.locator('h3')).toBeVisible()
    await expect(card.getByRole('link',{name:'Visit GitHub'})).toHaveAttribute('href',projectLinks[id].github!)
    await expect(card.getByRole('link',{name:/Live/})).toHaveAttribute('href',projectLinks[id].live!)
  }
  await expect(page.locator('[data-technology="javascript"]')).toHaveCSS('--ball-color','#f0db4f')
  await expect(page.locator('[data-technology="nextjs"]')).toHaveCSS('--ball-color','#090909')
})
