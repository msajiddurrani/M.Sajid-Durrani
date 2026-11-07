import Matter from 'matter-js'
import type { Body as MatterBody, Constraint as MatterConstraint } from 'matter-js'
import type { BallSize, Technology } from '../../data/techStack'

const { Bodies, Body, Composite, Constraint, Engine, Sleeping } = Matter
const step = 1000 / 60
const wallThickness = 96

type Point = { x: number; y: number }
type Ball = { technology: Technology; body: MatterBody; node: HTMLLIElement; radius: number }

export type PhysicsWorld = {
  setTechnologies: (selection: readonly Technology[]) => void
  resize: (width: number, height: number) => void
  setVisible: (visible: boolean) => void
  destroy: () => void
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function diameter(size: BallSize, width: number) {
  if (width < 430) return { small: 48, medium: 56, large: 64 }[size]
  if (width < 740) return { small: 52, medium: 62, large: 72 }[size]
  return { small: 64, medium: 78, large: 88 }[size]
}

export function createPhysicsWorld(arena: HTMLUListElement): PhysicsWorld {
  const engine = Engine.create({ enableSleeping: true, gravity: { x: 0, y: .94 } })
  const nodes = new Map(Array.from(arena.querySelectorAll<HTMLLIElement>('[data-technology]'), (node) => [node.dataset.technology!, node]))
  const balls = new Map<string, Ball>()
  let walls: MatterBody[] = []
  let queued: Technology[] = []
  let width = 0
  let height = 0
  let visible = false
  let frame = 0
  let lastTick = 0
  let remainder = 0
  let nextDrop = 0
  let quietSteps = 0
  let pointer: (Point & { expires: number }) | null = null
  let pendingTouch: { id: number; ball: Ball; start: Point } | null = null
  let graphics: ReturnType<typeof import('./stackRenderer').createStackRenderer> | null = null
  let graphicsRequested = false
  let disposed = false
  let held: { id: number; constraint: MatterConstraint } | null = null

  arena.dataset.physics = 'true'

  function render({ body, node, radius, technology }: Ball) {
    node.style.transform = 'translate3d(' + (body.position.x - radius) + 'px,' + (body.position.y - radius) + 'px,0)'
    if (technology.logo) node.style.setProperty('--ball-angle', body.angle + 'rad')
  }

  function drawScene() {
    graphics?.update(Array.from(balls.values(), ({ technology, body, radius }) => ({ technology, x: body.position.x, y: body.position.y, radius, angle: body.angle })))
  }

  function keepInside({ body, radius }: Ball) {
    const x = clamp(body.position.x, radius, width - radius)
    const y = clamp(body.position.y, radius, height - radius)
    if (x !== body.position.x || y !== body.position.y) {
      Body.setPosition(body, { x, y })
      Body.setVelocity(body, {
        x: x <= radius ? Math.max(0, body.velocity.x) : x >= width - radius ? Math.min(0, body.velocity.x) : body.velocity.x,
        y: y <= radius ? Math.max(0, body.velocity.y) : y >= height - radius ? Math.min(0, body.velocity.y) : body.velocity.y,
      })
    }

    const speed = Math.hypot(body.velocity.x, body.velocity.y)
    if (speed > 17) Body.setVelocity(body, { x: body.velocity.x * 17 / speed, y: body.velocity.y * 17 / speed })
    if (Math.abs(body.angularVelocity) > .17) Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * .17)
  }

  function spawn() {
    const technology = queued[0]
    const node = nodes.get(technology.id)
    if (!node) {
      queued.shift()
      return
    }
    const radius = diameter(technology.size, width) / 2
    const largest = diameter('large', width)
    const columns = Math.max(1, Math.floor(width / (largest + 5)))
    const slots = Array.from({ length: columns }, (_, i) => width * (i + .5) / columns)
      .sort((a, b) => Math.abs(a - width / 2) - Math.abs(b - width / 2))
    const occupied = Array.from(balls.values())

    // Look for room before inserting a new body so a filter change cannot spawn overlapping balls.
    for (let y = largest / 2 + 5 + height * .08; y <= height - radius; y += largest + 5) {
      const x = slots.find((slot) => occupied.every(({ body, radius: other }) =>
        Math.hypot(body.position.x - slot, body.position.y - y) >= radius + other + 3,
      ))
      if (x === undefined) continue
      const body = Bodies.circle(x, y, radius, {
        restitution: .43,
        friction: .11,
        frictionStatic: .38,
        frictionAir: .025,
        sleepThreshold: 44,
      })
      Body.setVelocity(body, { x: (balls.size % 2 ? -.32 : .32), y: .65 })
      const ball = { technology, body, node, radius }
      node.style.setProperty('--ball-diameter', radius * 2 + 'px')
      render(ball)
      node.dataset.placed = 'true'
      balls.set(technology.id, ball)
      Composite.add(engine.world, body)
      queued.shift()
      break
    }
  }

  function nudge(now: number) {
    if (!pointer || pointer.expires < now || held) return
    for (const { body, radius } of balls.values()) {
      const dx = body.position.x - pointer.x
      const dy = body.position.y - pointer.y
      const distance = Math.hypot(dx, dy)
      const reach = radius + 68
      if (distance >= reach || distance < .01) continue
      const falloff = 1 - Math.max(0, distance - radius * .5) / (reach - radius * .5)
      if (falloff < .1) continue
      const force = .0017 * body.mass * falloff ** 2 / distance
      if (body.isSleeping) Sleeping.set(body, false)
      Body.applyForce(body, body.position, { x: dx * force, y: dy * force })
    }
  }

  function tick(now: number) {
    frame = 0
    if (!visible) return
    remainder += lastTick ? Math.min(now - lastTick, step * 2) : step
    lastTick = now
    while (remainder >= step) {
      if (queued.length && engine.timing.timestamp >= nextDrop) {
        spawn()
        nextDrop = engine.timing.timestamp + 44
      }
      nudge(now)
      Engine.update(engine, step)
      for (const ball of balls.values()) keepInside(ball)

      const quiet = !held && !queued.length && (!pointer || pointer.expires < now) &&
        Array.from(balls.values()).every(({ body }) => body.speed < .13 && body.angularSpeed < .024)
      quietSteps = quiet ? quietSteps + 1 : 0
      if (quietSteps === 38) for (const { body } of balls.values()) Sleeping.set(body, true)
      remainder -= step
    }
    for (const ball of balls.values()) render(ball)
    drawScene()
    if (queued.length || held || Array.from(balls.values()).some(({ body }) => !body.isSleeping)) {
      frame = window.requestAnimationFrame(tick)
    }
  }

  function wake() {
    if (!visible || frame || !width || !height) return
    lastTick = 0
    remainder = 0
    quietSteps = 0
    frame = window.requestAnimationFrame(tick)
  }

  function releaseDrag() {
    const drag = held
    held = null
    if (!drag) return
    Composite.remove(engine.world, drag.constraint)
    delete arena.dataset.dragging
    if (arena.hasPointerCapture(drag.id)) arena.releasePointerCapture(drag.id)
  }

  function setVisible(next: boolean) {
    if (next === visible) return
    visible = next
    if (visible) {
      if (!graphicsRequested) {
        graphicsRequested = true
        void import("./stackRenderer").then(({ createStackRenderer }) => {
          if (disposed) return
          try { graphics = createStackRenderer(arena); graphics?.resize(width, height); drawScene() } catch { /* DOM spheres remain usable without WebGL. */ }
        })
      }
      wake()
      return
    }
    window.cancelAnimationFrame(frame)
    frame = 0
    pendingTouch = null
    pointer = null
    releaseDrag()
  }

  function resize(nextWidth: number, nextHeight: number) {
    if (nextWidth < 72 || nextHeight < 72 || (nextWidth === width && nextHeight === height)) return
    const previousWidth = width || nextWidth
    const previousHeight = height || nextHeight
    width = nextWidth
    height = nextHeight
    graphics?.resize(width, height)
    releaseDrag()

    const half = wallThickness / 2
    for (const wall of walls) Composite.remove(engine.world, wall)
    walls = [
      Bodies.rectangle(-half, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
      Bodies.rectangle(width + half, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
      Bodies.rectangle(width / 2, -half, width + wallThickness * 2, wallThickness, { isStatic: true }),
      Bodies.rectangle(width / 2, height + half, width + wallThickness * 2, wallThickness, { isStatic: true }),
    ]
    Composite.add(engine.world, walls)

    for (const ball of balls.values()) {
      const radius = diameter(ball.technology.size, width) / 2
      if (radius !== ball.radius) {
        Body.scale(ball.body, radius / ball.radius, radius / ball.radius)
        ball.radius = radius
        ball.node.style.setProperty('--ball-diameter', radius * 2 + 'px')
      }
      Body.setPosition(ball.body, {
        x: ball.body.position.x * width / previousWidth,
        y: ball.body.position.y * height / previousHeight,
      })
      keepInside(ball)
      Sleeping.set(ball.body, false)
      render(ball)
    }
    wake()
  }

  function setTechnologies(selection: readonly Technology[]) {
    const ids = new Set(selection.map(({ id }) => id))
    for (const [id, { body }] of balls) {
      if (ids.has(id)) continue
      if (held?.constraint.bodyB === body) releaseDrag()
      if (pendingTouch?.ball.body === body) pendingTouch = null
      Composite.remove(engine.world, body)
      balls.delete(id)
    }
    queued = selection.filter(({ id }) => !balls.has(id))
    for (const { id } of queued) {
      const node = nodes.get(id)
      if (node) delete node.dataset.placed
    }
    wake()
  }

  function localPoint(event: PointerEvent) {
    const bounds = arena.getBoundingClientRect()
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }

  function startDrag(event: PointerEvent, ball: Ball, point: Point) {
    pendingTouch = null
    pointer = null
    const constraint = Constraint.create({
      pointA: point,
      bodyB: ball.body,
      pointB: { x: point.x - ball.body.position.x, y: point.y - ball.body.position.y },
      length: 0,
      stiffness: .19,
      damping: .18,
    })
    held = { id: event.pointerId, constraint }
    arena.dataset.dragging = 'true'
    arena.setPointerCapture(event.pointerId)
    Sleeping.set(ball.body, false)
    Composite.add(engine.world, constraint)
    wake()
  }

  function onPointerDown(event: PointerEvent) {
    if (!visible || held || !event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return
    const node = event.target.closest<HTMLLIElement>('[data-technology]')
    const ball = node && balls.get(node.dataset.technology!)
    if (!ball) return
    const point = localPoint(event)
    if (Math.hypot(point.x - ball.body.position.x, point.y - ball.body.position.y) > ball.radius) return
    if (event.pointerType === 'touch') pendingTouch = { id: event.pointerId, ball, start: point }
    else startDrag(event, ball, point)
  }

  function onPointerMove(event: PointerEvent) {
    if (!visible || !event.isPrimary) return
    const point = localPoint(event)
    if (pendingTouch?.id === event.pointerId) {
      const { ball, start } = pendingTouch
      const dx = Math.abs(point.x - start.x)
      const dy = Math.abs(point.y - start.y)
      if (dy > 9 && dy > dx) pendingTouch = null
      else if (dx > 9 && dx > dy * 1.15) startDrag(event, ball, start)
    }
    if (held?.id === event.pointerId) {
      held.constraint.pointA.x = clamp(point.x, 0, width)
      held.constraint.pointA.y = clamp(point.y, 0, height)
      if (held.constraint.bodyB?.isSleeping) Sleeping.set(held.constraint.bodyB, false)
      wake()
    } else if (event.pointerType === 'mouse' && !held) {
      pointer = { ...point, expires: performance.now() + 90 }
      wake()
    }
  }

  function onPointerEnd(event: PointerEvent) {
    if (event.type === 'lostpointercapture' && event.target !== arena) return
    if (pendingTouch?.id === event.pointerId) pendingTouch = null
    if (held?.id === event.pointerId) releaseDrag()
  }

  function onPointerLeave() {
    pointer = null
  }

  arena.addEventListener('pointerdown', onPointerDown)
  arena.addEventListener('pointermove', onPointerMove)
  arena.addEventListener('pointerup', onPointerEnd)
  arena.addEventListener('pointercancel', onPointerEnd)
  arena.addEventListener('lostpointercapture', onPointerEnd)
  arena.addEventListener('pointerleave', onPointerLeave)

  function destroy() {
    disposed = true
    graphics?.destroy()
    setVisible(false)
    arena.removeEventListener('pointerdown', onPointerDown)
    arena.removeEventListener('pointermove', onPointerMove)
    arena.removeEventListener('pointerup', onPointerEnd)
    arena.removeEventListener('pointercancel', onPointerEnd)
    arena.removeEventListener('lostpointercapture', onPointerEnd)
    arena.removeEventListener('pointerleave', onPointerLeave)
    Composite.clear(engine.world, false, true)
    Engine.clear(engine)
    delete arena.dataset.physics
    for (const node of nodes.values()) {
      node.style.removeProperty('transform')
      node.style.removeProperty('--ball-diameter')
      node.style.removeProperty('--ball-angle')
      delete node.dataset.placed
    }
  }

  return { setTechnologies, resize, setVisible, destroy }
}
