# Beziehungsdynamiken · Installation 15.12.92

## Neu in diesem Release

1. **GTD-Kanban im Praxis-Cockpit:** Inbox, Working On, Waiting For, Done, Archive, Drag-and-drop und Statusauswahl, Fälligkeit/Uhrzeit, Priorität, Notizen, bis zu 24 Unteraufgaben und ein Warten-auf-Feld.
2. **Gottman Assessment III – Fallformulierung und Feedback:** 96 eigenständige Dialoggrundlagen in zwölf Themenbereichen, 60 Wissensfragen, sieben Entscheidungsschritte, 20 Levels, Mastery-Prüfung, Feedbackvergleich, 💪-Wiederholung und stummschaltbarer Erfolgston.
3. Bestehende Aufgaben, Notizen und Academy-Lernstände bleiben erhalten.

## Website aktualisieren

- Wenn deine GitHub-Pages-Website bereits Version **15.12.91** verwendet: den Inhalt von `Beziehungsdynamiken_15.12.92_MINI_PATCH_WEBSITE.zip` als **Overlay** ins GitHub-Repository kopieren. Vorhandene Dateien nicht löschen.
- GitHub Pages abwarten, `admin.html` neu laden, bei Bedarf mit Strg+F5 den Cache aktualisieren.
- Im Cockpit: Secure Practice Vault **starten und entsperren**, dann `Merken & Aufgaben` prüfen. Früher vorhandene offene Aufgaben sollten in der Inbox erscheinen; abgeschlossene und archivierte Aufgaben in den jeweiligen Spalten.
- Zum Trainieren Academy → Welt der Beziehungshäuser → Gottman Level 1 · Assessment III.

## Speicherprinzip und Voraussetzung

- **Kein zusätzlicher Cloudflare-Datenspeicher:** Das GTD-Board nutzt dieselben lokalen, verschlüsselten `/cockpit/entries`-Einträge wie das bestehende Cockpit. Stage, Warten-auf und Unteraufgaben werden in einem kompatiblen, strukturierten Zusatz am Ende der **bereits verschlüsselten Beschreibung** gespeichert. Normaler Aufgabentext bleibt erhalten. Alte Aufgaben erscheinen ohne Migration in der Inbox.
- Die **aktuelle lokale Vault-Installation muss laufen und entsperrt sein**; ohne Vault können keine Aufgaben gelesen oder gespeichert werden. Das Kanban ist nicht automatisch zwischen zwei Geräten synchronisiert. Es gibt keine D1-Migration.
- Das bereits vorhandene Cockpit-Aufgabenformat hat ein Limit von **5.000 Zeichen** für die Beschreibung einschließlich des strukturierten Zusatzes. Unteraufgaben deshalb bewusst kompakt halten (maximal 24).
- Der Legacy-Aufgabeneditor in `admin-build14-13.js` wurde aktualisiert, damit er die zusätzlichen Board-Felder beim Bearbeiten älterer Einträge erhält.

## Cloudflare und Desktop

- Für lokales GTD und persönliches Academy-Training genügt das Website-Update; **kein Cloudflare-Deployment erforderlich**.
- Nur zur **Owner-Freigabe und Cloud-Speicherung** des neuen Academy-Moduls `gottmanplan` muss der aktualisierte Worker aus `Beziehungsdynamiken_15.12.92_CLOUDFLARE_WORKER.zip` veröffentlicht werden. Keine D1-Migration.
- Optionale neu kompilierte Windows- und Mac-Pakete enthalten die Website innerhalb der Desktop-App. Die bestehende Mac-Version von Ilona kann unverändert bleiben.

## Fachliche Grundlage

- Gottman Method Couples Therapy, Level 1 Training Manual (©2000–2016), insbesondere §§ 2.4, 5.1, 5.2, 5.2.1–5.2.3. Alle Fälle sind **selbst formuliert**; keine Originalfragebögen, Arbeitsblätter, Bewertungsskalen oder Manualseiten ausgeliefert.
- Bei Gewalt, Zwang, Suizidalität und Gesundheitsrisiken hat Gefährdungsabklärung Vorrang. Das Training ist kein diagnostisches Werkzeug und ersetzt Ausbildung und Supervision nicht.
- 96 verschiedene Ausgangsdialoge, die sieben Phasen verwenden eine gemeinsame kuratierte Antwortlogik; es sind keine vollständig unabhängigen therapeutischen Simulationen.

## Teststatus

- Automatisierte JS-Syntax- und Inhaltsprüfung; Browser: 14 vollständige Fallsequenzen (98 Schritte), 24-Fragen-Prüfung, Profilwechsel, 💪-Modus, Sound und Stummschalten.
- GTD-Browser: bestehende Aufgabe in Inbox, verschieben, Unteraufgaben, Fälligkeit, Waiting For, Drag-and-drop zu Done, archivieren, neue Aufgaben und Notizen.
- Desktoptrainer auf 1440×800 ohne Scrollen.
- Go-Test, Windows-/Mac-Kompilierung und ZIP-Integrität werden im Release-Schritt geprüft.
- **Noch nicht bestätigt:** produktiver Cloudflare-Sync, die Live-Website und tatsächliche Windows-/Mac-Geräte.
