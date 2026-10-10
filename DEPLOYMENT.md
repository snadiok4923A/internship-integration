# Deployment guide

## Recommended architecture

The application has a static frontend and an Express API backed by SQLite. For a simple production deployment, host the frontend on a static host and the API on a Node.js host with a persistent disk. SQLite must not be stored on an ephemeral filesystem.

For a small deployment, a Node host that supports persistent volumes (for example, Render with a paid persistent disk) can run the backend. A static host can serve `frontend/`. The checked-in frontend configuration targets `http://localhost:3000/api` for local VS Code Live Server use. If the frontend and backend use different production origins, update `frontend/index.html`:

```html
<meta name="api-base-url" content="https://api.example.com/api">
```

Do not put secrets in frontend files.

## Backend deployment

1. Create a Node.js service using `backend/` as its root directory.
2. Install with `npm ci`.
3. Start with `npm start`.
4. Set the environment variables below.
5. Attach a persistent disk and set `DATABASE_PATH` to the mounted SQLite file path. Without it, the implementation stores SQLite at `backend/database/internships.db`.
6. Verify `GET /api/health` returns HTTP 200 and `"database":"connected"`.

Required environment variables:

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API listening port supplied by the host |
| `NODE_ENV` | `production` | Runtime environment |
| `FRONTEND_URL` | `https://internboard.example.com` | Comma-separated CORS allowlist |

Run `npm run seed` once for a new database. The seed command only inserts records when the internship table is empty.

## Frontend deployment

Serve the contents of `frontend/` as static files. Ensure `index.html`, `script.js`, and `style.css` are deployed together. Configure the API meta tag when the API is on another origin, then redeploy the static assets.

## Persistence and backups

SQLite data is local to the backend filesystem. Use a persistent volume, scheduled backups, and a tested restore process. For multiple backend instances or high write volume, migrate to a managed relational database before scaling horizontally.

## Troubleshooting

- CORS errors: make sure `FRONTEND_URL` exactly matches the browser origin, including scheme and port.
- API requests to localhost in production: check the `api-base-url` meta tag in the deployed `index.html`.
- Health returns 503: inspect backend logs and confirm the database volume is mounted and writable.
- Missing internships after restart: the host is using ephemeral storage or the database was not seeded.
- Rate-limit responses: the current limiter is in-memory and per process; use a shared store for multi-instance deployments.

## Walkthrough recording checklist

Record a 2–4 minute video showing the deployed portal, responsive desktop/mobile layouts, search and filters, details, validation errors, a successful application, `/api/health`, project documentation, and the test command. Upload it to the preferred video host and add the verified URL to `README.md`; no video URL is claimed until it has been published and checked.
