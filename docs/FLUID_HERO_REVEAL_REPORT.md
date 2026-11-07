# Fluid hero reveal implementation — 7 November 2026

Implemented in the existing sajid-editorial-portfolio-2026 repository.

## Reference inspection

Read the entire supplied CODEX_FLUID_HERO_REVEAL_MASTER_PROMPT.md and READ_ME_FIRST.txt. Inspected both supplied storyboards, full-size source stills, and additional frames decoded from both actual MP4 recordings using Chrome's video decoder.

- Video One: 1920×874, 11.135979 seconds. Additional decoded/inspected times: 0.35, 1.10, 2.10, 3.35, 5.20, 6.30, 8.10 and 10.20 seconds.
- Video Two: 1920×894, 4.949313 seconds. Additional decoded/inspected times: 0.18, 0.46, 1.15, 1.75, 2.30, 3.20 and 4.20 seconds.

Inspection used seeked decoded frames rather than claiming continuous real-time playback. The frame-export canvas was origin-tainted for local file video, so Chrome screenshots of the decoded video element were used instead. Supplied reference media remains under ignored .qa/fluid-hero-package and is not shipped.

Video One informed simultaneous helmet/face regions, uneven ribbons, connected lobes and smooth local optical disturbance. Video Two established the retained dark contour background, identity, original images, image registration, red/ivory headings and compact scrolled composition.

## Actual implementation

A small, deferred raw-WebGL layer renders the two original images in the existing portrait frame. Both textures retain the existing framing: the sculpture uses the existing silhouette, and the actual portrait uses the current .92 scale / 1.7% horizontal / 8.2% vertical registration. Precompositing to transparent texture canvases preserves those transforms; the original PNG files are untouched.

The fragment shader builds a coherent domain-warped field with broad flow and two interacting, unequal sheets. An anti-aliased spatial threshold interleaves the images; modest opposing UV offsets near its boundaries provide local refraction. This is not a global opacity transition, a rectangular strip list or a directional wipe.

The asset-ready entrance runs automatically with no input and settles on the real portrait. It does not change the opening layout or reveal typography ahead of the original scroll timeline. On the first meaningful scroll, a damped handoff yields image control to the existing scroll progression; its scale, pin duration, masked heading entrance and downstream section timing are unchanged. Reversing scroll still reconstructs the original helmet state, without replaying the entrance.

The latest hover is deliberately small and cursor-local. A domain-warped wetting front animates inside an irregular envelope capped at 46 CSS pixels radius on desktop and 32 on narrow screens, with a proportional cap on very small portrait frames. The envelope follows the current cursor, restores the previous spot when it moves, and never spreads into the rest of the sculpture. Local ripples and refraction remain bounded to that envelope. Exit retracts the reveal. Both WebGL and the DOM-mask fallback use this behavior. The automatic entrance and original scroll progression are unchanged.

The existing FULL-STACK DEVELOPER and AI ENGINEER lines receive localized glyph translation and small rotation near the pointer. No WE ARE title was invented. Original real text remains available to accessibility APIs. Measured character ranges keep the existing font, kerning, line breaks and paragraph geometry; visual glyph clones are aria-hidden. Nearby headline interaction can emit a low-amplitude portrait ripple.

## Files changed

Modified:
- src/components/EditorialMasthead.tsx — one image-progress forwarding call in the existing onUpdate; no timeline or layout changes.
- src/components/PortraitReveal.tsx — asset readiness, scoped controller lifecycle, reduced-motion and keyboard wiring.
- src/hero.css — canvas layering and measured glyph presentation only.
- tests/portfolio.spec.ts — localized fluid pixel check and retained scaled-pointer alignment check.

Added:
- src/components/hero/fluidReveal.ts — raw WebGL lifecycle, texture registration, GSAP-driven entrance, damped pointer/ripple state, visibility/resize cleanup.
- src/components/hero/fluidShader.ts — spatial field, anti-aliased mask and local UV refraction.
- src/components/hero/headlineFluid.ts — accessible measured glyph overlays with local motion and complete restoration.
- src/components/hero/svgFluidSpread.ts — a 96×120 procedural mask-field fallback with the same outward spread and retraction when WebGL is unavailable or lost.
- tests/fluid-hero.spec.ts — six dedicated browser checks.
- tests/fluid-spread.spec.ts — pixel checks proving that the cursor area reveals the photo, a distant area remains sculpture after a sustained hover, and moving the cursor restores the previous spot, in both WebGL and fallback rendering.
- docs/FLUID_HERO_REVEAL_REPORT.md — this report.

A before/after SHA-256 scope audit found no removals and no changes in 17 protected files, including About, Work, Stack, Record, Footer, navigation, the existing contour field, shared section scroll headings, portfolio data and both original images. No dependencies, deployment configuration, repository remotes or external accounts were changed.

