type Glyph = { node:HTMLSpanElement; center:number; x:number; y:number }
type Line = { paragraph:HTMLElement; source:HTMLSpanElement; visual:HTMLSpanElement; text:string; glyphs:Glyph[] }
type Point = {x:number;y:number}

export function createHeadlineFluid(hero:HTMLElement) {
  const lines:Line[]=Array.from(hero.querySelectorAll<HTMLElement>('[data-role-line]')).map(paragraph=>{
    const text=paragraph.textContent!
    const source=document.createElement('span')
    source.className='hero-type-source';source.textContent=text
    const visual=document.createElement('span')
    visual.className='hero-type-glyphs';visual.setAttribute('aria-hidden','true')
    paragraph.replaceChildren(source,visual)
    return {paragraph,source,visual,text,glyphs:[]}
  })
  function measure() {
    for(const line of lines){
      // Range measurements must be in the glyphs' local space, even mid-scroll.
      const transform=line.paragraph.style.transform
      line.paragraph.style.transform='none'
      const rect=line.paragraph.getBoundingClientRect()
      const range=document.createRange()
      line.visual.replaceChildren()
      line.glyphs=Array.from(line.text,(character,index)=>{
        range.setStart(line.source.firstChild!,index);range.setEnd(line.source.firstChild!,index+1)
        const bounds=range.getBoundingClientRect()
        const node=document.createElement('span')
        node.className='hero-type-glyph';node.textContent=character
        node.style.left=(bounds.left-rect.left)+'px'
        line.visual.append(node)
        return {node,center:bounds.left-rect.left+bounds.width/2,x:0,y:0}
      })
      line.paragraph.style.transform=transform
    }
  }
  measure()
  return {
    measure,
    update(point:Point|null,time:number,dt:number) {
      let active=false, unsettled=false
      for(const line of lines){
        const box=line.paragraph.getBoundingClientRect()
        const clip=line.paragraph.parentElement!.getBoundingClientRect()
        const inside=!!point && point.y>=Math.max(box.top,clip.top)-3 && point.y<=Math.min(box.bottom,clip.bottom)+3
          && point.x>=box.left+line.glyphs[0].center-10 && point.x<=box.left+line.glyphs.at(-1)!.center+10
        active ||= inside
        for(const glyph of line.glyphs){
          const distance=point ? (box.left+glyph.center-point.x)/105 : 10
          const weight=inside ? Math.exp(-distance*distance*1.8) : 0
          const targetY=Math.sin(distance*3.1-time*3.6)*3.1*weight
          const targetX=Math.cos(distance*2.2-time*2.7)*1.35*weight
          const ease=1-Math.exp(-dt*15)
          glyph.x+=(targetX-glyph.x)*ease;glyph.y+=(targetY-glyph.y)*ease
          if(Math.abs(glyph.x)+Math.abs(glyph.y)<.005){glyph.x=0;glyph.y=0}
          glyph.node.style.transform=glyph.x||glyph.y ? 'translate3d('+glyph.x.toFixed(3)+'px,'+glyph.y.toFixed(3)+'px,0) rotate('+(glyph.y*.17).toFixed(3)+'deg)' : ''
          unsettled ||= glyph.x!==0 || glyph.y!==0
        }
      }
      return {active,unsettled}
    },
    destroy(){for(const line of lines)line.paragraph.replaceChildren(document.createTextNode(line.text))},
  }
}
