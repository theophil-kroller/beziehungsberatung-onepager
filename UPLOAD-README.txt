BEZIEHUNGSDYNAMIKEN BUILD 9 — INSTALLATION

BUILD 9 is an incremental upgrade from BUILD 8 FIX5.
Do NOT delete your existing D1 database, KV, R2 bucket, Worker bindings or Secure Vault data.

A. GITHUB / WEBSITE FILES
Upload/replace these files in the repository root:
- admin.html
- admin-build9.css            (new)
- admin-build9.js             (new)
- admin-vault.js              (unchanged Vault integration carried forward)
- cart.js
- termin.html
- zugang.html
- access.html
- payment-success.html        (new)

You may leave the old admin-build8.css/admin-build8.js in the repository; BUILD 9 admin.html no longer loads them.

B. D1 MIGRATION — DO THIS BEFORE THE BUILD 9 WORKER
Open Cloudflare > D1 > your existing Beziehungsdynamiken database > Console.
Run the complete contents of:
  database/build9-sales-continuity.sql

The migration is additive/idempotent and may be run again if you are unsure whether it completed.
It creates the BUILD 9 catalogue, sales-order, wallet, refund, CSV-batch and subscription tables and sets:
- process-5 = EUR 410
- continuation-3 = EUR 245 (internal)
- continuity-monthly = EUR 79/month (internal)

Quick check after migration:
SELECT name FROM sqlite_master WHERE type='table' AND name IN (
 'product_catalog','admin_sales_orders','customer_wallet_ledger','refund_records',
 'bank_import_batches','customer_subscriptions','subscription_cycles'
) ORDER BY name;
Expected: 7 rows.

C. WORKER
Replace the Worker code with:
  cloudflare-worker/worker.js
Deploy it.

Existing bindings/secrets stay in place (DB, BOOKINGS, MATERIALS, Google, Resend, invoice variables, Stripe secrets).

Then verify:
/health            -> {"ok":true}
/public-config     -> stripeEnabled true, 9000 / 16500 appointment fees

D. STRIPE WEBHOOK
Open the existing Stripe Sandbox webhook destination and add the events listed in:
  setup/BUILD9-STRIPE-WEBHOOK.txt

E. TEST ORDER FROM CLIENT RECORD
1. Open admin.html and log in.
2. Open a client > Angebote & Buchungen.
3. Choose Prozessbegleitung – 5 Sitzungen (EUR 410).
4. Click "Bestellung anlegen".
5. Complete billing address; optionally document early-service / digital-content consent.
6. Keep Stripe payment link enabled and submit.
7. Confirm the client receives one PDF invoice + Stripe payment link.
8. Pay with a Stripe Sandbox card.
9. Confirm the SAME invoice becomes paid and the 5-session credit becomes active.
10. Confirm payment-success.html redirects to the member area automatically.

F. TEST BANK PAYMENT / CSV FRESHNESS
- Create an invoice order without paying via Stripe.
- Record payment manually or import a matching bank CSV.
- Confirm package activates after payment.
- Invoice page should show the last CSV import date and counts.
- Dashboard attention should warn if live open invoices exist and bank reconciliation is stale.

G. TEST CANCELLATION
For a paid Stripe appointment, use Termin verwalten or Admin > Termine > Stornieren.
- >48h: full refundable amount -> choose wallet or Stripe refund.
- 24–48h: 50% refundable amount -> choose wallet or partial Stripe refund.
- <24h: policy fee applies; no confusing "Keine Erstattung" action is shown.
Package appointments return their session unit.

H. SECURE PRACTICE VAULT
No migration is required. Keep your existing local vault/data folder.
Never upload vault/data to GitHub.

I. SUMUP
BUILD 9 does NOT call the SumUp API yet. It already accepts "SumUp / Kartenzahlung" as a payment method in the unified payment journal. A direct terminal/API integration can be added later without changing the invoice model.

J. ROLLBACK
The ZIP includes _rollback/worker-build8-fix5-before-build9.js.
If a Worker issue occurs, you can redeploy that file. BUILD 9 D1 tables are additive and do not need to be removed for rollback.
