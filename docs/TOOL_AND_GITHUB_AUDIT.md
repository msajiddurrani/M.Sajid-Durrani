# Tool and GitHub audit

> Historical audit from the initial 6 November build. The user later selected a different existing public repository and explicitly authorized a push. See [the current GitHub handoff](GITHUB_RELEASE.md); the ledger below records the original session.

| Field | Observed result |
| --- | --- |
| Execution date | 2026-11-06, Asia/Karachi (UTC+05:00) |
| Brief root | `C:\Users\MD PCT\Downloads` |
| Isolated project | `C:\Users\MD PCT\Downloads\sajid-editorial-portfolio-2026` |
| Required GitHub owner | `msajiddurrani` |
| Authenticated account used | None. `gh auth status` exited 1 and reported no authenticated GitHub hosts at preflight and after final verification. |
| Owner verified by GitHub API | Unavailable. The authentication gate skipped `gh api user --jq .login`. |
| Intended remote | `msajiddurrani/sajid-editorial-portfolio-2026`, private |
| Actual remote and visibility | Absent. Name availability and remote visibility remain unverified. |
| Git remote output | `git remote -v` returned no entries. |
| Local branch and application commit | `main` at application commit `9a2a7bbf5732a57da7320343260bca6da7b53b50`. The audit is finalized in a documentation commit on `main`. |
| Push | Skipped at the account gate. |

To finish the private remote step, authenticate GitHub CLI as `msajiddurrani`. The remote name and availability can then be checked under that login before creation and push.

## CLI inventory

| Tool | Version and use |
| --- | --- |
| PowerShell | 7.6.9. File operations, checks and local process management. |
| Git | 2.54.0.windows.1. Local repository, staging and commits. |
| GitHub CLI | 2.96.0. Read-only authentication preflight. |
| Node.js | 24.15.0. Vite, local asset tooling and Playwright. |
| npm | 11.12.1 through `npm.cmd`. Dependency install, audit and project scripts. |
| Python launcher | `py`, Python 3.12.10. File-only asset extraction. |
| Vite and TypeScript | 7.3.7 and 5.9.3. Development server, type check and production build. |
| ESLint | 10.14.0. Source and test lint. |
| Playwright and Chrome | 1.65.0 and 156.0.8078.80. Loopback browser tests, input emulation and visual captures. |
| axe and Sharp | `@axe-core/playwright` 4.14.0 and Sharp 0.35.5. Accessibility scan, portrait processing and pixel checks. |

## Chronological command ledger

**Downloads** means the brief root above. **Project** means the isolated checkout above. Commands are shown without credentials.

