# Test Report

This report separates tests that were run locally from manual checks
performed against the deployed application. It does not claim automated
accessibility, performance, or external security-audit scores that were
not measured.

## 1. Local Automated Backend Tests

**Command:** Run from the `backend/` directory.

``` bash
npm test
```

**Verified outcome:** The final local run after the privacy and dependency changes passed all nine tests.

The suite covered:

-   Health check
-   Internship listing and pagination
-   Missing internship handling
-   Valid application submission
-   Invalid application validation
-   Rejection of an application for a nonexistent internship
-   Rate-limit behavior
-   Public application lookup is disabled
-   Database adapter interface/placeholder behavior and malformed JSON
    handling

The test suite is a local automated test. It should be run again after
future code changes.

## 2. Local API Checks

During local validation, the following requests were used:

``` text
GET http://localhost:3000/api/health
GET http://localhost:3000/api/internships?limit=2&page=1
```

The health endpoint returned a successful JSON response with
`success: true`, and the internship endpoint returned pagination data
and seeded internship records.

## 3. Production Deployment Checks

The following checks were completed against the currently deployed services:

| Check | Result |
| --- | --- |
| Cloudflare Pages frontend deployed | Verified |
| Render backend service live | Verified |
| `GET /api/health` | Returned success and `database: "connected"` |
| `GET /api/internships?limit=2&page=1` | Returned HTTP 200 with seeded records |
| Public `GET /api/applications/1` | **Still exposed a private record on the old deployed revision; redeploy required** |

Production URLs:

-   Frontend: https://internship-integration.pages.dev/
-   API health: https://internship-integration.onrender.com/api/health
-   Internship API:
    https://internship-integration.onrender.com/api/internships?limit=2&page=1

The application table showed submitted records during earlier manual
verification. The current local code disables public application lookup,
but the production service must be redeployed before that protection is
active online.

## 4. Database Verification

The production database is Neon PostgreSQL, selected by setting
`DATABASE_URL` in Render. The `internships` table contained six seeded
records. The `applications` table contained submitted application
records.

The local SQLite database and its records are not automatically migrated
to Neon. PostgreSQL connectivity was verified through the deployed
Render health endpoint rather than by using production credentials in
the local test environment.

## 5. Manual Checks Still Recommended

The following checks should be performed and recorded before final
submission:

-   [ ] Search and filters on the live website
-   [ ] View Details and application form behavior
-   [ ] Required-field and invalid-input messages
-   [ ] Responsive layout on desktop and mobile
-   [ ] Keyboard-only navigation and visible focus
-   [ ] Browser console free of unexpected errors
-   [ ] Check CORS behavior from the deployed frontend
-   [ ] Confirm duplicate-submission behavior if the product is expected
    to prevent duplicates
-   [x] Run `npm test` again after the final code changes
-   [ ] Redeploy Render and verify `GET /api/applications/1` returns
    `404 ROUTE_NOT_FOUND`

## 6. Accessibility, Performance, and Security

The frontend includes labelled controls, visible focus styles, skip
navigation, keyboard-friendly dialogs, and live status regions. These
are implementation features, not a substitute for measured accessibility
results.

No Lighthouse or axe score is claimed here because those scores were not
measured. No independent penetration test or external security audit has
been completed.

## 7. Summary

The nine-test backend suite passed in the final local run. The deployed
health and internship endpoints were verified, but the live Render
service still exposes the old public application lookup route until the
new revision is deployed. Do not treat production as remediated until
that redeploy and endpoint check are complete.
