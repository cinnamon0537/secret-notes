# Docker Hub

## Intended Image Names

- `secret-notes-backend`
- `secret-notes-frontend`

## Tagging Strategy

- `backend-${GITHUB_SHA}` / `frontend-${GITHUB_SHA}` for immutable builds
- `backend-latest` / `frontend-latest` for the most recent production-ready images

## Pipeline Usage

- GitHub Actions is prepared to build and push images on `deploy/production` when secrets are configured.
- Jenkins is documented to do the same in the Deliver stage.

## Current Status

- Docker Hub push is prepared in code and docs.
- Real push verification is still open because no Docker runtime is available in this WSL session.
