# Security Overview

InternBoard is an educational full-stack capstone project with a basic
security baseline. This document describes implemented controls and
known limitations. It is not a substitute for an independent production
security review.

## Implemented Controls

-   Helmet adds standard HTTP security headers.
-   CORS is restricted using the configured `FRONTEND_URL` origin
    allowlist.
-   Application submissions are validated on the server with
    `express-validator`.
-   SQLite queries use parameterized statements.
-   PostgreSQL queries use parameter placeholders rather than
    interpolating user input into SQL.
-   PostgreSQL connections use TLS settings compatible with Neon.
-   API routes and application submissions use rate limiting.
-   Environment-based configuration is used for sensitive settings.
-   `.env`, generated database files, and `node_modules` are excluded
    from version control through ignore rules.
-   Request outcomes and unexpected server errors are logged without
    logging full application form contents.
-   Error responses avoid exposing stack traces and internal database
    details.
-   JSON request bodies are limited to 1 MB and malformed JSON is
    handled consistently.
-   The health endpoint reports database connectivity.
-   The server includes graceful-shutdown handling for database
    connections.

## Security Checklist

-   [x] Security headers enabled
-   [x] Restricted CORS configuration
-   [x] Server-side application input validation
-   [x] Parameterized database queries
-   [x] Rate limiting enabled
-   [x] Environment-based configuration
-   [x] Secrets excluded from source control
-   [x] Production API URL configured without exposing server secrets
-   [x] Database-aware health check
-   [x] Graceful database connection shutdown
-   [x] Generic client-facing error messages

## Deployment Security

-   The frontend is served over HTTPS by Cloudflare Pages.
-   The API is served over HTTPS by Render.
-   The production database is hosted by Neon PostgreSQL.
-   `DATABASE_URL` must remain in Render's environment configuration.
    Never place it in frontend JavaScript, HTML, README files,
    screenshots, or public issues.
-   `FRONTEND_URL` should match the production Cloudflare Pages origin
    exactly.
-   If the database password or connection string is exposed, rotate the
    credential in Neon and update Render.

## Known Limitations and Recommended Hardening

This application has not undergone an independent security audit. Before
handling real or sensitive applicant information, address the following:

1.  **Application record access:** Public application lookup is disabled.
    No API route returns applicant names, email addresses, phone numbers,
    resumes, cover messages, or other application records. Any future
    administrative lookup must require authentication and authorization.
2.  **Administrative actions:** Add authentication and role-based
    authorization before exposing any administrative internship or
    application management functions.
3.  **Rate limiting:** The current in-memory limiter is not shared
    across multiple instances. Use a shared store if scaling beyond one
    process.
4.  **Monitoring:** Add centralized log retention, alerting, and
    operational monitoring appropriate to the deployment.
5.  **Dependency scanning:** Run dependency audits regularly and update
    vulnerable packages.
6.  **Security review:** Perform an external review before using real
    applicant data.
7.  **CSRF:** If cookie-based authentication is introduced, review CSRF
    protection and cookie settings.
8.  **Data handling:** Define retention, deletion, backup, and access
    policies for application records.
9.  **Database credentials:** Use least-privilege database credentials
    where practical and rotate credentials if exposure is suspected.

## Responsible Use

Use synthetic test applicant data while demonstrating the project. Avoid
sharing screenshots containing names, email addresses, phone numbers,
database credentials, or other private information.