| Command or operation | CWD | Status | Result |
| --- | --- | --- | --- |
| `Get-Item` / `Get-Content -LiteralPath` on the brief and `Get-ChildItem -Force; git status --short --branch` on the original workspace | Original workspace | Passed with output incident | Located the attachment and observed the separate empty Git repository. One subsequent brief-reading command surfaced a portion of the embedded Base64 in tool output. The read was corrected to exclude payload lines. |
| `Get-Location; Test-Path` on the proposed folder and temporary extractor; `New-Item -ItemType Directory -Path sajid-editorial-portfolio-2026` | Downloads | Passed | The paths were available and the new child directory was created. |
| `py extract_original_assets.py` then `Remove-Item -LiteralPath extract_original_assets.py` | Downloads | Passed | The documented Python whitelist and checksum logic was used with the attachment’s actual filename, `SAJID_PORTFOLIO.md`. Three originals verified. Only the temporary extractor was removed. |
| `Get-Location; git --version; node --version; npm.cmd --version; py --version; gh --version` | Project | Passed | Tool paths and versions confirmed. |
| `gh auth status` | Project | Failed | Exit 1. GitHub CLI reported no signed-in hosts. |
| `gh api user --jq .login` | Project | Skipped | Authentication preflight did not pass. |
| `git rev-parse --show-toplevel` | Project | Passed as isolation check | Exit 128 as expected before initialization. |
| `[IO.File]::WriteAllText(...)` and `Set-Content -LiteralPath 'package.json'` | Project | Passed | Wrote the original Vite/React scaffold, content, components, tests and documentation. |
| `npm.cmd install` | Project | Passed with advisories | Installed from the npm registry and reported eight initial advisories. |
| `npm.cmd run assets:portraits`; `sharp(...).stats()` | Project | Passed | Generated four WebP derivatives and measured the source alpha channels. |
| `npm.cmd audit --json`; `npm.cmd view ...`; `npm.cmd pkg set ...`; `npm.cmd install` | Project | Passed with advisories | Registry advisory and package metadata checks led to upgrading Sharp and the ESLint tooling. Follow-up audit isolated a transitive minimatch advisory. |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort`; `node .qa/capture.mjs` | Project | Passed | Vite started on loopback. Captured five viewport widths and desktop/mobile portrait, work and contact views. |
| `npm.cmd run build; npm.cmd test` | Project | Failed | Initial build passed. Tests found 320 px label overflow and an incorrect pixel probe location for the dark backing. Both were corrected. |
| `npm.cmd pkg delete overrides`; `npm.cmd pkg set overrides.minimatch=11.0.1`; `npm.cmd install` | Project | Retried, passed | The first install process exited unexpectedly. The retry resolved minimatch 11.0.1 across the lint dependency tree. |
| `npm.cmd ls minimatch; npm.cmd audit` | Project | Passed | Verified the installed override and zero reported vulnerabilities. |
| `node .qa/capture.mjs`; `Stop-Process -Id <verified owned Vite PID>` | Project | Passed | Re-captured corrected layouts and stopped the owned development listener. |
| `npm.cmd ci; npm.cmd audit` | Project | Passed | Clean lockfile install and zero reported vulnerabilities from the npm registry. |
| `npm.cmd run typecheck; npm.cmd run lint; npm.cmd run build; npm.cmd test` | Project | Passed | All engineering gates passed. Playwright’s local production preview passed all 11 browser checks. |
| `Get-FileHash -Algorithm SHA256 -LiteralPath <three originals>` | Project | Passed | Rechecked all three originals before staging. |
| `Get-Location; git init --initial-branch=main; git remote -v` | Project | Passed | Initialized a fresh local repository. The remote list was empty. |
| `git add -- .gitattributes .gitignore README.md index.html package.json package-lock.json tsconfig.json vite.config.ts eslint.config.js playwright.config.ts src scripts tests public docs`; `git diff --cached --check` | Project | Passed | Staged the isolated project, original assets and audit files. Checked staged whitespace. |
| `git -c user.name=Codex -c user.email=<local automation identity> commit -m "feat: build Sajid editorial interactive portfolio"`; `git rev-parse HEAD` | Project | Passed | Created the application commit recorded above. The pre-existing configured author had a different display name, so the commit used a command-scoped automation identity. |
| `gh repo view msajiddurrani/sajid-editorial-portfolio-2026`; `gh repo create msajiddurrani/sajid-editorial-portfolio-2026 --private --source . --remote origin --push` | Project | Skipped | The authenticated owner could not be verified. |

## Scope

Project writes were confined to the isolated checkout, with the temporary extractor beside the brief as specified. npm used its normal cache and Playwright used temporary browser profiles. Git author overrides applied only to the commit commands. GitHub access was limited to the read-only CLI authentication check. Local browser requests used loopback and npm contacted the public package registry for dependency and advisory checks.

The audit-only follow-up uses `git add -- docs/BUILD_VERIFICATION.md docs/TOOL_AND_GITHUB_AUDIT.md` and `git -c user.name=Codex -c user.email=<local automation identity> commit -m "docs: record portfolio verification and GitHub gate"`. To identify the audit commit, run `git log -1 --format=%H -- docs/TOOL_AND_GITHUB_AUDIT.md`.
