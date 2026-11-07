type Point = { x: number; y: number }

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => x * x * (3 - 2 * x)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

function lattice(x: number, y: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}

function noise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = smooth(x - ix), fy = smooth(y - iy)
  return mix(mix(lattice(ix, iy), lattice(ix + 1, iy), fx),
    mix(lattice(ix, iy + 1), lattice(ix + 1, iy + 1), fx), fy)
}

function field(x: number, y: number, time: number) {
  const a = noise(x * 1.8 + time * .13, y * 1.8 + 6.8)
  const b = noise(x * 1.5 + 9.2, y * 1.5 - time * .11)
  return .71 * noise(x * 2.7 + a * 1.4 + time * .064, y * 2.7 + b * 1.65)
    + .29 * noise(x * 5.4 - time * .054, y * 5.4 + b * .9)
}

// Growth windows and proportions are independent, so apertures join across different areas.
const fragments = [
  [.35, .36, .34, .2, .07, .84, -1],
  [.67, .51, .28, .25, .14, .92, 1],
  [.47, .67, .34, .31, .21, .91, .6],
  [.53, .23, .32, .22, .27, .94, -.4],
  [.24, .51, .21, .29, .34, .95, .3],
  [.73, .71, .29, .25, .40, .98, -.9],
  [.51, .92, .65, .27, .52, .98, .5],
  [.50, .08, .58, .25, .57, .98, -.3],
  [.50, .50, 1.36, 1.35, .85, .996, 0],
]

function aperture(x: number, y: number, rx: number, ry: number, angle: number, t: number, seed: number) {
  const nodes: Point[] = []
  const ca = Math.cos(angle), sa = Math.sin(angle)
  for (let i = 0; i < 28; i++) {
    const theta = i / 28 * Math.PI * 2
    const u = Math.cos(theta), v = Math.sin(theta)
    const edge = .69 + field(x * 4 + u * .52 + seed, y * 4 + v * .52, t) * .64
    nodes.push({ x: x + (u * rx * ca - v * ry * sa) * edge, y: y + (u * rx * sa + v * ry * ca) * edge })
  }
  const pair = (a: Point, b = a) => ((a.x + b.x) / 2).toFixed(3) + ' ' + ((a.y + b.y) / 2).toFixed(3)
  return 'M' + pair(nodes[27], nodes[0]) + nodes.map((node, i) => 'Q' + pair(node) + ' ' + pair(node, nodes[(i + 1) % 28])).join('') + 'Z'
}

export function fragmentPath(progress: number, time: number) {
  if (progress <= 0 || progress >= 1) return ''
  return fragments.map(([x, y, rx, ry, start, end, bend], seed) => {
    const phase = clamp((progress - start) / (end - start))
    if (!phase) return ''
    const grow = smooth(phase)
    const drift = (field(x * 3, y * 3, time * .17) - .5) * .013
    return aperture(x + grow * bend * .045 + drift, y - grow * bend * .055,
      rx * grow, ry * grow, bend * (.2 + grow * .35), time * .24 + progress * .8, seed)
  }).join('')
}

const levels = [.23, .295, .355, .412, .465, .521, .59, .66, .73]
const edges = [[0, 1], [1, 2], [2, 3], [3, 0]]
const corners = [[0, 0], [1, 0], [1, 1], [0, 1]]

function drawContours(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, pointer: Point, strength: number, heroWaves: boolean) {
  const columns = width < 680 ? 32 : 56, rows = width < 680 ? 38 : 35
  const stride = columns + 1
  const values = new Float32Array(stride * (rows + 1))
  const aspect = Math.min(1.55, width / height)
  const dx = width / columns, dy = height / rows
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= columns; i++) {
      const x = i / columns, y = j / rows
      const px = x - pointer.x, py = y - pointer.y
      const pulse = strength * (heroWaves ? .65 : .38) * Math.exp(-(px * px + py * py) * 34)
      const distance = Math.hypot(px * aspect, py)
      const wave = heroWaves ? strength * Math.sin(distance * 35 - time * 4.5) * .035 * Math.exp(-distance * distance * 18) : 0
      values[j * stride + i] = field(x * aspect + px * pulse, y + py * pulse, time) + wave
    }
  }

  ctx.clearRect(0, 0, width, height)
  ctx.lineWidth = .85
  ctx.lineCap = 'round'
  for (const [index, level] of levels.entries()) {
    const points = new Map<number, Point>()
    const neighbors = new Map<number, number[]>()
    const capacity = (rows + 1) * columns + rows * stride + 1
    const visited = new Set<number>()
    const edgeKey = (a: number, b: number) => Math.min(a, b) * capacity + Math.max(a, b)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const i = y * stride + x
        const quad = [values[i], values[i + 1], values[i + stride + 1], values[i + stride]]
        if (quad.every(v => v < level) || quad.every(v => v >= level)) continue
        const ids = [y * columns + x, (rows + 1) * columns + y * stride + x + 1,
          (y + 1) * columns + x, (rows + 1) * columns + y * stride + x]
        const hits: number[] = []
        for (const [edge, [a, b]] of edges.entries()) {
          if ((quad[a] >= level) === (quad[b] >= level)) continue
          const f = (level - quad[a]) / (quad[b] - quad[a])
          const id = ids[edge]
          points.set(id, { x: (x + mix(corners[a][0], corners[b][0], f)) * dx, y: (y + mix(corners[a][1], corners[b][1], f)) * dy })
          hits.push(id)
        }
        if (hits.length === 4 && (quad.reduce((a, b) => a + b, 0) / 4 >= level) === (quad[0] >= level)) hits.push(hits.shift()!)
        for (let j = 0; j + 1 < hits.length; j += 2) {
          const a = hits[j], b = hits[j + 1]
          neighbors.set(a, [...(neighbors.get(a) ?? []), b])
          neighbors.set(b, [...(neighbors.get(b) ?? []), a])
        }
      }
    }

    ctx.beginPath()
    // Join marching-square edges before drawing. Quadratic interpolation avoids visible cell corners.
    const starts = Array.from(neighbors.keys()).sort((a, b) => neighbors.get(a)!.length - neighbors.get(b)!.length)
    for (const start of starts) {
      let current = start
      const chain = [points.get(start)!]
      for (;;) {
        const next = neighbors.get(current)?.find(id => !visited.has(edgeKey(current, id)))
        if (next === undefined) break
        visited.add(edgeKey(current, next))
        chain.push(points.get(next)!)
        current = next
        if (current === start) break
      }
      if (chain.length < 2) continue
      ctx.moveTo(chain[0].x, chain[0].y)
      for (let i = 1; i < chain.length - 1; i++) {
        const a = chain[i], b = chain[i + 1]
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2)
      }
      const last = chain[chain.length - 1]
      ctx.lineTo(last.x, last.y)
    }
    ctx.strokeStyle = index % 4 === 1 ? '#e74a3b28' : '#f2f0eb23'
    ctx.stroke()
  }
}

