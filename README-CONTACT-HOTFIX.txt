Beziehungsdynamiken BUILD 13 – Contact Display Hotfix

Problem
-------
Beim BUILD-13-Abnahmetest wurden interne Kompatibilitäts-IDs wie
__bd13__:... und __bdtest__:... unter Klient:innen als E-Mail angezeigt.
Diese Werte dürfen niemals in der Benutzeroberfläche erscheinen.

Ursache
-------
Alte bzw. gemischte Testdatensätze können in customer_contacts noch einen
internen Schlüssel als primären Kontakt enthalten oder gar keinen sauberen
Kontakt-Eintrag besitzen. Der Dashboard-Fallback griff dann auf customers.email
zurück, wo aus Kompatibilitätsgründen die interne ID liegt.

Fix
---
- Worker bevorzugt echte Kontakt-E-Mails gegenüber internen IDs.
- Worker repariert beim ersten Dashboard-Aufruf fehlende/alte Kontaktzuordnungen.
- Interne IDs werden zusätzlich serverseitig dekodiert, bevor sie als Kontaktfeld
  an das Admin-Frontend gehen.
- Frontend besitzt zusätzlich einen defensiven Filter: __bd13__/__bdtest__ kann
  nicht mehr als sichtbare E-Mail erscheinen.
- Keine D1-Migration erforderlich.

Installation
------------
1. cloudflare-worker/worker.js deployen.
2. Auf GitHub admin.html und admin-build9.js ersetzen.
3. Ctrl+F5.
4. Kund:innen erneut öffnen. Nathanael/Theophil sollten als Kontakt nur
   theophil.kroller@gmail.com anzeigen; Testprofile werden als Sandbox/Test
   gekennzeichnet, sofern is_test in der Identity-Meta gesetzt ist.

Keine Änderungen am Vault. Keine neue D1-Migration.
