import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import image1 from '../../public/assets/image1.png'
import image2 from '../../public/assets/image2.png'
import type { FluidReveal } from './hero/fluidReveal'

export type PortraitRevealHandle = {
  syncPointer: () => void
  setScrollProgress: (value: number) => void
}

// Drawn around the supplied VR portrait's hair and shoulders in its original frame.
const silhouette = 'M0 .973 C.039 .944 .085 .926 .153 .908 C.228 .885 .272 .862 .289 .83 L.292 .796 C.257 .802 .251 .776 .241 .761 C.233 .743 .231 .723 .228 .712 C.196 .698 .188 .672 .194 .647 C.169 .635 .167 .605 .172 .59 C.14 .577 .135 .548 .153 .528 C.129 .515 .138 .484 .149 .472 C.143 .452 .16 .434 .176 .423 C.155 .4 .165 .38 .181 .369 C.162 .345 .176 .32 .192 .307 C.185 .281 .209 .263 .241 .26 C.249 .239 .257 .222 .283 .222 C.278 .203 .296 .192 .313 .195 C.331 .177 .363 .194 .389 .178 C.4 .161 .429 .159 .447 .169 C.456 .148 .495 .136 .53 .145 C.559 .149 .577 .163 .588 .178 C.621 .167 .649 .178 .669 .194 C.694 .203 .706 .193 .723 .212 C.747 .217 .739 .241 .761 .256 C.792 .25 .814 .269 .831 .296 C.853 .31 .845 .331 .845 .339 C.872 .355 .857 .374 .87 .391 C.892 .419 .877 .435 .86 .45 C.886 .469 .88 .497 .867 .511 C.868 .543 .85 .556 .842 .574 C.86 .594 .847 .62 .821 .634 C.827 .656 .815 .684 .799 .698 C.812 .723 .79 .752 .764 .769 C.755 .798 .73 .81 .713 .822 C.72 .852 .757 .875 .828 .899 C.898 .919 .967 .934 1 .968 L1 1 H0 Z'

function supportsMask() {
  return window.CSS?.supports('mask-image', 'radial-gradient(transparent, black)') ?? false
}

