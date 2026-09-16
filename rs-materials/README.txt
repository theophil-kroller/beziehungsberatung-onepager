R2 MATERIAL STORAGE

Create a private Cloudflare R2 bucket, e.g.:
beziehungsdynamiken-materials

Worker binding variable:
MATERIALS

Suggested object keys later:
poly-starter/poly-starter-guide.pdf
poly-starter/eifersuchts-kompass.pdf
poly-starter/regulation.mp3
trust-restart/guide.pdf
trust-restart/regulation.mp3

Do NOT make the bucket public.
Files are delivered through the Worker only after token/entitlement validation.

After uploading a file, add a row to the D1 `materials` table with its R2 key.
