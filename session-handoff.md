# Session Handoff — Prototype: african-fund-022120889256919645090

## Last Updated

- 2026-11-13 — Umoja donor site and Fund desk built, verified and handed over locally for review.

## Current Objective

A working template for a USA-based pan-African NGO: voluntary $1 to $10 monthly gifts through SoFi
payroll, Stripe or PayPal; pooled food vouchers at African-owned stores; a public live ledger;
sample community stories; a social campaign kit; and automated thank-you previews.

## Status

- `proto-001` is **done** in `feature_list.json`.
- Verification is green: `node scripts/verify.mjs` and `init.ps1` both pass.
- The build is **not pushed or deployed**. The approval gate has not been passed.

## Recommended Next Step

1. Let the user review <http://127.0.0.1:4188> (run
   `$env:PORT = "4188"; node dev-server.mjs` if it is not already running).
2. Apply any requested copy or visual changes inside this directory.
3. When the user approves and supplies a GitHub repository URL, add it to the workspace
   `github.json` approved remotes, push, then run
   `node .harness/deploy.mjs african-fund-022120889256919645090` from the workspace root.
4. Update `DEMO.md` with the live URL and re-verify after deployment.

## Files

| File | Purpose |
|---|---|
| `index.html` | All public sections, giving dialog, Fund desk and story/photo credits |
| `styles.css` | Custom light editorial system; tokens at the top; responsive and reduced-motion rules |
| `app.js` | Amount logic, giving flow, ledger calculations, localStorage gifts, filters, CSV, copy, queue, reset |
| `dev-server.mjs` | Zero-dependency static server; exported `createApp()` is also used by verification |
| `scripts/verify.mjs` | Markup, asset, CSS, script-parse and live-route checks |
| `assets/photos/` | Seven local documentary photographs from Wikimedia Commons, credited in the footer |
| `README.md` | Run and verify commands plus template notes |
| `DEMO.md` | 60-second click path, local URL, fake-by-design list and next work |
| `init.ps1` / `init.sh` | Entrypoints that run `node scripts/verify.mjs` |

## Blockers

- None for review.
- Headless Chrome/Edge cannot start inside the sandbox (crashpad access denied), so screenshot QA
  remains a manual, optional step.

## Next Session

- Continue in this one directory; do not create a second prototype for this listing.
- Do not push or deploy before the user approves and supplies the repository URL.
- Keep the light-mode, English-only, dependency-free shape unless the user asks otherwise.
- If port 4188 is taken, use `$env:PORT = "4190"; node dev-server.mjs`.
