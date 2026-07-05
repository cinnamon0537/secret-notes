# Secret Notes Checklist

Stand: 2026-07-05

## 1. App Kern

- [x] Frontend für Notes erstellen und anzeigen
- [x] Backend mit Fastify bereitstellen
- [x] Notes verschlüsselt speichern
- [x] Notes mit korrektem Schlüssel entschlüsseln
- [x] Fehler bei falschem Schlüssel zurückgeben

## 2. Frontend

- [x] Create-Note-Ansicht
- [x] Read-Note-Ansicht
- [x] Routing zwischen Seiten
- [x] PostHog-Feature-Flag im UI verwendet
- [x] Dockerfile für Frontend vorhanden
- [x] Unit-Tests für Frontend vorhanden
- [x] Playwright E2E-Tests vorhanden
- [x] Frontend-CI lokal wieder grün

## 3. Backend

- [x] Notes API für Create/List/Decrypt vorhanden
- [x] AES-256-GCM Verschlüsselung implementiert
- [x] DB-Zugriff auf PostgreSQL vorhanden
- [x] Migrationsskript vorhanden
- [x] Dockerfile für Backend vorhanden
- [x] Unit-Tests für Crypto und Routen vorhanden
- [x] Backend-Lint läuft
- [x] Backend-Tests laufen

## 4. Datenbank / Docker

- [x] PostgreSQL-Schema für Notes vorhanden
- [x] docker-compose für lokale Ausführung vorhanden
- [x] Frontend und Backend containerisiert
- [ ] Docker Hub Push in echter Pipeline verifiziert

## 5. CI/CD

- [x] GitHub Actions für Backend vorhanden
- [x] GitHub Actions für Frontend vorhanden
- [x] Jenkinsfile für self-hosted CI vorhanden
- [x] Jenkins-Setup dokumentiert
- [x] Jenkins-Demo-Run erfolgreich
- [x] Docker Hub Dokumentation angelegt
- [x] Lint-Stufe vorhanden
- [x] Test-Stufe vorhanden
- [x] Build-Stufe vorhanden
- [x] E2E-Stufe vorhanden
- [x] k6-Smoke-Test vorhanden
- [ ] Deliver-Stufe gegen Docker Hub voll verifiziert
- [ ] Deploy-Stufe auf AWS voll verifiziert
- [ ] Fehlerbenachrichtigung integriert

## 6. AWS / Deployment

- [x] AWS CLI Zugriff in WSL verifiziert
- [x] AWS baseline geprüft (default VPC, default SG, no EC2, no RDS)
- [ ] EC2-Setup dokumentiert
- [ ] RDS-Setup dokumentiert
- [ ] Security Groups / Netzwerk dokumentiert
- [ ] Blue/Green Deployment produktionsnah umgesetzt
- [ ] Traffic-Switch zwischen Blue/Green implementiert

## 7. Code Quality / Security

- [ ] SonarQube eingerichtet
- [ ] SonarQube-Analyse in Pipeline integriert
- [ ] Snyk eingerichtet
- [ ] Snyk-Scan in Pipeline integriert
- [x] PostHog-Dokumentation angelegt
- [x] Docker Hub Tagging-Dokumentation angelegt
- [x] AWS Deployment-Dokumentation angelegt
- [x] SonarQube/Snyk-Dokumentation angelegt

## 8. Feature Toggle / A/B Testing

- [x] PostHog-Integration im Frontend vorhanden
- [x] UI-Theme-Flag im App-Flow genutzt
- [ ] PostHog-Setup dokumentiert
- [ ] A/B-Test-Plan dokumentiert
- [ ] Umschalten ohne Redeploy erklärt

## 9. Tests / Abdeckung

- [x] Mehrere Frontend-Unit-Tests vorhanden
- [x] Mehrere Backend-Unit-Tests vorhanden
- [x] E2E-Tests vorhanden
- [x] Backend-Coverage auf 100% gebracht
- [ ] Mindestens 10 sinnvolle Tests pro Projekt sauber nachgewiesen im finalen Bericht

## 10. Dokumentation

- [x] Root-CI/CD-Doku angelegt
- [x] Backend-README erweitert
- [x] FHTW-Hauptdoku als Entwurf angelegt
- [ ] FHTW-Template-Dokumentation vollständig ausarbeiten
- [ ] Setup / Usage dokumentieren
- [ ] Architektur dokumentieren
- [ ] Docker-Nutzung dokumentieren
- [ ] AWS / CI / SonarQube / Snyk / PostHog dokumentieren
- [ ] Blue/Green dokumentieren
- [ ] Logging / Monitoring Ausblick dokumentieren

## 11. Abgabe-Readiness

- [x] Projekt ist lokal lauffähig
- [x] GitHub-Repo initialisiert und gepusht
- [x] CI/CD-Grundgerüst im Repo
- [ ] Finaler Review gegen alle Pflichttechnologien
- [ ] Screenshot-/Log-Nachweise sammeln

## Update Log

- 2026-07-05: Backend fertiggestellt, Tests ergänzt, CI/CD-Grundgerüst hinzugefügt, GitHub Push durchgeführt.
- 2026-07-05: AWS Academy CLI-Credentials in WSL gesetzt und `sts get-caller-identity` plus `ec2 describe-instances` erfolgreich geprüft.
- 2026-07-05: AWS Baseline geprüft: default VPC und default Security Group vorhanden, keine EC2/RDS-Instanzen im Lab.
- 2026-07-05: Frontend-CI repariert durch ESLint-Konfiguration und Umstellung von Vitest auf `run`-Mode.
- 2026-07-05: Frontend-CI final repariert durch Hinzufügen von `eslint` als Dev-Dependency.
- 2026-07-05: Screenshot-Plan erstellt, Jenkins-Screenshot bleibt bis zum echten Jenkins-Run offen.
- 2026-07-05: Erste AWS- und GitHub-Actions-Screenshots im `screenshots/`-Ordner vorhanden.
- 2026-07-05: FHTW-Hauptdoku als strukturierter Entwurf angelegt.
- 2026-07-05: Jenkins-Setup-Doku ergänzt.
- 2026-07-05: Jenkinsfile um Compose-basierten E2E-/k6-Ablauf ergänzt.
- 2026-07-05: Jenkins-Demo-Freestyle-Job erfolgreich mit grünem Build und `SUCCESS` ausgeführt.
- 2026-07-05: Docker Hub, AWS Deployment, Quality/Security und PostHog Dokumentation ergänzt.
