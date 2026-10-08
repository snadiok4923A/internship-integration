# Internship Integration Project

This project brings together the internship listing interface and a secure backend API into a single Task 04 application. It keeps the original Task 02 and Task 03 projects untouched while adding a fresh Express + SQLite service and a frontend that consumes it.

## Project structure

- `backend/` — Express API, SQLite schema, validations, and middleware
- `frontend/` — static internship board UI that fetches data from the API
- `tests/` — Node test suite covering the core API behaviors

## Features

- Internship listing with search, filtering, sorting, and pagination
- Loading, empty, and error states in the UI
- Secure application form submission with frontend and backend validation
- SQLite persistence with seeded internship records
- Helmet, CORS, rate limiting, and environment-based config

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

5. Open the frontend in a browser by serving `frontend/` or using a local static file server. The UI calls the API at `http://localhost:3000/api` by default.

## API endpoints

- `GET /api/health` — health check
- `GET /api/internships` — list internships with pagination and filters
- `GET /api/internships/:id` — fetch a single internship
- `POST /api/applications` — apply for an internship
- `GET /api/applications/:id` — fetch an application record

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

## Notes

This project intentionally keeps the original Task 02 and Task 03 codebases unchanged. The Task 04 implementation is a separate project directory with its own backend and frontend.
