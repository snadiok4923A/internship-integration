# InternBoard — Internship Portal

InternBoard is a full-stack internship portal built as a capstone project. It provides a responsive interface for discovering internship opportunities, filtering listings, viewing internship details, and submitting applications.

## Live Links

- **Live Website:** https://internship-integration.pages.dev/
- **Backend API:** https://internship-integration.onrender.com
- **API Health Check:** https://internship-integration.onrender.com/api/health
- **GitHub Repository:** https://github.com/snadiok4923A/internship-integration
- **Walkthrough Video:** https://youtu.be/NZU1yMqdoPY

The frontend is deployed on Cloudflare Pages, the Express backend is hosted on Render, and production data is stored in Neon PostgreSQL.

## Walkthrough Video

Watch the project walkthrough to see the live portal, internship listings, application interface, backend health check, security endpoint, GitHub documentation, and automated test results.

**Video:** [Watch InternBoard Walkthrough](https://youtu.be/NZU1yMqdoPY)

## Features

- Browse internship opportunities from the backend API.
- Search and filter internships by supported fields, including domain, location, and work type.
- View individual internship details.
- Submit applications using a form with frontend and backend validation.
- Display loading, empty, error, retry, and success states.
- Retrieve paginated internship results from the API.
- Use SQLite for local development.
- Use Neon PostgreSQL for production through `DATABASE_URL`.
- Check API and database status through a health endpoint.
- Use request logging, security headers, CORS configuration, and rate limiting.
- Support accessible interface features, including labelled controls, visible focus styles, skip navigation, keyboard-friendly dialogs, and live status regions.

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Cloudflare Pages

### Backend

- Node.js
- Express.js
- express-validator
- Helmet
- CORS
- Rate-limiting middleware

### Database

- SQLite for local development
- Neon PostgreSQL for production
- PostgreSQL client (`pg`)

### Testing and Deployment

- Node.js built-in test runner
- Git and GitHub
- Render for backend hosting
- Cloudflare Pages for frontend hosting

## Project Structure

```text
internship-integration/
├── backend/
│   ├── data/
│   │   └── seed.json
│   ├── database/
│   │   ├── schema.postgres.sql
│   │   └── internships.db
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── tests/
├── .postman/
├── postman/
├── DEPLOYMENT.md
├── SECURITY.md
├── TEST_REPORT.md
└── README.md
```

The generated local database file may not be present in every checkout. The exact source files may evolve as the project is maintained.

## Getting Started

### Requirements

- Node.js and npm
- Git
- A web browser
- VS Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/snadiok4923A/internship-integration.git
cd internship-integration
```

### 2. Configure the Backend

```bash
cd backend
```

Create a local environment file.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

Review `.env.example` and configure the required local values. Never commit `.env` or expose database credentials in frontend code.

### 3. Install Dependencies

Run inside the `backend/` directory:

```bash
npm install
```

### 4. Start the Backend API

```bash
npm start
```

Keep the backend terminal running.

### 5. Serve the Frontend

Open a second terminal and serve the `frontend/` directory using VS Code Live Server or another static web server.

For local development, ensure the frontend API configuration points to the local backend. For example:

```html
<meta name="api-base-url" content="http://localhost:3000/api">
```

Use the actual port configured by the local backend. The deployed frontend must use the production API URL instead of localhost.

## Production Architecture

```text
User's Browser
      |
      v
Cloudflare Pages
Static Frontend
      |
      | HTTPS API requests
      v
Render
Node.js + Express API
      |
      | DATABASE_URL
      v
Neon PostgreSQL
      |
      ├── internships
      └── applications
```

### Production URLs

| Component | URL |
|---|---|
| Frontend | https://internship-integration.pages.dev/ |
| API Base URL | https://internship-integration.onrender.com/api |
| Health Check | https://internship-integration.onrender.com/api/health |
| Repository | https://github.com/snadiok4923A/internship-integration |

The production API base URL is configured in the frontend's `api-base-url` meta tag.

## Database Behaviour

- Local development uses SQLite when `DATABASE_URL` is not configured.
- Production uses PostgreSQL when `DATABASE_URL` is configured.
- The backend initializes the PostgreSQL schema and seeds six internship records when the internships table is empty.
- Neon PostgreSQL is the production database.
- Local SQLite data is not automatically migrated to Neon.
- Existing local application records must be migrated separately if they are needed in production.

Keep the Neon connection string in Render environment variables. Never publish database credentials or other secrets.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status and database connectivity |
| GET | `/api/internships` | List internships with supported filters and pagination |
| GET | `/api/internships/:id` | Retrieve a single internship |
| POST | `/api/applications` | Submit an internship application |

**Privacy note:** The public `GET /api/applications/:id` endpoint has been disabled. The API returns a route-not-found response for that path. Application submission remains available through `POST /api/applications`.

### Example Requests

Health check:

```http
GET https://internship-integration.onrender.com/api/health
```

Paginated internship listing:

```http
GET https://internship-integration.onrender.com/api/internships?limit=2&page=1
```

### Internship Query Parameters

| Parameter | Purpose |
|---|---|
| `page` | Page number, starting at 1 |
| `limit` | Number of results per page, from 1 to 50 |
| `domain` | Filter by internship domain |
| `location` | Filter by location |
| `work_type` | Filter by work type |

The available filters depend on the fields supported by the backend implementation.

## Testing

The backend uses the Node.js built-in test runner.

Run the tests from the `backend/` directory:

```powershell
npm test
```

### Latest Recorded Test Results

| Metric | Result |
|---|---:|
| Total tests | 9 |
| Passed | 9 |
| Failed | 0 |
| Cancelled | 0 |
| Skipped | 0 |
| Duration | Approximately 1.95 seconds |
| Status | PASS |

The latest recorded local test run covered:

- Database adapter interface and PostgreSQL placeholders
- API health check
- Malformed JSON handling
- Internship listing and pagination
- Missing internship handling
- Valid and invalid application submission
- Rejection of applications for nonexistent internships
- Public application lookup route unavailability
- API rate limiting

These results refer to the latest recorded local test run. Re-run `npm test` after future code changes.

See [TEST_REPORT.md](TEST_REPORT.md) for detailed results and the distinction between automated tests and manual production checks.

## Deployment

The project uses the following services:

- **Cloudflare Pages:** Static frontend hosting
- **Render:** Express backend hosting
- **Neon:** Production PostgreSQL database
- **GitHub:** Source control

For deployment configuration, environment variables, and troubleshooting instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

Render's free instance may spin down after inactivity, which can delay the first request when the service wakes up.

## Security

Implemented security measures include:

- Helmet security headers
- CORS restricted through the configured `FRONTEND_URL` allowlist
- Server-side application validation
- Parameterized database queries
- Rate limiting
- Environment-based configuration for sensitive values
- Request logging and error handling
- A health endpoint that reports database connectivity
- Removal of the public application lookup endpoint

See [SECURITY.md](SECURITY.md) for the security overview and known limitations.

This is an educational capstone project and has not undergone an independent security audit. Disabling the public lookup route does not replace a complete access-control review of the application.

## Known Limitations

- Render's free service may sleep during inactivity, causing delayed initial responses.
- The current in-memory rate limiter is not shared between multiple server instances.
- No public application lookup or administrative application-management endpoint is provided.
- Accessibility and performance audit scores have not been claimed.
- An independent penetration test or security audit has not been completed.
- Additional manual regression and accessibility checks are recommended.

## Documentation

| File | Description |
|---|---|
| [README.md](README.md) | Project overview, setup, features, and links |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment architecture and configuration |
| [SECURITY.md](SECURITY.md) | Implemented controls and security limitations |
| [TEST_REPORT.md](TEST_REPORT.md) | Automated test results and manual verification |

## Author

Developed as a full-stack development capstone project demonstrating frontend development, REST API integration, database connectivity, validation, testing, deployment, and security practices.

---

**Project:** InternBoard — Internship Portal  
**Live Demo:** https://internship-integration.pages.dev/  
**Source Code:** https://github.com/snadiok4923A/internship-integration  
**Walkthrough:** https://youtu.be/NZU1yMqdoPY
