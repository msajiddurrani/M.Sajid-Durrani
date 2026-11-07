import {
  AmbientLight, CanvasTexture, CircleGeometry, DirectionalLight, ExtrudeGeometry,
  Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera,
  PlaneGeometry, Scene, Shape, SphereGeometry, SRGBColorSpace, WebGLRenderer,
} from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { brandSurfaces, neutralSurface } from '../../data/brandSurfaces'
import type { Technology } from '../../data/techStack'

export type BallPose = { technology: Technology; x: number; y: number; radius: number; angle: number }

/** On-demand rendering shares Matter's clock: no second perpetual animation loop. */
export function createStackRenderer(arena: HTMLUListElement) {
  const canvas = document.createElement('canvas')
  canvas.className = 'stack-scene'
  canvas.setAttribute('aria-hidden', 'true')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' })
  if (!context) return null
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = SRGBColorSpace
  const scene = new Scene()
  const camera = new OrthographicCamera(0, 1, 1, 0, .1, 10000)
  camera.position.z = 5000
  scene.add(new AmbientLight(0xf2f0eb, 1.6))
  const key = new DirectionalLight(0xffffff, 2.8)
  key.position.set(-300, 700, 900)
  scene.add(key)
  const rim = new DirectionalLight(0xf2f0eb, 1.8)
  rim.position.set(900, 150, 400)
  scene.add(rim)

  const sphere = new SphereGeometry(1, 32, 24)
  const shadowGeometry = new CircleGeometry(1, 32)
  const objects = new Map<string, Group>()
  const loading = new Set<string>()
  const pending = new Set<Group>()
  const nodes = new Map(Array.from(arena.querySelectorAll<HTMLElement>('[data-technology]'), n => [n.dataset.technology!, n]))
  let disposed = false
  let lost = false
  let poses: BallPose[] = []
  let width = 1, height = 1

  function paint() {
    if (disposed || lost || document.hidden) return
    for (const [id, group] of objects) {
      const pose = poses.find(p => p.technology.id === id)
      group.visible = !!pose
      if (!pose) continue
      group.position.set(pose.x, height - pose.y, 0)
      const inspected=nodes.get(id)?.matches(":hover, :focus-visible")
      group.scale.setScalar(pose.radius * (inspected ? 1.005 : .965))
      const face = group.getObjectByName('relief')!
      face.rotation.set((inspected ? -.2 : -.12) + Math.sin(pose.angle * .7) * .08, (inspected ? .05 : .16) + Math.cos(pose.angle * .65) * .1, -pose.angle)
    }
    renderer.render(scene, camera)
  }

  async function build(technology: Technology) {
    loading.add(technology.id)
    const group = new Group()
    pending.add(group)
    const surface=brandSurfaces[technology.id]??neutralSurface
    const bodyMaterial = new MeshStandardMaterial({
      color: surface.color,
      metalness: .22, roughness: .38,
    })
    group.add(new Mesh(sphere, bodyMaterial))
    const shadow = new Mesh(shadowGeometry, new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28 }))
    shadow.position.set(.09, -.10, -1.02)
    shadow.scale.set(1.02, .96, 1)
    group.add(shadow)
    const relief = new Group()
    relief.name = 'relief'
    if (technology.logo) {
      const text = await fetch(technology.logo).then(response => {
        if (!response.ok) throw new Error('Logo unavailable')
        return response.text()
      })
      if (disposed || lost) return
      const data = new SVGLoader().parse(text)
      const viewBox = data.xml.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number) ?? [0, 0, 128, 128]
      const [left, top, w, h] = viewBox
      const size = Math.max(w, h)
      const artwork = new Group()
      artwork.scale.set(1.22 / size, -1.22 / size, 1.22 / size)
      artwork.position.set(-(left + w / 2) * 1.22 / size, (top + h / 2) * 1.22 / size, 1.015)
      for (const [index, path] of data.paths.entries()) {
        const front = SVGLoader.createFillMaterial(path)
        if (!front) continue
        let shapes = path.toShapes()
        if (technology.id==='typescript') {
          // This official SVG represents TS as holes in a blue plate over a white rectangle.
          // Extrude the original hole contours so only the letters sit on the blue sphere.
          if (front.color.getHexString()!=='007acc') { front.dispose(); continue }
          shapes=shapes.flatMap(shape=>shape.holes.map(hole=>new Shape(hole.getPoints(12))))
          front.color.set('#ffffff')
        } else if (surface.skipFill && !front.map && front.color.getHexString()===surface.skipFill) { front.dispose(); continue }
        if (surface.monochrome) front.color.set(surface.monochrome)
        if (!shapes.length) { front.dispose(); continue }
        const edge = new MeshStandardMaterial({ color: surface.monochrome??path.color, roughness: .35, metalness: .12 })
        const geometry = new ExtrudeGeometry(shapes, {
          depth: size * .055, steps: 1, curveSegments: 6,
          bevelEnabled: true, bevelSegments: 1, bevelSize: size * .002, bevelThickness: size * .002,
        })
        const mesh = new Mesh(geometry, [front, edge])
        mesh.position.z = index * size * .0003
        mesh.renderOrder = index
        artwork.add(mesh)
      }
      relief.add(artwork)
    } else {
      const label = document.createElement('canvas')
      label.width = 256; label.height = 128
      const ctx = label.getContext('2d')!
      ctx.fillStyle = '#f2f0eb'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = 'bold ' + (technology.mark!.length > 4 ? 54 : 74) + 'px monospace'
      ctx.fillText(technology.mark!, 128, 64)
      const texture = new CanvasTexture(label)
      texture.colorSpace = SRGBColorSpace
      const mark = new Mesh(new PlaneGeometry(1.4, .7), new MeshBasicMaterial({ map: texture, transparent: true }))
      mark.position.z = 1.02
      relief.add(mark)
    }
    group.add(relief)
    pending.delete(group)
    objects.set(technology.id, group)
    scene.add(group)
    nodes.get(technology.id)!.dataset.three = 'true'
    paint()
  }

  function fallback() {
    lost = true
    for (const node of nodes.values()) delete node.dataset.three
    canvas.style.display = 'none'
  }
  const inspectionEvents=['pointerover','pointerout','focusin','focusout'] as const
  for(const event of inspectionEvents) arena.addEventListener(event,paint)
  canvas.addEventListener('webglcontextlost', fallback)
  arena.parentElement!.insertBefore(canvas, arena)
  return {
    update(next: BallPose[]) {
      if (lost) return
      poses = next
      for (const pose of poses) if (!objects.has(pose.technology.id) && !loading.has(pose.technology.id)) {
        void build(pose.technology).catch(() => { /* Keep the original DOM logo if its relief cannot load. */ })
      }
      paint()
    },
    resize(w: number, h: number) {
      width = w; height = h
      renderer.setSize(width, height, false)
      canvas.style.height = height + 'px'
      camera.right = width; camera.top = height
      camera.updateProjectionMatrix()
      paint()
    },
    destroy() {
      disposed = true
      fallback()
      for(const event of inspectionEvents) arena.removeEventListener(event,paint)
      canvas.removeEventListener('webglcontextlost', fallback)
      for (const group of pending) scene.add(group)
      pending.clear()
      scene.traverse(object => {
        if (!(object instanceof Mesh)) return
        if (object.geometry !== sphere && object.geometry !== shadowGeometry) object.geometry.dispose()
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          if ('map' in material) (material as MeshBasicMaterial).map?.dispose()
          material.dispose()
        }
      })
      sphere.dispose(); shadowGeometry.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