export function createHeroField(hero: HTMLElement) {
  const canvas = hero.querySelector('canvas')!
  const ctx = canvas.getContext('2d')
  const fragmentsOn = hero.querySelectorAll<SVGPathElement>('[data-portrait-fragments]')
  const covers = hero.querySelectorAll<SVGRectElement>('[data-mask-cover]')
  const glyph = hero.querySelector<SVGPathElement>('[data-glyph-field]')
  const portrait = hero.querySelector<HTMLElement>('.portrait')
  const heroWaves = hero.classList.contains('hero')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const target = { x: .5, y: .5 }
  const pointer = { ...target }
  let width = 0, height = 0, frame = 0, previous = 0, paint = 0, time = 0
  let nearby = false, strength = 0, visible = false, progress = 0, drawnProgress = -1

  function render(force = false) {
    if (ctx && width && height) drawContours(ctx, width, height, time, pointer, strength, heroWaves)
    const manual = !!portrait?.querySelector('[data-pointer], [aria-pressed="true"]')
    if (force || progress !== drawnProgress || (!manual && progress > 0 && progress < 1)) {
      const path = fragmentPath(progress, manual ? 0 : time)
      for (const node of fragmentsOn) node.setAttribute('d', path)
      if (progress !== drawnProgress || force) {
        covers[0]?.setAttribute('fill', progress === 1 ? 'black' : 'white')
        covers[1]?.setAttribute('fill', progress === 1 ? 'white' : 'black')
        if (portrait) portrait.dataset.phase = progress === 0 ? 'helmet' : progress === 1 ? 'face' : 'fragmented'
        drawnProgress = progress
      }
    }
    if (glyph && !motion.matches && progress > .22) {
      const a = field(.41 + pointer.x * .24, .5, time)
      const b = field(.78, .3 + pointer.y * .27, time + 7)
      glyph.setAttribute('d', aperture(.18 + a * .29, .19 + b * .31, .095, .16, -.65, time, 5)
        + aperture(.59 + b * .22, .68 - a * .21, .085, .19, .48, time, 8))
    } else glyph?.removeAttribute('d')
  }

  function tick(now: number) {
    if (!previous) previous = now
    const dt = Math.min(.06, (now - previous) / 1000)
    previous = now
    time += dt
    pointer.x = mix(pointer.x, target.x, .10)
    pointer.y = mix(pointer.y, target.y, .10)
    strength = mix(strength, nearby ? 1 : 0, .085)
    if (now - paint >= (width < 680 ? 43 : 32)) {
      render()
      paint = now
    }
    frame = requestAnimationFrame(tick)
  }

  function synchronize() {
    if (visible && !document.hidden && !motion.matches) {
      if (!frame) { previous = 0; frame = requestAnimationFrame(tick) }
    } else {
      cancelAnimationFrame(frame)
      frame = 0
      if (motion.matches) render(true)
    }
  }

  function resize() {
    width = hero.clientWidth
    height = hero.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, width < 680 ? 1.15 : 1.4)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    render(true)
  }

  function track(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    const bounds = hero.getBoundingClientRect()
    target.x = (event.clientX - bounds.left) / bounds.width
    target.y = (event.clientY - bounds.top) / bounds.height
    nearby = true
  }

  function leave() { nearby = false }
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize() })
  const observer = new ResizeObserver(resize)
  intersection.observe(hero)
  observer.observe(hero)
  hero.addEventListener('pointermove', track, { passive: true })
  hero.addEventListener('pointerleave', leave)
  document.addEventListener('visibilitychange', synchronize)
  motion.addEventListener('change', synchronize)
  resize()

  return {
    setProgress(value: number) {
      progress = value < .001 ? 0 : value > .999 ? 1 : clamp(value)
      if (!frame || progress === 0 || progress === 1) render()
    },
    destroy() {
      cancelAnimationFrame(frame)
      intersection.disconnect()
      observer.disconnect()
      hero.removeEventListener('pointermove', track)
      hero.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', synchronize)
      motion.removeEventListener('change', synchronize)
    },
  }
}
