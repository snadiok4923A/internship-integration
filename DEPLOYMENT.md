# Deployment Guide

This guide documents the deployed architecture and the settings used for
the InternBoard internship portal.

## Architecture

-   **Frontend:** Cloudflare Pages, serving the static files in
    `frontend/`
-   **Backend:** Render Web Service, running the Express API from
    `backend/`
-   **Production database:** Neon PostgreSQL
-   **Source control:** GitHub repository
    `snadiok4923A/internship-integration`

Live URLs:

-   Frontend: https://internship-integration.pages.dev/
-   Backend: https://internship-integration.onrender.com
-   Health check: https://internship-integration.onrender.com/api/health

## Render Backend Deployment

The Render service is configured as follows:

  Setting          Value
  ---------------- ---------------------------------------
  Service type     Web Service
  Repository       `snadiok4923A/internship-integration`
  Branch           `main`
  Root directory   `backend/`
  Build command    `npm install`
  Start command    `npm start`
  Runtime          Node.js
  Instance         Free

### Environment variables

Configure these in the Render service's Environment page:

  --------------------------------------------------------------------------------
  Variable                            Value/purpose
  ----------------------------------- --------------------------------------------
  `NODE_ENV`                          `production`

  `DATABASE_URL`                      Pooled Neon PostgreSQL connection string;
                                      keep secret

  `FRONTEND_URL`                      `https://internship-integration.pages.dev`

  `PORT`                              Supplied by Render; the application should
                                      use `process.env.PORT`
  --------------------------------------------------------------------------------

`FRONTEND_URL` must exactly match the deployed frontend origin,
including the scheme. Do not add a trailing slash unless the application
code explicitly expects one. If the backend supports a comma-separated
origin allowlist, use commas to separate origins without changing the
configured origin.

### Verify the backend

Open:

``` text
https://internship-integration.onrender.com/api/health
```

Expected result: HTTP 200 and a JSON response with `success: true` and
`database: "connected"`.

Also test:

``` text
https://internship-integration.onrender.com/api/internships?limit=2&page=1
```

The response should contain internship records and pagination data.

## Neon PostgreSQL Setup

1.  Create a Neon project and database.
2.  Copy the pooled PostgreSQL connection string from Neon.
3.  Add the connection string to Render as `DATABASE_URL`.
4.  Keep the connection string private. Never commit it to GitHub or put
    it in frontend code.
5.  Deploy/restart the Render service and check the health endpoint.
6.  Confirm that the `internships` and `applications` tables exist in
    the `public` schema.

The backend initializes the PostgreSQL schema and seeds six internship
records when the `internships` table is empty. The local SQLite database
is not automatically migrated to Neon. If existing local applications
must be moved, perform a separate, deliberate migration.

Do not set `DATABASE_PATH` for production PostgreSQL.

## Cloudflare Pages Frontend Deployment

The Cloudflare Pages project is connected to the existing GitHub
repository.

  -----------------------------------------------------------------------
  Setting                             Value
  ----------------------------------- -----------------------------------
  Project name                        `internship-integration`

  Production branch                   `main`

  Root directory/path                 Repository root (`/`, left blank in
                                      the dashboard)

  Framework preset                    `None`

  Build command                       `exit 0`

  Build output directory              `frontend`
  -----------------------------------------------------------------------

The frontend's production configuration in `frontend/index.html` must
contain:

``` html
<meta name="api-base-url" content="https://internship-integration.onrender.com/api">
```

Do not deploy a frontend configuration that points to
`http://localhost:3000/api`; that address only works on the developer's
own computer.

After changing frontend files:

1.  Save the changes.
2.  Commit and push them to the `main` branch.
3.  Wait for Cloudflare Pages to finish its deployment.
4.  Refresh the live website with a hard refresh (`Ctrl+Shift+R`).
5.  Check the browser console if API requests fail.

## CORS Troubleshooting

If the browser reports a CORS error:

1.  Confirm the actual browser origin is
    `https://internship-integration.pages.dev`.
2.  Confirm Render's `FRONTEND_URL` environment variable matches that
    origin exactly.
3.  Check the backend CORS configuration to make sure it reads
    `FRONTEND_URL`.
4.  Save the Render environment change and wait for the service to
    redeploy/restart.
5.  Refresh the frontend and inspect the browser console.

Do not solve CORS by allowing every origin indiscriminately in
production.

## Common Problems

### API requests target localhost

Check the `api-base-url` meta tag in the deployed `frontend/index.html`.
It must use the production Render URL.

### Health endpoint returns 503 or database is disconnected

Check Render logs and confirm `DATABASE_URL` is correct and the Neon
database is reachable. Do not share the connection string in screenshots
or messages.

### Internship records are missing

Check the Render startup logs, `DATABASE_URL`, and the
`public.internships` table in Neon. The automatic seed runs only when
the internships table is empty.

### First request is slow

Render's free service may sleep after inactivity. A cold start can delay
the first API request; retry after the service wakes up.

### Rate-limit responses

The current rate limiter is in-memory and per process. A shared store is
needed if the application is later scaled to multiple instances.

## Walkthrough Recording Checklist

Record a two-minute walkthrough showing:

1.  The live website and responsive desktop/mobile layout.
2.  Internship search and filters.
3.  Internship details.
4.  Form validation and a successful test application.
5.  The API health endpoint.
6.  The README and test command.

Publish the video using a public or view-only link, verify that a
reviewer can open it without requesting access, then add that URL to
`README.md`. Do not claim a video URL until it has actually been
published and checked.
