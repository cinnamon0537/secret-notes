# Secret Notes Semester Project

## 1. Project Overview

Secret Notes is a secure note taking application. Notes are stored encrypted in PostgreSQL and can only be decrypted with the correct passphrase.

Current status:
 - Frontend and backend are implemented.
 - Local Docker setup is available.
 - GitHub Actions and Jenkins pipeline definitions are present.
 - Real Jenkins CI run is green (`SecretNotes-CI`).
 - Docker Hub push verified (`cinnamon0/secret-notes`, backend+frontend deployed on EC2 from those images).
 - AWS Academy CLI access was verified.
 - AWS EC2 and RDS deployment is verified (session currently expired).
 - Blue/Green compose definitions and switch script are present.
 - SonarQube and Snyk workflow scaffolding is present, but live secrets are still missing.

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
- The compose file uses local PostgreSQL by default and can be pointed at RDS by setting `DATABASE_URL` and `DATABASE_SSL=true`.

### Usage
- Open the frontend in the browser and create a note with title, content, and passphrase.
- Use the note id plus passphrase on the read page to decrypt the note.
- `GET /health` is the simplest deployment health check.

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
 - A real CI freestyle job `SecretNotes-CI` has been run, executing backend lint/test and frontend lint/test/build, all green.

### k6
- A simple smoke test script exists for backend health and notes endpoints.

## 9. AWS Status

Verified in AWS Academy Learner Lab:
- AWS CLI works in WSL.
- Default VPC exists.
- Default security group exists.
- EC2 instance `i-091ccbfc8f4dbd015` is running on `16.145.90.89`.
- RDS PostgreSQL `secret-notes-db` is running on `secret-notes-db.czah9i5vgwj0.us-west-2.rds.amazonaws.com`.
- EC2 and RDS use dedicated security groups.

Current AWS work:
- Document the final network flow.
- Capture screenshots for the live AWS resources.
- Prepare blue/green deployment.

### Network Flow
- The EC2 instance hosts the Docker Compose stack.
- The frontend is exposed on port 80.
- The backend is exposed on port 3000 for direct health checks.
- The backend connects to RDS PostgreSQL over the dedicated RDS security group.
- The EC2 security group allows SSH, HTTP, and backend access for lab verification.

### Blue/Green Outline
- `docker-compose.prod.yml` defines both blue and green stacks sharing one database.
- Blue is the currently live stack on ports 80/3000.
- Green is the next stack on ports 8080/3001.
- The new stack should be started and verified first.
- Only after health checks pass should traffic be moved to the new stack.
- `scripts/blue-green-switch.sh` automates the switch.

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
- These are not wired into the app yet; they remain future work.

## 12. Open Items

- AWS session refresh for EC2 Docker Hub pull verification
- SonarQube setup with live server
- Snyk setup with live token
- Blue/green traffic-switch verification
- Final screenshot collection
