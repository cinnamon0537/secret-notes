# Screenshot Plan

Stand: 2026-07-05

## Jetzt möglich

- [x] `aws sts get-caller-identity`
- [x] `aws ec2 describe-vpcs`
- [x] `aws ec2 describe-security-groups`
- [x] `aws ec2 describe-instances` mit leerem Ergebnis
- [x] `aws rds describe-db-instances` mit leerem Ergebnis
- [x] GitHub Actions Backend erfolgreich
- [x] GitHub Actions Frontend erfolgreich nach Fix
- [x] Frontend Lint/Test/Build lokal grün
- [x] Backend Lint/Test lokal grün
- [x] Docker Compose lokal laufend

## Später

- [ ] Jenkins-Job mit grünem Pipeline-Run
- [ ] Jenkins-Konsole mit `SUCCESS`
- [ ] Docker Hub Push mit echten Tags
- [ ] SonarQube Quality Gate
- [ ] Snyk Scan Ergebnis
- [ ] PostHog Flag / A-B-Variante im UI
- [ ] EC2-Instanz mit Secret Notes
- [ ] RDS PostgreSQL Instanz
- [ ] Blue/Green Deployment vor und nach Traffic-Switch
- [ ] k6 Lauf gegen laufendes Backend
- [ ] Playwright E2E gegen laufendes System

## Empfehlung für die Abgabe

1. Erst alle `Jetzt möglich`-Screenshots sichern.
2. Danach Jenkins, Docker Hub, SonarQube, Snyk und AWS-Ressourcen erzeugen.
3. Dann die `Später`-Screenshots ergänzen.
