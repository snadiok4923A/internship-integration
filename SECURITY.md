# Security Overview

This project follows a basic security baseline for a beginner-friendly internship portal. It is not a substitute for a production security review.

## Implemented controls

- Helmet is enabled to add standard HTTP security headers.
- CORS is restricted to the exact comma-separated origins in `FRONTEND_URL`.
- Request validation is enforced on the server using `express-validator` for all application submissions.
- SQLite database access uses parameterized queries instead of string-concatenated SQL.
- API and application routes are rate-limited to reduce abuse and brute-force activity.
- Sensitive values such as ports and frontend origins are stored in `.env` instead of being hardcoded.
- The project ignores generated files such as `.env`, database files, and `node_modules` in `.gitignore`.
- Request outcomes and unexpected server errors are logged without application form contents.
- Error responses hide stack traces and internal database details.
- JSON request bodies are limited to 1 MB and malformed JSON receives a consistent error response.

## Checklist

- [x] Secure headers enabled
- [x] Restricted CORS policy
- [x] Input validation for form data
- [x] Parameterized database queries
- [x] Rate limiting enabled
- [x] Environment-based configuration
- [x] Secrets excluded from version control
- [x] Production API URL is configurable without exposing server secrets
- [x] Health check includes database connectivity
- [x] Graceful shutdown closes the SQLite connection

## Important note

## Limitations and production hardening

This setup is appropriate for a small educational project. Before handling sensitive or high-volume applications:

- Serve both frontend and API over HTTPS and configure a trusted reverse proxy.
- Replace the in-memory rate limiter with a shared store when running more than one API instance.
- Add authentication and authorization for administrative internship and application endpoints; the current public application lookup endpoint is not suitable for confidential production records.
- Use a managed database or a persistent, encrypted SQLite volume with backups.
- Add automated dependency scanning, centralized log retention, alerting, CSRF protection if cookie authentication is introduced, and an external security review.
