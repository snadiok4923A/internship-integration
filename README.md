# InternBoard --- Internship Portal

InternBoard is a full-stack internship portal built as a
production-ready capstone project. It provides a responsive interface
for discovering internship opportunities and submitting applications.

## Live Links

-   **Live website:** https://internship-integration.pages.dev/
-   **Backend API:** https://internship-integration.onrender.com
-   **API health check:**
    https://internship-integration.onrender.com/api/health
-   **GitHub repository:**
    https://github.com/snadiok4923A/internship-integration

The live website has been deployed to Cloudflare Pages, the Express API
is hosted on Render, and production data is stored in Neon PostgreSQL.
The health endpoint was verified to return a successful response with
the database connected. Internship listings loaded on the live website,
and application submission displayed a success message. Submitted
application records were also visible in the Neon `applications` table.

## Features

-   Browse internship opportunities from the API.
-   Search and filter internships by supported fields such as domain,
    location, and work type.
-   View internship details.
-   Submit applications through a form with frontend and backend
    validation.
-   Display loading, empty, error, retry, and success states.
-   Paginated internship API results.
-   SQLite database support for local development.
-   Neon PostgreSQL support for production through `DATABASE_URL`.
-   Health endpoint that reports application and database status.
-   Request logging, security headers, CORS configuration, and rate
    limiting.
-   Accessible interface features including labelled controls, visible
    focus styles, skip navigation, keyboard-friendly dialogs, and live
    status regions.

## Technology Stack

### Frontend

-   HTML
-   CSS
-   JavaScript
-   Cloudflare Pages

### Backend

-   Node.js
-   Express
-   `express-validator`
-   `helmet`
-   `cors`
-   Rate limiting middleware

### Database

-   SQLite for local development
-   PostgreSQL hosted by Neon for production
-   `pg` PostgreSQL client

### Testing and Hosting

-   Node.js test runner
-   Render for the backend API
-   Cloudflare Pages for the static frontend
-   GitHub for source control and deployment integration

## Project Structure

``` text
internship-integration/
├── backend/
│   ├── data/
│   │   └── seed.json
│   ├── database/
│   │   ├── schema.postgres.sql
│   │   └── internships.db       # local generated database, if present
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── DEPLOYMENT.md
├── SECURITY.md
├── TEST_REPORT.md
└── README.md
```

The exact files inside `backend/src/` may vary as the project evolves.

## Run Locally

### Requirements

-   Node.js 18 or later
-   npm
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/snadiok4923A/internship-integration.git
cd internship-integration
```

### 2. Configure the backend

``` bash
cd backend
```

Copy the example environment file:

**Windows PowerShell**

``` powershell
Copy-Item .env.example .env
```

**Windows Command Prompt**

``` cmd
copy .env.example .env
```

Review `.env.example` and set local values if required. Do not commit
`.env` or place secrets in frontend files.

### 3. Install backend dependencies

``` bash
npm install
```

### 4. Start the API

``` bash
npm start
```

If the project has a development script, you can use `npm run dev` for
automatic restarts.

### 5. Serve the frontend

Open a second terminal and serve the `frontend/` directory using VS Code
Live Server or another static web server. The frontend configuration
must point to the local API when developing locally, for example:

``` html
<meta name="api-base-url" content="http://localhost:3000/api">
```

Use the actual port configured by your local backend.

## Production Architecture

``` text
Browser
  |
  v
Cloudflare Pages
Static frontend: frontend/
  |
  | HTTPS API requests
  v
Render
Node.js + Express API
  |
  | DATABASE_URL
  v
Neon PostgreSQL
Production tables: internships, applications
```

### Production URLs

-   Frontend: `https://internship-integration.pages.dev/`
-   API base URL: `https://internship-integration.onrender.com/api`
-   Health: `https://internship-integration.onrender.com/api/health`

The production `api-base-url` meta tag in `frontend/index.html` should
point to the Render API base URL above. Do not use a localhost URL in
the deployed frontend.

## Database Behavior

-   Local development uses SQLite when `DATABASE_URL` is not configured.
-   Production uses PostgreSQL when `DATABASE_URL` is present.
-   The backend initializes the PostgreSQL schema and seeds the six
    internship records when the `internships` table is empty.
-   Neon is the production database. The local SQLite database is not
    automatically migrated to Neon.
-   Existing application records from a local SQLite database must be
    migrated separately if they are needed in production.

Never commit or share the Neon connection string. Keep it in Render
environment variables.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check and database connectivity |
| `GET` | `/api/internships` | List internships with supported filters and pagination |
| `GET` | `/api/internships/:id` | Fetch a single internship |
| `POST` | `/api/applications` | Submit an application |

Example requests:

``` text
GET https://internship-integration.onrender.com/api/health
GET https://internship-integration.onrender.com/api/internships?limit=2&page=1
```

The health endpoint should return HTTP 200 and a JSON response
containing `success: true` and `database: "connected"` when the database
is reachable.

### Internship query parameters

-   `page` --- page number, at least `1`
-   `limit` --- number of results per page, from `1` to `50`
-   `domain` --- exact domain filter
-   `location` --- exact location filter
-   `work_type` --- exact work type filter

## Testing

Run the backend test suite from the `backend/` directory:

``` bash
npm test
```

The test suite is run locally with the Node.js test runner. The final
local run passed nine tests. Coverage
included health checks, internship listing and pagination, missing
internship handling, valid and invalid application submission, rejection
for a nonexistent internship, rate limiting, private application route
protection, and adapter/error-handling cases.

See [TEST_REPORT.md](TEST_REPORT.md) for the distinction between local
automated tests and manual production checks.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the actual Cloudflare Pages,
Render, and Neon configuration and troubleshooting steps.

## Security

See [SECURITY.md](SECURITY.md) for implemented safeguards and remaining
hardening work. This is an educational capstone project and has not
undergone an independent security audit. Do not use it to store
sensitive applicant data without further security review and appropriate
access controls.

## Known Limitations

-   Render's free service may sleep when inactive, causing a delay on
    the first request after inactivity.
-   The current rate limiter is in-memory and is not shared between
    multiple server instances.
-   Public application lookup is disabled. Any future administrative
    lookup must require authentication and authorization before it is
    implemented.
-   Automated Lighthouse/axe scores and an external security audit have
    not been claimed.
-   A walkthrough video is not linked here until it has been recorded,
    published, and verified.

## Walkthrough Video

**Status:** Not yet published.

After recording and uploading a walkthrough, add the verified public or
view-only video URL here. The video should demonstrate the live portal,
responsive layout, search and filters, details, form validation,
successful application submission, API health check, repository
documentation, and test command.

## Author

Created as a full-stack development capstone project for an internship
portal.
