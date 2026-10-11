# Beziehungsdynamiken 15.12.48 — QR-TOTP und individuelle 2FA

Basis: rekonstruiert aus FULL 15.12.44 + PATCHES 15.12.45/46/47.

Neu: Offline/first-party QR-Rendering der otpauth-URL; manueller Schlüssel bleibt nutzbar. Persönliche 2FA-Pflicht getrennt von der Owner-Team-Pflicht. Aktivierung invalidiert eigene Sessions; E-Mail-Link und TOTP oder Recovery-Code erforderlich. Mobile-Code-Login wird bei individuell verpflichtender 2FA gesperrt.

Deployment: zuerst frühere MFA-Migration 015_12_32_mfa.sql und BD_MFA_MASTER_KEY sicherstellen; dann neue D1-Migration 015_12_48_personal_mfa.sql, danach Cloudflare-Worker deployen, danach Webdateien veröffentlichen. Keine Secrets in GitHub veröffentlichen. DB-Backup vor Migration. Bestehende MFA-Registrierungen bleiben bestehen.

Noch nicht live getestet: Worker gegen echte Cloudflare D1, Mac-Vault, produktive Login- und Recovery-Flows. Vor Produktivpflicht mit Testaccount prüfen.
