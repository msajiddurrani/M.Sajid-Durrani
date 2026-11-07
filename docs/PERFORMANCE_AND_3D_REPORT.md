# Compact Work gallery and animated 3D disciplines

The subsequent vertical 3D Work implementation is documented in [VERTICAL_3D_WORK.md](VERTICAL_3D_WORK.md). It supersedes the horizontal gallery described here; the animated About objects remain in place.

Implemented in the existing portfolio. Original images, project data, verified links, hero, heading typography, stack and deployment configuration are preserved.

## About objects

- Design: three separated interface planes with toolbar/content geometry and a moving coral pointer.
- Engineer: three six-sided server blocks, code faces, status lights and animated packets between services.
- Intelligence: an extruded processor with a dimensional core and three rotating orbital paths/nodes.

These are original CSS 3D objects with real front/back/side faces and perspective transforms, rather than the previous flat SVG diagrams. They require no additional WebGL context or dependencies. Intersection and document-visibility observers pause animations outside the viewport or hidden tab. Reduced motion retains a static dimensional scene. All decorative geometry is hidden from assistive technology.

## Compact Work

Desktop: a centered gallery capped at 1000px wide and 620px high, pinned below the fixed navigation. At 1440 x 900 the old card occupied the 1440 x 900 viewport; the new gallery occupies 1000 x 620. Titles, diagrams, padding and controls are scaled to this smaller composition. Every project and outbound action remains available.

Mobile/tablet and short screens: a native horizontal swipe rail replaces the pinned scroll sequence. It supports arrow controls, keyboard use and touch scrolling while vertical swipes continue through the page naturally. Reduced motion uses the same accessible native rail.

Desktop scrolling remains linear, reversible and free of hold segments or snapping. The scroll distance is shorter than the prior full-screen sequence.

## Performance changes

The former progress update set an inherited CSS custom property on the entire gallery every animation frame. It now updates only the progress bar's compositor transform through a GSAP quick setter. Active-card selection uses timeline progress instead of reading layout width and track position each frame.

Work's tiled SVG turbulence texture is rasterized once into `grain-tile.png`. The moving area is smaller, each card contains layout/paint, and the track gets a compositor hint only while pinned. About animations pause when out of view.

Comparable local Chrome runs at 1440 x 900, without CPU throttling, sampled 100 animation-frame scroll increments of 12px. The first five intervals were excluded from frame statistics:

| Metric | Before | After first implementation |
| --- | ---: | ---: |
| Median frame interval | 29ms | 16.7ms |
| 95th percentile frame interval | 66.6ms | 17.2ms |
| Layout count | 101 | 2 |
| Layout time | 35.2ms | 1.8ms |
| Main-thread task time | 1078ms | 373ms |

These are local comparison measurements, not a frame-rate guarantee for every device. The final patch additionally fixes offscreen orbital-animation pausing.

A final repeat after the pause fix measured a 16.7ms median, 19.9ms 95th percentile and 2 layouts taking 2.0ms. Frame timing varies with system load; both updated runs removed the original repeated layout work.

## Files changed for this request

- `src/components/About.tsx`: replace flat discipline diagrams.
- `src/components/DisciplineObject.tsx`, `discipline-objects.css`: 3D objects, motion and visibility lifecycle.
- `src/components/SelectedWork.tsx`: compact responsive gallery, native mobile rail and compositor-only progress updates.
- `src/work-gallery.css`, `src/main.tsx`: gallery presentation and stylesheet import.
- `src/assets/grain-tile.png`: pre-rasterized existing paper grain.
- `tests/chapters.spec.ts`, `continuous-work.spec.ts`, `portfolio.spec.ts`, `discipline-objects.spec.ts`: compact bounds, all project actions, continuous desktop motion, native touch behavior and 3D lifecycle coverage.

## Verification

TypeScript, lint and production build passed. Desktop/mobile screenshots reviewed at 1440, 1024, 390 and 320px. **All 47 production-preview browser tests passed**, covering compact bounds and every project action, reversible desktop motion, mobile horizontal/vertical gestures, CSS 3D geometry and offscreen pausing, reduced motion, WCAG accessibility and the existing hero/stack/footer regressions.

The final manual resize review also passed: desktop to mobile, native Next control, desktop restoration, and runtime reduced-motion changes remained bounded and functional without horizontal page overflow.

Preview: http://localhost:5173/
