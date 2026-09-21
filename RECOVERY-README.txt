BEZIEHUNGSDYNAMIKEN – EMERGENCY RECOVERY
=========================================

DIAGNOSE
Am 21.09.2026 wurden mehrere zentrale Dateien im GitHub-Repository als
0-Byte-Dateien gespeichert. Dadurch sind u.a. Admin-Login und Funktionen,
die cart.js benötigen, ausgefallen.

Dieses Paket enthält ausschließlich die letzten bekannten, in GitHub
nachweislich intakten Versionen aus Commit:
58759f4f242bfdb4d45c8dd42f8567fd9edc0848

SOFORT-REPARATUR
1. Lade die 12 Dateien aus diesem Ordner in das ROOT deines GitHub-Repositories.
2. Bei GitHub jeweils "Replace" / Überschreiben bestätigen.
3. NICHT den Ordner _OPTIONAL_CLOUDFLARE_ROLLBACK nach GitHub hochladen.
4. Nach dem GitHub-Upload 1–2 Minuten warten und im Browser Ctrl+F5.
5. Teste:
   - booking.html
   - admin.html
   - zugang.html

Cloudflare Worker:
Zunächst NICHT ändern. Der aktuelle Ausfall im GitHub-Frontend ist eindeutig
durch leere Dateien erklärbar.
Nur falls die Buchung NACH Wiederherstellung der statischen Dateien weiterhin
scheitert, kann worker_BUILD12_known_good.js aus dem optionalen Ordner als
Rollback im Cloudflare Worker verwendet und neu deployed werden.

Vault:
NICHT verändern. data/ NICHT verändern.

WICHTIG
Dieser Recovery-Schritt entfernt die fehlerhafte BUILD-12.1-Frontend-Änderung.
Die Identitäts-/Sandbox-Verbesserungen aus 12.1 bauen wir danach erneut auf
Basis des wiederhergestellten, funktionierenden Stands.
