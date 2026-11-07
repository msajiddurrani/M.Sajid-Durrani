# Paper surfaces, records and public Work projects

Implemented in the existing checkout, 7 November 2026. Preview: http://localhost:5173/.

## Scope and preserved content

- Replaced flat interior backgrounds with an optimized 130,632-byte wrinkled-paper WebP. Light sections use warm ivory; Work and Stack use the same material under a graphite tint. No animated image filter or extra runtime dependency.
- Redesigned Experience as a numbered career route with scroll progress and individual scrubbed entries. Education uses layered paper cards, tabs and graduation-cap seals. All original names, roles, descriptions, courses and institutions remain visible; no dates or credentials were invented.
- Replaced the visible Work selection with the five public projects supplied by the user. Native vertical scrolling drives reversible GSAP assembly, rotation and text reveals. No pinned slide rail, snapping or wheel interception. One deferred renderer handles only visible 3D scenes.
- Preserved hero composition, original portraits, fluid interaction, existing heading animation and footer wave/signature behavior. The original six-project history remains in `src/data/portfolio.ts`.
- No repository, Git remote, deployment configuration or external project was changed.

## Verified project destinations and source evidence

The user-supplied Vanguard live URL identified the repository spelling `vangaurd-lab`. GitHub repository metadata, README files and relevant application source were inspected. Each live URL returned HTTP 200 and rendered in Chrome. A successful live page does not establish authenticated or backend functionality; no login, microphone call, form submission or purchase was performed.

| Project / source | Live destination | Source-supported presentation and 3D object |
| --- | --- | --- |
| [Savyora](https://github.com/msajiddurrani/savyora) | [savyora.vercel.app](https://savyora.vercel.app) | Next.js facilities, coaching and membership pages; browser-built WhatsApp enquiries. Dumbbell and membership card. |
| [Vanguard Athletic Lab](https://github.com/msajiddurrani/vangaurd-lab) | [vangaurd-beta.vercel.app](https://vangaurd-beta.vercel.app/) | Calculator, exercise-library, academy and protected athlete workspace routes; diagnostics interface. Training watch, metric bars and macro dial. Live page currently opens on authentication. |
| [SOP Forge](https://github.com/msajiddurrani/SOP-FORGE) | [ai-sop-forge.vercel.app](https://ai-sop-forge.vercel.app) | README and frontend/backend source describe Next.js, FastAPI, WebSocket voice streaming, Groq routing, ElevenLabs and Supabase. Microphone with animated department-routing nodes. This is distinct from the original enterprise governance experience entry. |
| [Axiom CRM](https://github.com/msajiddurrani/axiom) | [axiom-sable.vercel.app](https://axiom-sable.vercel.app/) | React/Firebase CRM with contacts, deals, tasks and interactions. Physical pipeline board with raised cards and growth bars. Live page opens on authentication. This is distinct from the original Axiom AI project history. |
| [Creamy](https://github.com/msajiddurrani/creamy) | [creamy-henna.vercel.app](https://creamy-henna.vercel.app) | React storefront with flavor customizer, calculated pricing and shared cart state. Ice-cream cone, scoops and pint. No payment-backend claim. |

Particularly relevant source: Vanguard `src/app/page.tsx`, calculator/workspace/diagnostics routes; Axiom `src/components/Dashboard.tsx`; Creamy `src/App.tsx` and `src/components/FlavorCustomizer.tsx`; SOP Forge README and frontend/backend tree; Savyora App Router page files.

## Files changed for this request

- `src/assets/wrinkled-paper.webp`: generated low-contrast ivory paper material, optimized with Sharp. Original generated PNG retained in the local generated-images directory and ignored `.qa/wrinkled-paper-source.png`.
- `src/paper-record.css`, `src/main.tsx`: interior material, record layouts and final stylesheet import.
- `src/components/ExperienceEducation.tsx`: semantic record sections and scoped, reversible GSAP timelines with reduced-motion cleanup.
- `src/data/featuredProjects.ts`, `src/data/projectLinks.ts`: verified public selection and exact destinations.
- `src/components/SelectedWork.tsx`, `src/components/work/projectModels.ts`: project copy, marks and corresponding dimensional models.
- `tests/chapters.spec.ts`, `tests/continuous-work.spec.ts`, `tests/portfolio.spec.ts`, `tests/project-world.spec.ts`: updated project selection and destinations, keeping existing meaningful interaction checks.
- `tests/paper-record.spec.ts`: record preservation/bounds, reduced motion, reversible record motion and actual Live-button popup navigation.
- `README.md`, this report.

Earlier uncommitted changes in this checkout belong to preceding portfolio work and are not all attributed to this request.

## Validation

- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed.
- Changed tracked files pass `git diff --check`. The whole pre-existing working tree still reports three trailing-whitespace lines in `EditorialMasthead.tsx`, outside this request's edits.
- `npm.cmd run build`: passed. Existing Vite advisory remains for the shared, deferred Three.js chunk (574 kB uncompressed); no new dependency was added.
- Production Playwright suite: 58 distinct checks verified. The first full run passed 57/58; an existing heading test sampled an in-progress entry position before font metrics settled. The test now awaits fonts and positions the heading fully below the viewport before measuring its opposing entrance. Rerunning its complete six-test chapter file passed 6/6. No product animation was weakened to satisfy the assertion.
- Visual screenshots inspected at 1440×900, 390×844 and 320×780, covering the paper surface, new records and all five project scenes. Browser checks include tablet widths. No horizontal overflow or JavaScript page errors in the dedicated visual pass.
- Every public live page loaded separately in Chrome at 1366×900; screenshots retained under ignored `.qa/screens/verified-live-*.png`. The deterministic UI suite also clicks each portfolio Live link and verifies its new-tab destination, intercepting remote navigation to avoid network-dependent flakes.
- Local unthrottled Chrome sample during 100 scrolling frames: median 16.6 ms, p95 22.6 ms, 8 layout operations totaling 8.5 ms. This is a local sample, not a cross-device frame-rate guarantee. Renderer stopped on reduced motion and resumed when normal motion was restored; resize to 390px retained no overflow.
- Original portrait SHA-256 values unchanged: image1 `e4bf7b8925b63bbb2457639263f8e8332309ba276d976159c0c05e6e1fbf285f`; image2 `bee5f3d67e72b898ef4bee75eef483aa46042c9de0a0a13c78e6ac3fbd4c15a7`.
