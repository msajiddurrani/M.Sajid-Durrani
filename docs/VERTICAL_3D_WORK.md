# Vertical 3D Selected Work

Replaced the Work carousel with five vertical project chapters in the existing portfolio. There is no horizontal rail, pagination, slide control, snapping or Work pin. Native page scrolling controls GSAP reveals and the assembly/rotation of each 3D object.

## Project scenes

| Project | Original modeled graphics |
| --- | --- |
| Dentora | Beveled molar, a three-dimensional dental arch, chart document and moving scanner ring |
| Axiom AI | Repository document stack, physical vector-index lattice, faceted inference core and moving retrieval packets |
| SOP Forge | Layered policy pages, extruded shield/checkmark and validation pipeline |
| TerraSphere | Dimensional globe, coordinate grid, decorative land-point clusters and an orbiting satellite |
| Savyora Fitness | Assembling dumbbell plates, metal shaft and a membership card |

These are actual Three.js geometry, materials and lighting, not flat illustrations mapped onto cards. The globe's land points are a stylized graphic, not a live geospatial dataset. No original portrait or portfolio source data was replaced.

## Animation and performance

A single lazy-loaded viewport-sized WebGL renderer uses scissored views for all five chapters. It renders only visible scene rectangles, rather than allocating five canvases. The main Three.js implementation is shared with the existing Technology Stack renderer. No new dependency was installed.

GSAP ScrollTrigger synchronizes each chapter's object assembly and view rotation with normal vertical scrolling. Text enters with short masked movement. Scrolling backward reverses the sequence. Details expansion refreshes trigger geometry; resize and font-load refreshes update placement. Mouse parallax is subtle and never captures touch scrolling.

Idle 3D rendering is limited to roughly 30 updates per second, rising during scrolling. Pixel ratio is capped at 1.35 on desktop and 1.1 on narrow screens, with a total 2.4-megapixel render-buffer budget for large displays. The renderer pauses and hides offscreen, when no project scene is visible, or in a hidden document. It uses no postprocessing, shadow maps or external textures. Repeated teeth, document lines, vector cells and decorative land points use instanced geometry to reduce draw calls.

Reduced motion retains static 3D models with readable text and no idle motion. Context loss or unavailable WebGL reveals dimensional CSS fallback objects; project details, keyboard actions and links stay usable. Unmount disposes scenes, renderer resources, observers, event listeners and GSAP contexts.

## Preserved content

All five project descriptions, technologies, architecture notes and verified actions remain in the vertical chapters. Missing public live URLs remain clearly unavailable. The hero, original portrait PNGs, About objects, Stack, experience/education, footer design and slower signature timing are preserved. Navigation stays readable over the dark Work section.

## Changed files for this request

- `src/components/SelectedWork.tsx`: vertical semantic project chapters and lazy renderer lifecycle.
- `src/components/work/projectModels.ts`: five original procedural 3D models.
- `src/components/work/projectWorld.ts`: shared renderer, GSAP choreography, visibility/performance and fallback lifecycle.
- `src/work-gallery.css`: vertical responsive presentation and dimensional fallback.
- `src/components/SiteNavigation.tsx`: remove the obsolete light-slide color override.
- `src/App.tsx`: clear old ScrollTrigger scroll memory after startup layout so root reloads reliably reopen on the VR hero.
- `tests/chapters.spec.ts`, `continuous-work.spec.ts`, `portfolio.spec.ts`: replace carousel-specific checks with vertical flow and native touch/keyboard coverage.
- `tests/project-world.spec.ts`: rendered geometry, distinct project scenes, motion, offscreen pausing, reduced motion and WebGL-failure coverage.

## Verification

- TypeScript: passed.
- Lint: passed.
- Production build: passed. Vite retains an advisory for the lazy shared Three.js chunk; the small project-scene module remains separately deferred.
- Focused vertical/3D browser checks: 12 passed.
- Desktop and mobile render captures reviewed at 1440 and 390px; bounds checked at 320, 390, 1024 and 1440px.
- Full production-preview run: 51 passed; one About-object check timed out during an interrupted run and passed on an isolated rerun. All 52 distinct browser checks were verified, including vertical native touch flow, keyboard project actions, rendered geometry, graphics context loss, reduced motion, WCAG analysis, original portrait hashes and the existing hero/Stack/footer behavior.
- Root-reload stress check: six consecutive reloads passed after clearing saved ScrollTrigger positions during startup.
- Final instanced-geometry scene checks: all three project-renderer tests passed again after the GPU batching optimization. Lint and the production build also passed with the final sources.
- Final manual review: resizing desktop to 390px retained all five scene registrations without horizontal overflow; reduced motion stopped idle rendering, and restoring motion restarted it.
- Local unthrottled Chrome scroll profile at 1440 × 900, 100 animation-frame increments of 9px (first five intervals excluded): before batching, median 24.5ms and 95th percentile 26.6ms; after batching, median 16.6ms and 95th percentile 18ms. The final sample recorded seven layouts taking 1.9ms total. These are local measurements, not a frame-rate guarantee on every device.

API references: [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Three.js multiple scenes](https://threejs.org/manual/#en/multiple-scenes), [Three.js renderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer).

Preview: http://localhost:5173/
