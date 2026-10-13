# 15.12.103 installieren
1. Auf den Stand 15.12.102 den Website-MINI-PATCH **im Repository-Stamm** entpacken; besonders `site-mode15-5.js`, `private-preview15-12-57.css`, `index.html`, `admin.html` und die neuen `practice-*.js/css` committen.
2. Nach GitHub-Pages-Deployment in Opera/Chrome ein neues privates Fenster ohne CRM-Sitzung öffnen. `hub.html` oder `message-center.html` muss direkt zum Admin-Login umleiten.
3. Im Login das Portal testen; bei aktiviertem `prefers-reduced-motion` dürfen die Kreise nicht animieren.
4. Landing Page laden und prüfen: sichtbares Icon besteht aus den drei gebogenen/überlappenden Linien der vorhandenen Admin-Marke (kein gezeichnetes Doppelring-SVG).
5. Nach Magic-Link-Login zurück zum angefragten Workspace. Danach auf Logout, Reload, abgelaufene Session und unberechtigte Worker-Anfragen testen.

Keine D1-Migration und **kein Cloudflare-Worker-Deployment für diesen UI-Fix erforderlich**. Client-Gating ist keine vollständige Sicherheitsprüfung.
