# Progress — Prototype: african-fund-022120889256919645090

## Current State

- **Built, deployed and live on 2026-11-13.** Umoja is a dependency-free static prototype:
  donor site, three-step monthly giving flow, sample stories, public ledger, campaign kit and a
  separate Fund desk.
- **Live at <https://african-fund-022120889256919645090.vercel.app>.** The deployment is READY and
  `/`, `/styles.css` and `/app.js` all return 200.
- **Repository:** <https://github.com/francisco-arturo/african-fund-022120889256919645090>, branch
  `main`.
- Local preview runs on port 4321. Port 4188 was previously used by an unrelated local prototype and
  could show a stale app from the browser cache.
- Design direction is custom, not a theme pack: cream paper, forest bands, one clay accent,
  editorial serif and documentary photography. Light mode only.
- Brand, people, stores and every figure are placeholder or sample data and are labelled that way in
  the page, `README.md` and `DEMO.md`.

## Current Objective

Make the complete donor-to-voucher loop visible and walkable in about 60 seconds, so the client can
judge the model, the ledger and the operations surface before any integration work.

## What Ran

| Command | Result |
|---|---|
| `node scripts/verify.mjs` | PASS. Markup, styles, scripts and routes all pass; `/`, `/styles.css`, `/app.js` and the hero image return 200; unknown routes return 404. |
| `& ([scriptblock]::Create((Get-Content .\init.ps1 -Raw)))` | PASS, exit 0. Output: "Markup: required sections, duplicate ids, alt text, image dimensions and local assets check out. / Styles: tokens present, braces balanced, overflow-x clip and reduced motion present. / Scripts: app.js parses successfully and dev-server.mjs loaded as an ES module. / Routes: /, /styles.css, /app.js and the hero image return 200; unknown routes return 404. / Verification passed." |
| `$env:PORT="4321"; node dev-server.mjs` | Running as a managed background job; `GET http://127.0.0.1:4321/` returned 200 and contained the Umoja page. |
| `node .harness/deploy.mjs african-fund-022120889256919645090` | READY in 5s. Live <https://african-fund-022120889256919645090.vercel.app>; 7 files, 2,949.8 kB. |
| Live Node fetch against the public alias | `/` 200 text/html 39,277 bytes with Umoja, `/styles.css` 200 45,547 bytes, `/app.js` 200 22,904 bytes; no Relay content. |
| `node <hallmark>/scripts/sloplint.mjs index.html --render` | 0 FAIL, 106 REFLEX, 3 WARN. Render tier could not run because no `puppeteer-core` is installed; headless Chrome and Edge cannot start inside this sandbox (crashpad `OpenProcess` denied). Visual QA was therefore markup/CSS review, per the optional-QA rule. |
| `node ..\.harness\build-clock.mjs check` | Within budget at the handover checkpoint. |

## Verification Evidence

- `node scripts/verify.mjs` checks required content, duplicate ids, image alt text and dimensions,
  every local asset, CSS token presence and balanced braces, JavaScript parsing, and live HTTP
  routes through the actual `dev-server.mjs` handler.
- Local route evidence: `http://127.0.0.1:4188/` -> 200, body contains `Umoja`.
- The default port 4173 was already occupied by another prototype, so the review server uses 4188.
  `DEMO.md` records that port and the fallback.

## What Works

- Giving dialog: $1, $3, $5, $10 chips and a 1 to 10 slider; SoFi payroll, Stripe and PayPal method
  selection with fee copy; contact details; email and SMS thank-you opt-ins; required authorization.
- Thank-you state: receipt, annual voucher estimate, queued email preview and queued text preview.
- Live ledger: a demo gift is added to the table, the money-in, giver and reserve figures update, and
  the gift persists in `localStorage` until **Reset demo data** is used.
- Public ledger: all/in/food/operations filters, category split, six-month chart and CSV download.
- Stories: three labelled sample story slots with local photography and credits.
- Campaign kit: three copy-ready captions, a weekly campaign list and a working copy-to-clipboard
  path.
- Fund desk: voucher batches, donor-care automations, campaign queue with "Post now", latest
  activity, export and reset.
- Responsive layout, focus-visible styles, reduced-motion fallback and `overflow-x: clip`.

## What Is Deliberately Fake

- No payment, payroll, voucher, email, SMS or social account is connected.
- The ledger is seeded; only gifts made in this browser are real to the demo and they live in
  `localStorage`.
- The stories are illustrative and must be replaced with consented accounts before launch.
- Fund desk has no authentication; it opens with a seeded operations persona.

## Next

1. The user reviews the live build at <https://african-fund-022120889256919645090.vercel.app>.
2. Replace the sample stories and brand, then wire Stripe, PayPal and SoFi at Work when the client
   chooses real providers.
3. Add store-side voucher redemption, partner settlement and a real email/SMS provider.
4. The proposal draft is at `upwork-kit/drafts/african-fund-022120889256919645090.md`; it has not
   been sent.

## Blockers

- None. The live deployment is READY and the public routes return 200.
- Visual screenshot QA is blocked by the sandbox browser limits; this is optional and did not delay
  the handover.
