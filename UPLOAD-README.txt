BEZIEHUNGSDYNAMIKEN – BUILD 7 UPLOAD
====================================

Upload the contents of this ZIP to the ROOT of your existing GitHub repository.
Keep the folder structure for database/build7-crm-lifecycle.sql.

Replace these existing files when GitHub asks:
- admin.html
- cart.js

Add these new files:
- admin-build7.css
- admin-build7.js
- BUILD7-NOTE.txt
- database/build7-crm-lifecycle.sql
- UPLOAD-README.txt

IMPORTANT:
Do NOT replace cloudflare-worker/worker.js with the old GitHub version.
BUILD 7 intentionally contains no Worker replacement.

After GitHub Pages has deployed, hard-refresh the browser (Ctrl+F5) and open:
https://beziehungsdynamiken.at/admin.html

Quick checks:
1. Login via magic link.
2. Dashboard opens with sidebar.
3. Appointment -> Verschieben opens a date/time dialog.
4. Invoice -> Zahlungsziel ändern opens a calendar field.
5. Package -> Bearbeiten shows old/new values.
6. Save & E-Mail vorbereiten requires a second explicit send confirmation.
7. Client Journey supports drag & drop.
8. Settings -> Statusdaten exportieren downloads a JSON backup.
9. booking.html shows a continuous cream -> blush wave without the white wedge.
