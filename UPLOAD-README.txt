BEZIEHUNGSDYNAMIKEN BUILD 8 — INSTALLATION ORDER
=================================================

This ZIP contains only files that are new or changed for BUILD 8. Existing website files not contained here stay untouched.

A. BEFORE YOU START
-------------------
1. Keep a copy of the currently deployed Cloudflare Worker. A rollback copy of the worker you supplied is included under:
   _rollback/worker-build6-before-build8.js
2. Back up the current D1 database in Cloudflare.
3. Do not delete the existing KV namespace (BOOKINGS), D1 database, or R2 MATERIALS binding.

B. DATABASE FIRST
-----------------
Run ONCE against the same D1 database used by the Worker:

   database/build8-worker-crm-stripe.sql

It adds CRM lifecycle tables, Stripe checkout bookkeeping, payment journal, bank-import rows and technical session products. It does not delete existing data.

C. DEPLOY THE WORKER
--------------------
Deploy this file as the Worker code:

   cloudflare-worker/worker.js

It is based on the current BUILD-6 worker supplied for this build and therefore retains Google Calendar, packages, invoice checkout, PDF invoices, admin magic-link login, emails and the existing CRM endpoints.

Recommended/required Worker settings are documented in:

   setup/CLOUDFLARE-STRIPE-SETUP.txt

Default one-off fees in the code are already:
- Individual counselling, 60 min: EUR 90
- Couples & relationship counselling, 90 min: EUR 165

They can later be overridden through Worker variables without changing code.

D. UPLOAD THE WEBSITE FILES TO GITHUB
-------------------------------------
Upload/replace these files in the repository root:

   admin.html
   admin-build8.css
   admin-build8.js
   admin-vault.js
   cart.js

Upload these folders as well:

   cloudflare-worker/
   database/
   vault/

Important: cart.html, cart-en.html, booking.html, booking-en.html and the offers pages already load cart.js. BUILD 8 uses the new cart.js as the payment integration layer, so they do not need to be replaced solely for Stripe. The script also fixes the booking-page wave and displays the new one-off prices on the offers pages.

E. STRIPE
---------
For real automatic reconciliation, configure BOTH:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Webhook endpoint:
   https://<YOUR-WORKER>/stripe/webhook

Events:
   checkout.session.completed
   checkout.session.async_payment_succeeded
   checkout.session.async_payment_failed

The success page can also verify a paid Checkout Session directly, but the webhook is essential so payments are finalized even when the customer closes the browser after paying.

F. SECURE PRACTICE VAULT
------------------------
On the computer where counselling documentation should be stored:

Windows:
1. Open vault/
2. Double-click setup_vault.bat once
3. Double-click start_vault.bat whenever you want to use documentation
4. Open admin.html and choose Secure Vault / Documentation
5. On first use choose a strong Vault password (minimum 12 characters)

macOS/Linux:
   cd vault
   chmod +x setup_vault.sh start_vault.sh
   ./setup_vault.sh
   ./start_vault.sh

There is NO password recovery. Store the password in a password manager.
The Vault listens only on 127.0.0.1:47831.
Back up vault/data only while the Vault is locked. Keep the backup encrypted. Full-disk encryption (e.g. BitLocker/FileVault) is strongly recommended in addition to Vault encryption.

G. PAYMENT WORKFLOW AFTER BUILD 8
---------------------------------
Stripe:
   customer pays -> Stripe confirms -> invoice/payment journal marked automatically -> CRM shows Stripe + payment date

Bank transfer:
   invoice remains open -> export CSV from bank -> CRM "Bank-CSV importieren" -> exact/probable match -> you confirm -> paid status posted

Cash:
   open invoice -> "Zahlung erfassen" -> Barzahlung + actual date -> paid status posted

Manual bank entry:
   open invoice -> "Zahlung erfassen" -> Banküberweisung + actual date/reference -> paid status posted

H. SAFE DEPLOYMENT TEST
-----------------------
Use Stripe Sandbox first.
1. /health returns ok
2. admin magic-link login works
3. existing bookings/packages/invoices are visible
4. appointment price shows EUR 90 / EUR 165
5. test invoice booking creates calendar event + invoice
6. Stripe test payment returns and appears in CRM
7. cash payment can be entered with date
8. sample bank CSV can be matched without posting until you confirm
9. Vault can be initialized, locked/unlocked, and one test session saved/reloaded

Only after these checks switch Stripe from sandbox to live keys.
