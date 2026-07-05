# CI/CD Setup

## GitHub Actions

- `backend.yml` runs backend lint, tests, and Docker build on `main` and `deploy/production`.
- `frontend.yml` runs frontend lint, tests, build, and Playwright E2E.
- On `deploy/production`, both workflows also try Docker Hub push and AWS deploy steps when secrets are configured.

## Jenkins

- `Jenkinsfile` mirrors the same stages for the self-hosted CI setup.
- It expects the repo to be checked out on a Jenkins agent with Docker available.
- Detailed setup notes are in `JENKINS_SETUP.md`.

## Required Secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKERHUB_REPOSITORY`
- `AWS_DEPLOY_HOST`
- `AWS_DEPLOY_USER`
- `AWS_DEPLOY_SSH_KEY`

## Blue/Green

- The deploy steps are written as EC2 SSH placeholders.
- In a real setup, the remote `docker compose` command should switch traffic between blue and green stacks behind a load balancer.

## Performance

- `k6/backend-loadtest.js` runs simple smoke load checks against `/health` and `/notes`.
