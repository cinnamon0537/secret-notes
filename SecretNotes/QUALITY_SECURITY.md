# SonarQube and Snyk

## SonarQube

- Static code analysis, code smells, duplication detection, and maintainability metrics.
- Runs in `.github/workflows/quality.yml` (GitHub Actions) and `Jenkinsfile` (self-hosted CI).

### Local Setup

```bash
# Start SonarQube
docker compose up -d sonarqube

# Configure projects and generate token
bash scripts/setup-sonarqube.sh
```

- URL: `http://localhost:9000`
- Default credentials: `admin / admin` (script changes password to `admin123`)

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SONAR_HOST_URL` | SonarQube server URL |
| `SONAR_TOKEN` | User token for authentication |
| `SONAR_BACKEND_PROJECT_KEY` | `secret-notes-backend` |
| `SONAR_FRONTEND_PROJECT_KEY` | `secret-notes-frontend` |

## Snyk

- Dependency and vulnerability scanning.
- Runs in `.github/workflows/quality.yml` (GitHub Actions) and `Jenkinsfile` (self-hosted CI).
- Uses `npx snyk` (no package dependency required).

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SNYK_TOKEN` | Snyk API token from https://app.snyk.io/account/auth-token |

Registration: https://snyk.io (free plan available).

## Jenkins Integration

Both SonarQube and Snyk stages are defined in the `Jenkinsfile` with conditional execution (skipped when credentials are missing). Required Jenkins credentials:

- `sonar-host-url`, `sonar-token`, `sonar-backend-project-key`, `sonar-frontend-project-key`
- `snyk-token`