export const PortraitReveal = forwardRef<PortraitRevealHandle>(function PortraitReveal(_, ref) {
  const frame = useRef<HTMLButtonElement>(null)
  const point = useRef<{ x: number; y: number } | null>(null)
  const fluid = useRef<FluidReveal | null>(null)
  const scrollProgress = useRef(0)
  const keyboard = useRef(false)
  const [centered, setCentered] = useState(false)
  const [maskAvailable] = useState(supportsMask)

  const resetPointer = useCallback(() => {
    point.current = null
    if (frame.current) delete frame.current.dataset.pointer
  }, [])

  const syncPointer = useCallback(() => {
    fluid.current?.syncPointer()
    const element = frame.current
    const latest = point.current
    if (!element || !latest) return

    const rect = element.getBoundingClientRect()
    const x = (latest.x - rect.left) / rect.width
    const y = (latest.y - rect.top) / rect.height
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
      resetPointer()
      return
    }

    // Mask coordinates belong to the unscaled layer, while Pointer Events use screen coordinates.
    element.style.setProperty('--reveal-x', (x * element.offsetWidth) + 'px')
    element.style.setProperty('--reveal-y', (y * element.offsetHeight) + 'px')
  }, [resetPointer])

  useImperativeHandle(ref, () => ({
    syncPointer,
    setScrollProgress(value) {
      scrollProgress.current = value
      fluid.current?.setScrollProgress(value)
    },
  }), [syncPointer])

  useEffect(() => {
    keyboard.current = centered
    fluid.current?.setKeyboard(centered)
  }, [centered])

  useEffect(() => {
    const element = frame.current
    if (!element || !maskAvailable) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false, generation = 0
    async function initialize() {
      const ticket = ++generation
      fluid.current?.destroy()
      fluid.current = null
      if (motion.matches || !element) return
      try {
        const [{ createFluidReveal }, { createSvgFluidSpread }] = await Promise.all([
          import('./hero/fluidReveal'),
          import('./hero/svgFluidSpread'),
          Promise.all(Array.from(element.querySelectorAll('img'), image => image.decode())),
          document.fonts.ready,
        ])
        if (disposed || ticket !== generation || motion.matches) return
        const fallback = () => {
          if (disposed || ticket !== generation || motion.matches) return
          fluid.current?.destroy()
          fluid.current = createSvgFluidSpread(element)
          fluid.current.setKeyboard(keyboard.current)
        }
        fluid.current = createFluidReveal(element, silhouette, scrollProgress.current, fallback)
        if (!fluid.current) fallback()
        fluid.current?.setKeyboard(keyboard.current)
      } catch {
        // Original DOM images and the existing organic SVG scroll masks remain usable.
      }
    }
    void initialize()
    const update = () => { void initialize() }
    motion.addEventListener('change', update)
    return () => {
      disposed = true
      generation++
      motion.removeEventListener('change', update)
      fluid.current?.destroy()
      fluid.current = null
    }
  }, [maskAvailable])

  useEffect(() => {
    window.addEventListener('resize', syncPointer)
    window.addEventListener('scroll', syncPointer, { passive: true })
    return () => {
      window.removeEventListener('resize', syncPointer)
      window.removeEventListener('scroll', syncPointer)
    }
  }, [syncPointer])

  function reveal(event: PointerEvent<HTMLButtonElement>) {
    if (!maskAvailable) return
    point.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.dataset.pointer = event.pointerType === 'touch' ? 'touch' : 'mouse'
    syncPointer()
  }

  return (
    <div className="portrait">
      <svg className="portrait-cutout" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
        <defs><clipPath id="portrait-silhouette" clipPathUnits="objectBoundingBox"><path d={silhouette} /></clipPath></defs>
        <path d={silhouette} transform="translate(.004 -.004)" vectorEffect="non-scaling-stroke" />
      </svg>
      <button
        className="portrait-frame"
        ref={frame}
        type="button"
        disabled={!maskAvailable}
        aria-label="Reveal Muhammad Sajid Durrani’s portrait"
        aria-describedby="portrait-description portrait-instructions"
        aria-pressed={centered}
        onPointerEnter={(event) => { if (event.pointerType !== 'touch') reveal(event) }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'touch' || event.currentTarget.hasPointerCapture(event.pointerId)) reveal(event)
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch' || !event.isPrimary || !maskAvailable) return
          setCentered(false)
          event.currentTarget.setPointerCapture(event.pointerId)
          reveal(event)
        }}
        onPointerUp={(event) => { if (event.pointerType === 'touch' && event.isPrimary) resetPointer() }}
        onPointerLeave={(event) => { if (event.isPrimary) resetPointer() }}
        onPointerCancel={(event) => { if (event.isPrimary) resetPointer() }}
        onLostPointerCapture={(event) => { if (event.isPrimary) resetPointer() }}
        onClick={(event) => {
          // Native button activation covers keyboard and assistive technology.
          if (event.detail === 0) {
            resetPointer()
            setCentered((open) => !open)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            resetPointer()
            setCentered(false)
          }
        }}
        onBlur={() => setCentered(false)}
      >
        <span className="portrait-composite">
          <span className="portrait-layer portrait-bottom">
            <img src={image2} width="1086" height="1448" alt="Muhammad Sajid Durrani with curly hair and a black turtleneck" decoding="async" draggable={false} />
          </span>
          <span className="portrait-layer portrait-top">
            <img src={image1} {...{ fetchpriority: 'high' }} width="1122" height="1402" alt="Black stone portrait wearing VR goggles with red fissures" decoding="async" draggable={false} />
          </span>
        </span>
      </button>
    </div>
  )
})
