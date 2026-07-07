Backend for the Secret Notes semester project.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `PORT`, `DATABASE_URL`, and `FRONTEND_ORIGIN`.
3. Install dependencies with `npm install`.

## Run

- `npm run db:migrate`
- `npm start`

Or with Docker Compose:

- `docker compose up --build`

## API

- `GET /health`
- `GET /notes`
- `POST /notes`
- `POST /notes/:id`

## Tests

- `npm test`
- `npm run lint`
