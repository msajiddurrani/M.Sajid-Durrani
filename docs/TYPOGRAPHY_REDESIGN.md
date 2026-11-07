# Hero, typography and continuous Work refinement

The subsequent compact Work layout and animated About objects are documented in [PERFORMANCE_AND_3D_REPORT.md](PERFORMANCE_AND_3D_REPORT.md). Its gallery sizing and performance changes supersede the Work layout described below.

Implemented in the existing React + TypeScript repository.

## Opening screen

The original VR portrait is the root landing screen. Browser scroll restoration is manual on fresh root visits/reloads. Existing explicit section links still work. The asset-ready fluid entrance briefly passes over the portrait and returns to the helmet, rather than leaving the real portrait displayed. Localized fluid hover, original image assets and the established hero scroll transformation are preserved. Hero role lines use the original Archivo typography again.

## Typography

Bricolage and the recessed duplicate/shadow treatment have been removed. Main chapter headings now pair self-hosted Barlow Condensed with an Instrument Serif italic accent. Their font shapes stay fixed throughout the animation.

GSAP ScrollTrigger animates opposing word entrances and individual masked letters. Each character unfolds through shallow 3D perspective and settles into its final baseline. This sequence is reversible, has a short 0.18-second scrub catch-up, and creates no additional pinned scenes. Font-load refreshes are coalesced, resize handling remains active, and all styles/listeners are reverted on cleanup. Reduced motion produces static text with one accessible heading name.

## Work

Removed the previous 64-percent hold plus accelerated transition for each card. A single linear GSAP track now follows every vertical scroll increment, forward or backward, with `scrub: true`, no snapping, no hold segments and no delayed catch-up. The sequence releases directly after the last card.

Project controls and arrow keys navigate to exact card positions. All five projects, descriptions, technologies and existing verified destinations remain. Original missing live URLs remain honestly disabled.

The composition uses aligned, subtly textured frames in place of tilted multi-layer plates, smaller ordinal labels, larger clear project names and consistent project action buttons. The mobile artwork is enlarged to make better use of each full-screen card. Reduced-motion and short-height layouts retain the natural document flow.

## Changed files

- `package.json`, `package-lock.json`: replace Bricolage with the two self-hosted font packages.
- `src/main.tsx`: font imports and root scroll-restoration behavior.
- `src/typography.css`: new type system and cleaner project composition.
- `src/components/ui/KineticWord.tsx`: masked letter markup.
- `src/components/ui/ScrollHeading.tsx`, `MotionHeading.tsx`, `useHeadingMotion.ts`: GSAP heading choreography.
- `src/components/SelectedWork.tsx`: continuous linear gallery and exact-position controls.
- `src/components/hero/fluidReveal.ts`: entrance returns to VR.
- `tests/chapters.spec.ts`, `fluid-hero.spec.ts`, `typography.spec.ts`, `continuous-work.spec.ts`: updated behavior checks and new scroll-continuity/root-reload coverage.

The original portrait PNGs, portfolio source data, repository remotes and deployment configuration were preserved. Other pre-existing checkout changes are outside this refinement.

## Verification

- TypeScript: passed.
- Lint: passed.
- Production build: passed; the existing lazy Three.js stack-renderer chunk still triggers Vite's size advisory.
- Desktop/mobile visual review: original VR portrait at rest, editorial heading typography, clean project compositions, no horizontal overflow; continuous gallery movement sampled in both viewport sizes.
- Final production-preview browser run: **44 passed**. Covers opposing and individual-letter GSAP animation, responsive heading bounds at 320–2560px, reduced motion, forward/reverse continuous scrolling, all five cards and their controls, root reload to VR, localized fluid hover, original image hashes, touch gestures, keyboard navigation, physics behavior and WCAG accessibility analysis.
- Manual resize/runtime-motion review: gallery remains aligned when resizing from desktop to tablet and when toggling reduced motion. Landscape headings sit clear of the fixed navigation.

Local preview: http://localhost:5173/ (open the root URL to begin on the VR portrait).
