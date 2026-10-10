# Deployment guide

## Recommended architecture

The application has a static frontend and an Express API. Local development uses SQLite; production uses Neon PostgreSQL through `DATABASE_URL`. Host the frontend on Cloudflare Pages and the API on Render Free.

Render runs `backend/` with the checked-in start command. Cloudflare Pages serves `frontend/`. The checked-in frontend configuration targets `http://localhost:3000/api` for local VS Code Live Server use. Before the Cloudflare deployment, update `frontend/index.html` to the verified Render API URL:

```html
<meta name="api-base-url" content="https://api.example.com/api">
```

Do not put secrets in frontend files.

## Backend deployment

1. Create a Node.js service using `backend/` as its root directory.
2. Install with `npm ci`.
3. Start with `npm start`.
4. Set the environment variables below.
5. Set `DATABASE_URL` to the pooled Neon connection string.
6. Verify `GET /api/health` returns HTTP 200 and `"database":"connected"`.

Required environment variables:

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API listening port supplied by the host |
| `NODE_ENV` | `production` | Runtime environment |
| `FRONTEND_URL` | `https://internboard.example.com` | Comma-separated CORS allowlist |
| `DATABASE_URL` | Neon PostgreSQL connection string | Production database connection |

The service initializes the PostgreSQL schema and seeds records when the `internships` table is empty. You may also run `npm run seed` from the Render service shell. Do not set `DATABASE_PATH` in production.

## Frontend deployment

Create a Cloudflare Pages project using the repository, set the project root to `frontend/`, leave the build command empty, and publish the `frontend` directory. Ensure `index.html`, `script.js`, and `style.css` are deployed together. Set the `api-base-url` meta tag to the verified Render URL plus `/api`, then redeploy the static assets.

## Neon manual setup

1. Create a Neon project and database.
2. Copy the pooled connection string from Neon and keep it private.
3. Add it to Render as `DATABASE_URL`.
4. Deploy Render and wait for the service to start.
5. Open the Render `/api/health` URL and confirm `"database":"connected"`.
6. Open `/api/internships?limit=2&page=1` and confirm seeded records are returned.

Neon owns production persistence and backups. The existing SQLite file remains local and is not migrated or modified. If existing local applications must be moved to Neon, perform a deliberate migration separately; automatic setup only seeds the six internship records in an empty PostgreSQL database.

## Troubleshooting

- CORS errors: make sure `FRONTEND_URL` exactly matches the browser origin, including scheme and port.
- API requests to localhost in production: check the `api-base-url` meta tag in the deployed `index.html`.
- Health returns 503: inspect Render logs and confirm `DATABASE_URL` is valid and the Neon database is reachable.
- Missing internships after restart: verify `DATABASE_URL` is set in Render and inspect startup logs for initialization errors.
- Rate-limit responses: the current limiter is in-memory and per process; use a shared store for multi-instance deployments.

## Walkthrough recording checklist

Record a 2–4 minute video showing the deployed portal, responsive desktop/mobile layouts, search and filters, details, validation errors, a successful application, `/api/health`, project documentation, and the test command. Upload it to the preferred video host and add the verified URL to `README.md`; no video URL is claimed until it has been published and checked.
