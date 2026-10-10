# Internship Integration Project

This project is a production-ready capstone iteration of an internship portal: a responsive static frontend consumes an Express API backed by SQLite locally or PostgreSQL in production. It preserves the existing Task 02–04 architecture while adding stronger reliability, observability, accessibility, and deployment documentation.

## Project structure

- `backend/` — Express API, SQLite/PostgreSQL database adapter, schemas, validations, and middleware
- `frontend/` — static internship board UI that fetches data from the API
- `tests/` — Node test suite covering the core API behaviors

## Features

- Internship listing with search, filtering, sorting, and pagination
- Loading, empty, and error states in the UI
- Secure application form submission with frontend and backend validation
- SQLite persistence with seeded internship records for local development
- PostgreSQL/Neon support for production using `DATABASE_URL`
- Helmet, CORS, rate limiting, and environment-based config
- Safe DOM rendering, keyboard-friendly dialogs, accessible form errors, and retry states
- Database-aware health checks, request logging, and graceful shutdown

## Prerequisites

- Node.js 18+
- npm

## Setup

1. Open a terminal in `backend/`.
2. Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the API:

   ```bash
   npm start
   ```

   or for automatic restart during development:

   ```bash
   npm run dev
   ```

5. Serve `frontend/` with a local static server. The checked-in local configuration points to `http://localhost:3000/api` for VS Code Live Server. For deployment, replace the `api-base-url` meta tag in `frontend/index.html` with the actual backend URL plus `/api`.

## Database configuration

Local development uses SQLite and preserves `backend/database/internships.db`.

For production, set `DATABASE_URL` to the Neon connection string. When that variable is present, the backend selects PostgreSQL, creates the PostgreSQL tables from `backend/database/schema.postgres.sql`, and seeds the six records from `backend/data/seed.json` if the `internships` table is empty.

Never commit `.env` or paste the Neon connection string into frontend files. Use `backend/.env.example` as the configuration template.

## API endpoints

- `GET /api/health` — health check
- `GET /api/internships` — list internships with pagination and filters
- `GET /api/internships/:id` — fetch a single internship
- `POST /api/applications` — apply for an internship
- `GET /api/applications/:id` — fetch an application record

Health responses include `database: "connected"` when SQLite is available. Unexpected server errors return a generic message and are logged server-side.

### Query parameters

- `page` — page number, must be >= 1
- `limit` — items per page, 1–50
- `domain` — exact domain filter
- `location` — exact location filter
- `work_type` — exact work type filter

## Security notes

- `helmet` adds standard HTTP security headers
- `cors` allows only the configured local origins
- `express-validator` checks required form fields and URL/email formats
- SQLite queries use parameterized statements
- Rate limiting is enabled for general API traffic and application submissions
- Sensitive configuration is loaded from `.env`, not hardcoded in source files

## Testing

Run the project test suite from `backend/`:

```bash
npm test
```

The tests validate health checks, internship retrieval, invalid IDs, application validation, missing internships, and rate limiting behavior.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Cloudflare Pages, Render Free, Neon PostgreSQL, API URL configuration, environment variables, troubleshooting, and the walkthrough recording checklist. No live URL or video URL is listed until it is actually deployed and verified.

## Documentation and limitations

- [SECURITY.md](SECURITY.md) documents the implemented controls and remaining production risks.
- [TEST_REPORT.md](TEST_REPORT.md) records commands that were actually executed.
- Neon PostgreSQL is the recommended production database, and the in-memory rate limiter is not shared across multiple instances.

## Notes

This project intentionally keeps the original Task 02 and Task 03 codebases unchanged. The Task 04 implementation is a separate project directory with its own backend and frontend.
