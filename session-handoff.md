# Session Handoff — Prototype: african-fund-022120889256919645090

## Last Updated

- 2026-11-13 — Umoja donor site and Fund desk built, verified, pushed, deployed and handed over.

## Current Objective

A working template for a USA-based pan-African NGO: voluntary $1 to $10 monthly gifts through SoFi
payroll, Stripe or PayPal; pooled food vouchers at African-owned stores; a public live ledger;
sample community stories; a social campaign kit; and automated thank-you previews.

## Status

- `proto-001` is **done** in `feature_list.json`.
- Verification is green: `node scripts/verify.mjs` and `init.ps1` both pass.
- **Live:** <https://african-fund-022120889256919645090.vercel.app>
- **Repository:** <https://github.com/francisco-arturo/african-fund-022120889256919645090>, branch
  `main`.
- **Proposal draft:** `upwork-kit/drafts/african-fund-022120889256919645090.md`, not sent.

## Recommended Next Step

1. Review the live page at <https://african-fund-022120889256919645090.vercel.app>.
2. Apply any requested copy or visual changes inside this directory, commit, push and redeploy.
3. Replace the sample stories and brand, then wire Stripe, PayPal and SoFi at Work when the client
   chooses real providers.
4. Add store-side voucher redemption, partner settlement and a real email/SMS provider.

## Files

| File | Purpose |
|---|---|
| `index.html` | All public sections, giving dialog, Fund desk and story/photo credits |
| `styles.css` | Custom light editorial system; tokens at the top; responsive and reduced-motion rules |
| `app.js` | Amount logic, giving flow, ledger calculations, localStorage gifts, filters, CSV, copy, queue, reset |
| `dev-server.mjs` | Zero-dependency static server; exported `createApp()` is also used by verification |
| `scripts/verify.mjs` | Markup, asset, CSS, script-parse and live-route checks |
| `assets/photos/` | Four local documentary photographs from Wikimedia Commons, credited in the footer |
| `README.md` | Run and verify commands plus template notes |
| `DEMO.md` | 60-second click path, live and local URLs, fake-by-design list and next work |
| `init.ps1` / `init.sh` | Entrypoints that run `node scripts/verify.mjs` |

## Blockers

- None. The live deployment is READY and the public routes return 200.
- Headless Chrome/Edge cannot start inside the sandbox (crashpad access denied), so screenshot QA
  remains a manual, optional step.
- Port 4188 was previously used by an unrelated local prototype and can show a stale app from the
  browser cache; the clean local port is 4321.

## Next Session

- Continue in this one directory; do not create a second prototype for this listing.
- Keep the light-mode, English-only, dependency-free shape unless the user asks otherwise.
- The live alias is the client-facing URL; the repository is the source of truth.
- If port 4321 is taken, use `$env:PORT = "4322"; node dev-server.mjs`.
