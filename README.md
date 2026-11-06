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

The browser suite serves the production build and uses an installed Chrome browser. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge instead. The preview command is `npm run preview`.

## Edit the portfolio

- `src/data/portfolio.ts` contains the identity, approved links, six projects, five capability pillars, experience and education.
- Technology provenance uses **U** for user-supplied expertise, **G** for listings in the owner’s GitHub profile and **R** for repository documentation cited in the brief. Axiom AI and the enterprise SOP Forge work are distinct from Axiom CRM and SOP Forge Voice Triage.
- The portrait uses a pointer-positioned mask on the top layer. Alignment, aperture and feather settings live in `src/styles.css`. The portrait also supports touch drag, Enter, Space and Escape.
- `public/assets/` holds the three verified originals. `npm run assets:portraits` regenerates the responsive WebP derivatives under `src/assets/`. The reference screenshot is retained for art direction. Vite bundles the portrait derivatives and leaves the source assets out of the build.

[Build verification](docs/BUILD_VERIFICATION.md) · [Tool and GitHub audit](docs/TOOL_AND_GITHUB_AUDIT.md)
