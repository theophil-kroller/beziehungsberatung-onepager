Beziehungsdynamiken 15.12.32 – Secure Practice Vault Mac Update

Die ZIP enthält ausschließlich Programmdateien – keine .venv, Whisper-Modelle oder Klientendaten.

Installation:
1. Vault auf Ilonas Mac sicher beenden: Terminal mit laufendem start_vault.sh mit Ctrl+C stoppen.
2. ZIP entpacken. Im Terminal in den entpackten Ordner wechseln und 
   ./install_mac_update.sh ausführen.
3. Der Installer schreibt nur die freigegebenen Programmdateien nach ~/Documents/vault
   und überschreibt NICHT den Datenordner, die lokale Python-Umgebung oder andere Dateien.
4. Vault neu starten: cd ~/Documents/vault && BD_WHISPER_MODEL=small ./start_vault.sh
5. In der Praxisverwaltung beim Vault den Build 15.12.32 kontrollieren.

Hinweis: Vor dem ersten echten Passwortwechsel Backup erstellen und danach Daten überprüfen.
Zwei-Faktor-Anmeldung bleibt bis zur ausdrücklichen Aktivierung durch Owner AUS.
