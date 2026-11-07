# Scroll chapter redesign — 7 November 2026

Updated the existing portfolio checkout. Original portfolio data, PNG portraits, hero and footer components, repository configuration and deployment configuration were preserved.

## Interaction and design

- About, Selected Work and The Record use reusable opposing-word ScrollTrigger timelines. The left and right words meet centrally as scrolling advances and separate when scrolling reverses.
- About content enters from opposing sides. Three visible editorial panels replace the accordion, with custom vector illustrations, folded paper details and all original discipline descriptions.
- Vertical native scroll controls a pinned, sideways sequence of five full-screen project scenes. Each card has a readable dwell interval, individual material treatment, original project context and technologies, and expandable architecture/contribution notes. Previous/next buttons and left/right keyboard shortcuts navigate the sequence.
- Inactive pinned cards are inert and hidden from accessibility APIs. Reduced-motion and short-height layouts expose all cards in normal document flow. Navigation and subsequent Stack/Record sections remain accessible.
- Next.js uses a black sphere with its white N. JavaScript uses a yellow sphere with black lettering; TypeScript uses a blue sphere. Other spheres use technology-associated colors. Logo relief remains genuine extruded SVG geometry; hover and keyboard focus adjust its presentation. The static fallback uses the same surface palette.
- Professional record entries also use opposing word motion. Experience and education text is unchanged.

## Project destinations

The owner supplied https://github.com/msajiddurrani in response to the project-URL request. Visit GitHub uses that profile for cards without an exact verified repository.

Savyora uses its exact verified repository, https://github.com/msajiddurrani/savyora, and repository homepage, https://savyora.vercel.app. An HTTP GET returned 200 with title “The Savyora Fitness | More Than Fitness. A Lifestyle.” Repository metadata: https://api.github.com/repos/msajiddurrani/savyora.

No verified exact live destinations were supplied for Dentora, Axiom AI's RAG portal, SOP Forge enterprise governance, or TerraSphere. Their Live actions are visibly unavailable. The separate public axiom CRM and SOP-FORGE voice-triage repositories were not substituted for those projects.

## Validation

- TypeScript, ESLint and the production build passed.
- 27 browser checks verified: the bulk run passed 26; the native-touch test passed after replacing the unsupported synthetic touch-scroll command with actual touch start/move/end input and waiting for the pinned frame to paint. Application changes were not required for that test correction.
- Tested full-screen cards at 1440×900, 390×844 and 360×780. Checked all five cards, actions inside the viewport, scroll reversal, document overflow and reduced-motion reading order.
- Existing checks cover 1366×768, 1024×768, 768×1024, 844×390, 1920×1080, 2560×1440 and 320×780, hero masking and reversal, Stack collisions/filters/dragging, keyboard navigation, live footer waves and axe accessibility.
- Dedicated heading tests confirmed negative/positive opposing translations, central convergence and reversal.
- Final visual review caught TypeScript's official negative-space SVG rendering as a white plate. Its original letter contours now form the relief; the three refinement checks passed again, including a pixel check that excludes that plate regression.
- Visual previews inspected at desktop and phone sizes. Original portrait SHA-256 values remain unchanged. The portfolio data file has no diff from HEAD.

Commands:
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test -- --workers=1
- npm.cmd test -- tests/portfolio.spec.ts --grep "mobile vertical" --workers=1

Local preview: http://localhost:5173/
