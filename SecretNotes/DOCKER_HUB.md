# Docker Hub

## Intended Image Names

- `secret-notes-backend`
- `secret-notes-frontend`

## Tagging Strategy

- `backend-latest` / `frontend-latest` for the most recent production-ready images
- `backend-YYYYMMDD-HHMMSS` / `frontend-YYYYMMDD-HHMMSS` for immutable builds

## Verified Push

- Repository: `cinnamon0/secret-notes`
- Backend push: `backend-latest` + `backend-20260705-234114` — digest `sha256:27503fd...`
- Frontend push: `frontend-latest` + `frontend-20260705-234116` — digest `sha256:fed21b4...`
- Both images pushed successfully via Docker Desktop on Windows.

## Pipeline Usage

- GitHub Actions builds and pushes `backend-latest` / `frontend-latest` plus SHA-tagged images on `deploy/production` when secrets are configured.
- The EC2 deploy step pulls the `latest` tags and restarts the compose services.
- Jenkins is documented to do the same in the Deliver stage.

## Current Status

- Docker Hub push verified: both backend and frontend images are on `cinnamon0/secret-notes`.
- EC2 pull-and-deploy flow is wired in GitHub Actions and documented.
