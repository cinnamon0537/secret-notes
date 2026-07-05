# Screenshot Plan

Stand: 2026-07-05

## Jetzt möglich

- [x] `aws sts get-caller-identity` (`screenshots/aws_sts_get-caller-identity.png`)
- [x] `aws ec2 describe-vpcs` (`screenshots/aws_ec2_describe-vpcs.png`)
- [x] `aws ec2 describe-security-groups` (`screenshots/aws_ec2_describe-security-groups.png`)
- [x] `aws ec2 describe-instances` mit leerem Ergebnis (`screenshots/aws_ec2_describe-instances_mit_leerem_Ergebnis.png`)
- [x] `aws rds describe-db-instances` mit leerem Ergebnis (`screenshots/aws_rds_describe-db-instances_mit_leerem_Ergebnis.png`)
- [x] GitHub Actions Backend erfolgreich (`screenshots/GitHub_Actions_erfolgreich_für_Backend.png`)
- [x] GitHub Actions Frontend erfolgreich nach Fix (`screenshots/GitHub_Actions_erfolgreich_für_Frontend.png`)
- [ ] Frontend Lint/Test/Build lokal grün
- [ ] Backend Lint/Test lokal grün
- [ ] Docker Compose lokal laufend

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
