# Muhammad Sajid Durrani · Editorial Portfolio 2026

A single-page portfolio for a Full-Stack AI Engineer and UI/UX Architect in Peshawar. Built with React 18, TypeScript and Vite.

## Run locally

Use Node.js 20.19+, 22.13+, or 24+ in one of the supported release lines.

```sh
npm ci
npm run dev
```

Open the loopback URL printed by Vite. In PowerShell, use `npm.cmd` if your shell resolves `npm` to a restricted script.

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

The browser suite serves the production build and uses an installed Chrome browser. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge instead. The preview command is `npm run preview`. Run browser checks serially with `npm test -- --workers=1`.

## Edit the portfolio

- `src/data/portfolio.ts` contains the identity, approved links, six projects, five capability pillars, experience and education.
- `src/data/featuredProjects.ts` selects the five public projects currently shown in Work. Exact GitHub and live destinations are in `src/data/projectLinks.ts`; the original project history remains in `portfolio.ts`.
- Technology provenance uses **U** for user-supplied expertise, **G** for listings in the owner’s GitHub profile and **R** for repository documentation cited in the brief. Axiom AI and the enterprise SOP Forge work are distinct from Axiom CRM and SOP Forge Voice Triage.
- The portrait uses a pointer-positioned mask on the top layer. Alignment, aperture and feather settings live in `src/hero.css`. The portrait also supports touch drag, Enter, Space and Escape.
- `public/assets/` holds the three verified originals. `npm run assets:portraits` regenerates the responsive WebP derivatives under `src/assets/`. The reference screenshot is retained for art direction. The hero imports the two exact original PNGs; Vite bundles them without altering their bytes.

[Build verification](docs/BUILD_VERIFICATION.md) · [Tool and GitHub audit](docs/TOOL_AND_GITHUB_AUDIT.md)

Selected Work uses five native vertical chapters with GSAP-driven assembly and rotation of original, project-specific 3D models: Savyora Fitness, Vanguard Athletic Lab, SOP Forge Voice Triage, Axiom CRM and Creamy. One deferred Three.js renderer draws only visible project scenes and provides reduced-motion and unavailable-WebGL fallbacks. Interior sections use an optimized wrinkled-paper material; Experience and Education use a career timeline and layered learning cards. See [the current implementation and verification report](docs/PAPER_AND_PUBLIC_PROJECTS.md).

The Stack uses Matter.js for drag physics and lazy-loads Three.js on entry. Official local SVG artwork becomes extruded, colored logo relief on shaded spheres. It renders only while physics changes, disposes GPU resources on teardown, and retains the labelled DOM grid for reduced motion or unavailable WebGL. The footer reuses the hero contour field with visibility-aware cleanup.

## Production handoff

Build with `npm ci` followed by `npm run build`, then publish the contents of `dist/` using a static host. No application server or environment variable is required for the portfolio; the contact actions use standard Mail and WhatsApp links. `npm run preview` serves the compiled site locally for review. Keep the existing Vite settings and lazy-loaded interaction assets together when publishing.

The footer uses the owner's confirmed email and WhatsApp number in `src/data/portfolio.ts`. `npm run assets:favicon` rebuilds the transparent, theme-aware signature favicon from the existing footer SVG paths. Mouse-only magnetic interactions and the custom cursor are disabled for touch and reduced motion. See [interaction polish and deployment verification](docs/INTERACTION_AND_DEPLOYMENT.md).

The current pointer is a simple dot. The hero retains a local watery portrait reveal with stronger ripples and responsive background contours. [Latest interaction and GitHub handoff](docs/GITHUB_RELEASE.md).
