# CI/CD Setup

## GitHub Actions

- `backend.yml` runs backend lint, tests, and Docker build on `main` and `deploy/production`.
- `frontend.yml` runs frontend lint, tests, build, and Playwright E2E.
- `quality.yml` runs optional SonarQube and Snyk scans for backend and frontend when the required secrets are configured.
- On `deploy/production`, both workflows also push Docker images and trigger an EC2 pull-and-restart deploy when secrets are configured.

## Jenkins

- `Jenkinsfile` mirrors the same stages for the self-hosted CI setup.
- It expects the repo to be checked out on a Jenkins agent with Docker available.
- Detailed setup notes are in `JENKINS_SETUP.md`.

## Required Secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKERHUB_REPOSITORY`
- `SONAR_HOST_URL`
- `SONAR_TOKEN`
- `SONAR_BACKEND_PROJECT_KEY`
- `SONAR_FRONTEND_PROJECT_KEY`
- `SNYK_TOKEN`
- `AWS_DEPLOY_HOST`
- `AWS_DEPLOY_USER`
- `AWS_DEPLOY_SSH_KEY`
- `SLACK_WEBHOOK_URL` (optional, for failure notifications)

## Blue/Green

- `docker-compose.prod.yml` defines both blue and green stacks sharing one PostgreSQL instance.
- Blue runs on internal ports (frontend-blue:80, backend-blue:3000).
- Green runs on internal ports (frontend-green:80, backend-green:3001).
- An nginx reverse proxy sits on port 80 and routes to the active stack based on upstream configuration.
- `nginx/nginx.conf` is the live config; `nginx/nginx.conf.blue` and `nginx/nginx.conf.green` are the upstream templates.
- `scripts/blue-green-switch.sh` orchestrates the full switch including health checks, nginx reload, verification, and rollback on failure.
- State is tracked in `.blue-green-state`.

### Switch workflow
1. Pull latest Docker Hub images.
2. Start the inactive stack (`docker compose up -d backend-<color> frontend-<color>`).
3. Health check the new backend directly (`curl localhost:<port>/health`).
4. Swap the nginx upstream config and reload nginx.
5. Verify traffic through the proxy (`curl localhost:80/api/health`).
6. Stop the old stack.
7. On any failure: nginx is rolled back to the previous upstream, traffic stays on the old stack.

## Fehlerbenachrichtigung

- **Jenkins**: Bei Pipeline-Fehlern sendet Jenkins Slack-Benachrichtigungen (via `slackSend`) und E-Mails (via `emailext`), sofern die Umgebungsvariablen `SLACK_WEBHOOK_URL`, `SLACK_CHANNEL`, `SLACK_CREDENTIAL_ID` und `NOTIFICATION_EMAIL` gesetzt sind. Bei erfolgreichen `deploy/production`-Builds wird eine Slack-Erfolgsmeldung gesendet.
- **GitHub Actions**: Alle Workflows (`backend.yml`, `frontend.yml`, `quality.yml`) enthalten einen `notify`-Job, der bei Fehlern im `deploy/production`-Branch eine Slack-Benachrichtigung über `slackapi/slack-github-action@v2` sendet, sofern das `SLACK_WEBHOOK_URL`-Secret konfiguriert ist.
- Fehlen die Secrets, werden die Benachrichtigungen mit einer Info-Meldung übersprungen.

## Performance

- `k6/backend-loadtest.js` runs simple smoke load checks against `/health` and `/notes`.
