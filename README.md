# Umoja — African Fund prototype

A working template for a USA-based pan-African NGO. It turns voluntary $1 to $10 monthly
gifts into $10 food vouchers at African-owned groceries, and publishes the ledger while it does it.

## Run locally

```powershell
$env:PORT = "4188"
node dev-server.mjs
```

Open <http://127.0.0.1:4188>.

There are no dependencies to install. The site is static HTML, CSS and vanilla JavaScript, so it
deploys to Vercel as-is.

## Verify

```powershell
node scripts/verify.mjs
```

The check covers required markup, duplicate ids, image alt text and dimensions, local assets,
CSS tokens, JavaScript parsing, and live HTTP responses for the page, stylesheet, script and hero
image. It also confirms unknown routes return 404.

## What is here

| File | Purpose |
|---|---|
| `index.html` | Donor site, three-step giving flow, stories, public ledger, campaign kit and Fund desk |
| `styles.css` | The whole visual system: cream paper, forest bands, clay accent, editorial type |
| `app.js` | Amount math, dialog flow, simulated gift capture, localStorage ledger, filters, CSV, copy and campaign queue |
| `dev-server.mjs` | Zero-dependency local preview server |
| `scripts/verify.mjs` | The verification entrypoint used by `init.ps1` and `init.sh` |
| `assets/photos/` | Local documentary photographs with credits in the footer |

## The happy path

1. Choose any amount from $1 to $10 in the model section or the giving dialog.
2. Pick SoFi payroll, Stripe card or PayPal. The copy explains the fee difference.
3. Enter a first name and email, confirm the demo gift, and see the queued email and text.
4. The gift lands in the public ledger immediately, in this browser.
5. Open Fund desk for voucher batches, donor-care automations and the social queue.

## Template notes

- Umoja is a placeholder name. Replace it, the story slots, partner stores and payment keys.
- Every number is sample data. Payments, payroll connections, vouchers and message delivery are
  simulated. Nothing is charged and no message leaves the browser.
- The ledger persists in `localStorage`. Use "Reset demo data" in Fund desk to return to the seeded
  November state.
- Before launch, complete 501(c)(3) status, state charitable registrations, partner-store
  agreements, consent for family stories and the real Stripe, PayPal and SoFi integrations.