## Performance, cleanup and fallback

No additional animation or graphics dependency was installed. The deferred hero module is approximately 5.6KB gzip and the fallback approximately 1.7KB gzip. Its render updates use the existing GSAP ticker, with a desktop paint target near 60fps and a mobile target near 30fps. Pixel ratio is capped at 1.4 desktop / 1.25 mobile. Fully spread stationary hover and completed retraction stop rendering. These are scheduling targets, not guarantees for every device.

Rendering stops after the entrance and pointer decay, and pauses offscreen or in hidden tabs. Resize remeasures the original glyph ranges and artwork bounds. Teardown removes ticker callbacks, tweens, observers, listeners, textures, buffers, shaders and the GL program, and releases the context. Strict Mode asynchronous initialization is generation-guarded.

Reduced motion keeps the original stable DOM presentation and existing manual controls. If WebGL is unavailable or its context is lost, a small CPU-generated mask field retains the spreading hover over the original DOM images and existing SVG scroll masks. Typography and navigation remain usable. That fallback does not provide shader refraction or the automatic GPU entrance. Browser checks used Chrome with desktop/mobile emulation; physical devices and other browser engines were not exercised.

## Tuning

- fluidReveal.ts / fluidSettings: entranceSeconds 1.8, stablePaintSeconds .16, pointerDamping 11, pixelRatio 1.4.
- Spreading hover rates: spreadIn 2.8 / spreadOut 2.2 per second; fallback uses matching rates. fluidShader.ts / wettingArrival() controls the branching front's travel resistance.
- Local hover envelope: hoverRadius 46 / touchRadius 32 CSS pixels, capped to 16% of the current portrait width. The fallback mask is explicitly sized to the frame and does not tile.
- fluidShader.ts / liquid(): broad field and sheet frequency/amplitude determine region shapes and non-uniformity.
- fluidShader.ts / aa: .022 mask boundary softness; refraction coefficient .0045 controls the restrained optical offset.
- headlineFluid.ts: 105px pointer influence scale, maximum 3.1px vertical / 1.35px horizontal displacement, rotation at .17 degrees per displaced vertical pixel.

## Visual comparison artifacts

Ignored local evidence:
- .qa/fluid-hero-package/video-inspection.json — video metadata and sampled times.
- .qa/fluid-hero-package/*mp4.jpg — additional decoded-video contact sheets.
- .qa/screens/controlled-fluid-sequence.jpg — controlled entrance stages, from the original sculpture through simultaneous irregular regions to the actual portrait.
- .qa/screens/fluid-pointer.png — localized image response.
- .qa/screens/fluid-scroll-end.png — retained compact scrolled composition.
- .qa/screens/fluid-type-hover.png — localized headline behavior.
- .qa/fluid-scope-audit.json — exact before/after change scope.

Intermediate masks were tuned after frame comparison to keep larger regions of both images visible for longer. The existing scrolled layout and text hierarchy remain recognizably those in Video Two.

## Validation commands

Latest size adjustment: TypeScript, ESLint, production build and all four targeted checks passed. These covered cursor-local WebGL and fallback pixels, scaled portrait alignment, and reduced-motion controls. The previous six hero interaction checks also passed during this adjustment before the final fallback mask-sizing correction.

Final hover-refinement results: TypeScript, ESLint and production build passed. Twenty affected hero/portfolio checks passed, followed by eight hero/fallback checks after the SVG fallback was added (21 distinct affected checks across those runs). This includes actual pixels changing in a cheek region well outside the stationary cursor's former reveal window and returning to the sculpture on exit. The earlier complete baseline suite passed 33/33 before this hover refinement. Vite retains its existing warning about the separate, deferred Stack renderer chunk exceeding 500KB.

- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test -- --workers=1
- npm.cmd test -- tests/fluid-spread.spec.ts tests/fluid-hero.spec.ts tests/portfolio.spec.ts --workers=1
- npm.cmd test -- tests/fluid-spread.spec.ts tests/fluid-hero.spec.ts --workers=1

The new browser tests inspect actual rendered pixels for simultaneous red-sculpture and skin-tone regions during the automatic entrance. They also test settling, pointer inertia, rapid direction changes, keyboard activation, scroll handoff/reversal, bounded localized glyph displacement, unchanged text geometry, touch ripple/native scrolling, resize registration, runtime reduced-motion changes, WebGL loss/unavailability and original image SHA-256 values.

Existing tests continue to exercise responsive viewports, hero scale and pin endpoints, all five full-screen Work scenes, other section scroll headings, project/navigation links, physics Stack behavior, footer waves, keyboard access and axe accessibility.

Local preview: http://localhost:5173/
