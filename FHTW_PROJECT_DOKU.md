# Secret Notes Semester Project

## 1. Project Overview

Secret Notes is a secure note taking application. Notes are stored encrypted in PostgreSQL and can only be decrypted with the correct passphrase.

Current status:
- Frontend and backend are implemented.
- Local Docker setup is available.
- GitHub Actions and Jenkins pipeline definitions are present.
- Jenkins demo freestyle run is green.
- AWS Academy CLI access is verified.
- SonarQube, Snyk, Docker Hub push, and real AWS deployment are still missing.

## 2. Application Stack

### Frontend
- React 18
- React Router
- Vite
- PostHog client integration

### Backend
- Node.js
- Fastify
- PostgreSQL
- AES-256-GCM encryption

## 3. Architecture

The app is split into two services:
- Frontend for note creation, viewing, and passphrase entry.
- Backend for encryption, storage, retrieval, and decryption.

Data flow:
1. User creates a note in the frontend.
2. Frontend sends title, content, and passphrase to the backend.
3. Backend encrypts the content and stores ciphertext, iv, auth tag, and salt in PostgreSQL.
4. User later enters the note id and passphrase.
5. Backend decrypts the stored data only if the passphrase is correct.

## 4. Backend Implementation

### API Endpoints
- `GET /health`
- `GET /notes`
- `POST /notes`
- `POST /notes/:id`

### Encryption
- Algorithm: `aes-256-gcm`
- Key derivation: `scrypt`
- Stored values: `ciphertext`, `iv`, `authTag`, `salt`

### Database
- Table: `notes`
- Columns: `id`, `title`, `ciphertext`, `iv`, `salt`, `auth_tag`

### Tests
- Crypto tests
- Route tests
- Coverage currently reaches 100 percent for backend files.

## 5. Frontend Implementation

### Pages
- Home
- Create Note
- Read Note

### Feature Toggle
- PostHog flag controls the UI theme variant.
- Group A uses the blue theme.
- Group B uses the green theme.

### Tests
- Unit tests for pages and API helpers
- Playwright E2E tests for the main flows

## 6. Local Development

### Backend
- Copy `.env.example` to `.env`
- Set `DATABASE_URL`, `PORT`, and `FRONTEND_ORIGIN`
- Run migrations with `npm run db:migrate`
- Start backend with `npm start`

### Frontend
- Copy `.env.example` to `.env`
- Set `VITE_API_URL`
- Start frontend with `npm run dev`

### Docker
- Backend Dockerfile is present.
- Frontend Dockerfile is present.
- `docker compose up --build` starts PostgreSQL, backend, and frontend.

## 7. Version Control

Branch structure planned in the spec:
- `main`
- feature branches
- `deploy/production`

Current state:
- Repository initialized on GitHub.
- `main` is pushed to `origin`.
- `deploy/production` is not yet used.

## 8. CI/CD

### GitHub Actions
- Backend workflow runs lint, tests, and Docker build.
- Frontend workflow runs lint, tests, build, and E2E.
- Production branch is prepared for deliver and deploy steps.

### Jenkins
- Jenkinsfile exists with stages for lint, test, build, deliver, deploy, and E2E/performance.
- A demo freestyle job has been run successfully with a green build and `SUCCESS`.

### k6
- A simple smoke test script exists for backend health and notes endpoints.

## 9. AWS Status

Verified in AWS Academy Learner Lab:
- AWS CLI works in WSL.
- Default VPC exists.
- Default security group exists.
- No EC2 instances yet.
- No RDS instances yet.

Planned AWS work:
- EC2 for the app stack
- RDS PostgreSQL
- Security groups and networking
- Blue/Green deployment

## 10. Code Quality and Security

Planned tools from the spec:
- SonarQube
- Snyk

Current status:
- Not yet integrated into the pipelines.

Reference docs:
- `QUALITY_SECURITY.md`

## 11. Logging and Monitoring

Outlook only for now:
- CloudWatch
- ELK
- Splunk

## 12. Open Items

- Real Jenkins run
- Docker Hub push verification
- AWS EC2 and RDS setup
- Blue/Green deployment implementation
- SonarQube setup
- Snyk setup
- Final documentation cleanup
