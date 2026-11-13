# Demo — Umoja (African Fund prototype)

A donor-facing template for a pan-African NGO in the USA: $1 to $10 monthly payroll or card gifts,
$10 food vouchers at African-owned groceries, a public ledger, a campaign kit and automated
thank-yous.

- **Live URL:** <https://african-fund-022120889256919645090.vercel.app>
- **Local URL:** <http://127.0.0.1:4321>
- **Run:** `$env:PORT = "4321"; node dev-server.mjs` from this directory
- **Verify:** `node scripts/verify.mjs` (also wrapped by `init.ps1` / `init.sh`)
- **Last verified:** 2026-11-13

## The 60-second path

| # | Do this | What the visitor sees |
|---|---|---|
| 1 | Open <https://african-fund-022120889256919645090.vercel.app> | The hero, the live November ledger card and four month-to-date figures |
| 2 | Click **Start monthly giving** | A three-step giving dialog with $1, $3, $5, $10 chips and a 1 to 10 slider |
| 3 | Pick $5, keep **SoFi payroll**, click **Continue** | The contact step, gift summary, email/text toggles and an authorization check |
| 4 | Enter a first name and email, click **Confirm monthly gift** | A thank-you receipt, a queued email preview and a queued text preview |
| 5 | Close the dialog and scroll to **Every dollar leaves a trail** | The gift appears at the top of the ledger; money in, givers and the reserve update |
| 6 | Click **Food** above the table, then **Download CSV** | The table filters to food-voucher batches and a CSV downloads |
| 7 | Click **Fund desk** in the header | Voucher batches, donor-care automations, the campaign queue and latest activity |
| 8 | Click **Post now** on a queued campaign item | The item flips to Posted, showing the social publishing handoff |

## The one sentence to say about it

> "This is the whole loop: a $1 to $10 monthly gift, a live public ledger, and food vouchers at
> African-owned stores, with the donor care and social campaign tools the team needs to run it."

## What is deliberately fake

- **Payments and payroll are simulated.** Stripe, PayPal and SoFi are shown as the three methods;
  no card, bank or employer account is touched.
- **The ledger is seeded.** Every November figure, store, voucher batch and donor count is sample
  data. Gifts made in the demo are saved in this browser's `localStorage` and added to the seeded
  ledger on top of the sample rows.
- **Vouchers are not issued.** The batches, redemption statuses and partner stores are illustrative.
- **Messages are previews.** The email and text thank-yous show what would be queued. No email or
  SMS provider is connected.
- **Social publishing is simulated.** "Post now" updates the demo queue; no social account is
  connected.
- **There is no authentication.** Fund desk opens with a seeded operations persona; this is a
  post-login prototype, not a security model.
- **Stories are sample slots.** They are labelled as sample stories and must be replaced with
  consented, first-person accounts before launch.

## If something fails while they look

- Reset the demo with **Reset demo data** at the bottom of Fund desk.
- If the page is stale, hard-refresh; the server sends `Cache-Control: no-store`. Port 4188 was
  previously used by an unrelated local prototype and can serve a stale app from the browser cache;
  use the live URL or the clean local port 4321.
- If port 4321 is taken, set another port: `$env:PORT = "4322"; node dev-server.mjs`.

## Not built (next, if the user wants it)

- Real Stripe, PayPal and SoFi at Work integrations, including webhooks, receipts, dunning and
  cancellation.
- Store-side voucher redemption, partner settlement and reconciliation.
- Consent-gated story publishing with real family and storekeeper media.
- Email/SMS provider wiring and a social scheduler with real accounts.
- Nonprofit compliance pack: 501(c)(3) status, state charitable registrations, privacy policy and
  donation terms.
