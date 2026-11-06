import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import image1Small from '../assets/image1-640.webp'
import image1Large from '../assets/image1-1080.webp'
import image2Small from '../assets/image2-640.webp'
import image2Large from '../assets/image2-1080.webp'

const sizes = '(max-width: 500px) 94vw, (max-width: 700px) 470px, (max-width: 925px) 67vw, 620px'

// Drawn around the supplied VR portrait's hair and shoulders in its original frame.
const silhouette = 'M0 .973 C.039 .944 .085 .926 .153 .908 C.228 .885 .272 .862 .289 .83 L.292 .796 C.257 .802 .251 .776 .241 .761 C.233 .743 .231 .723 .228 .712 C.196 .698 .188 .672 .194 .647 C.169 .635 .167 .605 .172 .59 C.14 .577 .135 .548 .153 .528 C.129 .515 .138 .484 .149 .472 C.143 .452 .16 .434 .176 .423 C.155 .4 .165 .38 .181 .369 C.162 .345 .176 .32 .192 .307 C.185 .281 .209 .263 .241 .26 C.249 .239 .257 .222 .283 .222 C.278 .203 .296 .192 .313 .195 C.331 .177 .363 .194 .389 .178 C.4 .161 .429 .159 .447 .169 C.456 .148 .495 .136 .53 .145 C.559 .149 .577 .163 .588 .178 C.621 .167 .649 .178 .669 .194 C.694 .203 .706 .193 .723 .212 C.747 .217 .739 .241 .761 .256 C.792 .25 .814 .269 .831 .296 C.853 .31 .845 .331 .845 .339 C.872 .355 .857 .374 .87 .391 C.892 .419 .877 .435 .86 .45 C.886 .469 .88 .497 .867 .511 C.868 .543 .85 .556 .842 .574 C.86 .594 .847 .62 .821 .634 C.827 .656 .815 .684 .799 .698 C.812 .723 .79 .752 .764 .769 C.755 .798 .73 .81 .713 .822 C.72 .852 .757 .875 .828 .899 C.898 .919 .967 .934 1 .968 L1 1 H0 Z'

function supportsMask() {
  return window.CSS?.supports('mask-image', 'radial-gradient(transparent, black)') ?? false
}

export function PortraitReveal() {
  const frame = useRef<HTMLButtonElement>(null)
  const point = useRef<{ x: number; y: number } | null>(null)
  const [centered, setCentered] = useState(false)

  function position(x: number, y: number) {
    const element = frame.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--reveal-x', (x - rect.left) + 'px')
    element.style.setProperty('--reveal-y', (y - rect.top) + 'px')
  }

  useEffect(() => {
    function followViewport() {
      const latest = point.current
      if (latest) position(latest.x, latest.y)
    }

    window.addEventListener('resize', followViewport)
    window.addEventListener('scroll', followViewport, { passive: true })
    return () => {
      window.removeEventListener('resize', followViewport)
      window.removeEventListener('scroll', followViewport)
    }
  }, [])

  function reveal(event: PointerEvent<HTMLButtonElement>) {
    point.current = { x: event.clientX, y: event.clientY }
    position(event.clientX, event.clientY)
    event.currentTarget.dataset.pointer = event.pointerType === 'touch' ? 'touch' : 'mouse'
  }

  function resetPointer() {
    point.current = null
    if (frame.current) delete frame.current.dataset.pointer
  }

  return (
    <div className="portrait">
      <svg className="portrait-cutout" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
        <defs><clipPath id="portrait-silhouette" clipPathUnits="objectBoundingBox"><path d={silhouette} /></clipPath></defs>
        <path d={silhouette} transform="translate(.009 -.011)" vectorEffect="non-scaling-stroke" />
      </svg>
      <button
        className="portrait-frame"
        ref={frame}
        type="button"
        aria-label="Reveal Muhammad Sajid Durrani’s portrait"
        aria-describedby="portrait-description portrait-instructions"
        aria-pressed={centered}
        onPointerEnter={(event) => { if (event.pointerType !== 'touch') reveal(event) }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'touch' || event.currentTarget.hasPointerCapture(event.pointerId)) reveal(event)
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch' || !event.isPrimary || !supportsMask()) return
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
          if (event.detail === 0 || !supportsMask()) {
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
          <span className="portrait-backing" />
          <span className="portrait-layer portrait-bottom">
            <img src={image2Small} srcSet={image2Small + ' 640w, ' + image2Large + ' 1080w'} sizes={sizes} width="1086" height="1448" alt="Muhammad Sajid Durrani with curly hair and a black turtleneck" decoding="async" draggable={false} />
          </span>
          <span className="portrait-layer portrait-top">
            <img src={image1Small} srcSet={image1Small + ' 640w, ' + image1Large + ' 1080w'} sizes={sizes} width="1122" height="1402" alt="Black stone portrait wearing VR goggles with red fissures" decoding="async" draggable={false} />
          </span>
        </span>
      </button>
    </div>
  )
}
