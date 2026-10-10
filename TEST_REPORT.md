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

**Verified outcome:** All eight tests passed in the final local run.

The suite covered:

-   Health check
-   Internship listing and pagination
-   Missing internship handling
-   Valid application submission
-   Invalid application validation
-   Rejection of an application for a nonexistent internship
-   Rate-limit behavior
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

The following manual checks were completed after deployment:

  Check                                                       Result
  ----------------------------------------------------------- ----------------------------------------------
  Cloudflare Pages frontend deployed                          Passed
  Render backend service live                                 Passed
  `GET /api/health`                                           Returned success and `database: "connected"`
  Live frontend loaded internship cards                       Passed
  Application form showed successful submission message       Passed
  Neon `public.internships` table contained six records       Passed
  Neon `public.applications` table showed submitted records   Passed

Production URLs:

-   Frontend: https://internship-integration.pages.dev/
-   API health: https://internship-integration.onrender.com/api/health
-   Internship API:
    https://internship-integration.onrender.com/api/internships?limit=2&page=1

The application table showed two submitted records during manual
verification. This confirms records were visible in the database at that
time; it does not by itself verify duplicate-submission prevention.

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
-   [ ] Run `npm test` again after the final code changes

## 6. Accessibility, Performance, and Security

The frontend includes labelled controls, visible focus styles, skip
navigation, keyboard-friendly dialogs, and live status regions. These
are implementation features, not a substitute for measured accessibility
results.

No Lighthouse or axe score is claimed here because those scores were not
measured. No independent penetration test or external security audit has
been completed.

## 7. Summary

The eight-test backend suite passed in the final local run. The deployed
frontend and backend were manually verified, the health endpoint
reported a connected PostgreSQL database, the live website displayed
internship listings, and application records were visible in Neon.
Additional manual accessibility, performance, security, and regression
checks remain recommended before treating the project as
production-hardened.
