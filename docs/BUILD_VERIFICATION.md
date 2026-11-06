# Build verification

Verified on **6 November 2026** in the isolated `sajid-editorial-portfolio-2026` checkout. The application commit on `main` is `IMPLEMENTATION_SHA`.

## Source assets and compositing

| Original | Bytes | Dimensions | SHA-256 |
| --- | ---: | --- | --- |
| `public/assets/design-reference.jpg` | 118,680 | 736 × 1308 | `b09f8c4b2f7bb94ab52f7aba670979c56e9feecf05d5f169494207bfb3a1dbbc` |
| `public/assets/image1.png` | 2,976,577 | 1122 × 1402 | `e4bf7b8925b63bbb2457639263f8e8332309ba276d976159c0c05e6e1fbf285f` |
| `public/assets/image2.png` | 2,001,082 | 1086 × 1448 | `bee5f3d67e72b898ef4bee75eef483aa46042c9de0a0a13c78e6ac3fbd4c15a7` |

The decoder checked the exact whitelist, uniqueness, Base64 validity and SHA-256 before writing each original. Sharp measured alpha 255 throughout image1 and alpha 0–255 in image2. The default, opaque VR portrait is layer 3. A circular mask in that layer reveals the turtleneck portrait at layer 2 over the dark backing at layer 1. Image2’s placement is tuned by scale and translation. A hand-drawn red contour and feathered shoulder edges integrate the portrait into the torn-paper stage.

Vite ships 640w and 1080w WebP variants for each portrait. The 640w pair totals 159,708 bytes and the 1080w pair totals 392,332 bytes. All three originals are kept in Git and the reference is for visual study.

## Verified behavior

| Check | Observed result |
| --- | --- |
| Vite development server | HTTP 200 on loopback at all five visual capture widths. Both local typefaces and both portrait derivatives loaded. |
| Viewports | 320, 390, 768, 1024 and 1440 CSS px. No horizontal scroll or masthead text clipping. Inspected mastheads at all five sizes and the work, contact and portrait compositions at desktop and mobile widths. |
| Content and navigation | Six featured case studies, five capability pillars, three experience entries and three education entries. Internal anchors resolve. SEO title and the three exact external link destinations passed. |
| Default portrait and mouse | Default aperture 0 px. Verified local pixel change on reveal, stable pixels outside the circle, 180 px desktop radius, pointer-relative tracking at center and near edges, scrolling and resizing, and restoration on leave. Sampled an exposed transparent-image region and confirmed the backing RGB was `16, 14, 14`. |
| Touch | Chrome touch emulation at 390 CSS px and DPR 2. Touch down and drag tracked a 125 px aperture. Touch end and cancel reset it. |
| Keyboard and reduced motion | Tab reached the labelled portrait button with a visible dashed focus indicator. Enter and Space opened the centered reveal, Space toggled it and Escape closed it. Reduced motion disabled the aperture transition. |
| CSS mask fallback | A simulated unsupported-mask browser exposed a manual switch. Pointer activation switched to the real portrait and Escape restored the default. |
| Automated accessibility | axe WCAG 2.0/2.1 A and AA scan returned zero violations in the tested production page. |
| Engineering | `npm.cmd ci`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd test` and `npm.cmd audit` passed. All 11 browser tests passed and npm reported zero known vulnerabilities. |

The production build emitted `dist/index.html`, a local SVG favicon, local fonts, compiled CSS and JavaScript, and the four optimized portraits. Local browser screenshots are in the ignored `.qa/screens/` directory, including default and revealed portraits at 390 and 1440 px.

Browser verification used desktop Chrome with mobile emulation and a simulated mask fallback. Physical touch hardware and additional browser engines were outside the test run. External URLs were checked against the literal destinations in the brief. The browser checks used loopback requests.
