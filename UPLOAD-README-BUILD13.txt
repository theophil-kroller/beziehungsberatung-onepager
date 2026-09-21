BUILD 13 — WHAT TO UPLOAD
=========================

1) D1 FIRST
Run:
  database/build13-core-integrity.sql

2) CLOUDFLARE WORKER
Deploy:
  cloudflare-worker/worker.js

3) GITHUB ROOT — REPLACE ONLY THESE FOUR FILES
  admin.html
  admin-build9.js
  admin-build10.js
  admin-build10.css

4) DO NOT TOUCH FOR BUILD 13
  vault/data
  vault_server.py
  cart.js
  booking.html
  zugang.html
  access.html

5) CHECK
Worker /health -> build 13
Then Ctrl+F5 and perform BUILD13-TEST-CHECKLIST.txt.
