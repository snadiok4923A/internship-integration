# Test Report — InternBoard

## 1. Overview

This document records the automated backend test results and manual verification performed for the InternBoard internship portal.

**Project:** InternBoard — Internship Portal  
**Repository:** https://github.com/snadiok4923A/internship-integration  
**Live Frontend:** https://internship-integration.pages.dev/  
**Backend API:** https://internship-integration.onrender.com  
**API Health Check:** https://internship-integration.onrender.com/api/health

The project provides internship listings, search and filtering, pagination, internship details, and application submission through a full-stack web application.

## 2. Local Automated Backend Tests

### Test Command

Run the following command from the `backend/` directory:

```powershell
npm test
```

The test script runs:

```text
node --test --test-isolation=none ../tests/*.test.js
```

### Final Test Results

| Metric | Result |
|---|---:|
| Total tests | 9 |
| Passed | 9 |
| Failed | 0 |
| Cancelled | 0 |
| Skipped | 0 |
| Todo | 0 |
| Duration | Approximately 1.95 seconds |
| Overall status | PASS |

**Result:** All nine tests passed in the latest recorded local test run.

### Test Coverage

| Test Area | Expected Behaviour | Result |
|---|---|---|
| Database adapter | Provides a common query interface and PostgreSQL placeholder support | PASS |
| API health check | Returns a successful response when the API is running | PASS |
| Malformed JSON | Returns a consistent error for malformed application request data | PASS |
| Internship listing | Returns paginated internship results | PASS |
| Missing internship | Returns HTTP 404 for a nonexistent internship | PASS |
| Application validation | Accepts valid application data and rejects invalid input | PASS |
| Nonexistent internship application | Returns HTTP 404 when the internship does not exist | PASS |
| Application privacy | Public `GET /api/applications/:id` lookup is unavailable | PASS |
| Rate limiting | Returns HTTP 429 when the request limit is exceeded | PASS |

These results are based on the latest local `npm test` output.

## 3. Production Deployment Checks

### Backend Health Check

**URL:** https://internship-integration.onrender.com/api/health

The live endpoint returned a successful response indicating that the API was running and the database connection was established.

Observed response fields included:

```json
{
  "success": true,
  "message": "Internship API is running",
  "database": "connected"
}
```

The timestamp is omitted because it changes with each request.

**Status:** PASS

### Public Application Lookup Security Check

**URL:** https://internship-integration.onrender.com/api/applications/1

The live endpoint returned:

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Route not found: /api/applications/1"
  }
}
```

The public application lookup route is unavailable, preventing this endpoint from returning application records.

**Status:** PASS

### Frontend Availability

**URL:** https://internship-integration.pages.dev/

The deployed frontend loaded successfully and displayed internship listings and the application form.

**Status:** PASS

### Application Submission

The frontend displayed the success message:

> Application submitted successfully. We'll be in touch soon.

This confirms that the frontend displayed the submission success state during manual testing. Database persistence for that specific submission was not independently verified as part of this check.

**Status:** Success message observed; independent persistence verification pending.

## 4. Security Checks

The following security-related behaviours were verified or documented:

- The public application lookup endpoint is unavailable.
- Server-side application validation rejects invalid input.
- Malformed JSON requests receive an error response.
- API rate limiting returns HTTP 429 when the request limit is exceeded.
- The API health endpoint reports database connectivity.
- CORS is configured using the `FRONTEND_URL` environment variable.
- Environment variables are used for sensitive configuration.
- The security documentation describes known limitations.

These checks do not constitute an independent penetration test or a comprehensive security audit.

## 5. Manual Checks Still Recommended

The following checks should be completed before treating the project as fully verified:

- [ ] Test internship search and all available filters.
- [ ] Test internship details and navigation.
- [ ] Test application form validation for missing and invalid fields.
- [ ] Submit a test application and independently confirm its database record.
- [ ] Check responsive layouts on mobile and desktop.
- [ ] Test keyboard navigation and visible focus indicators.
- [ ] Inspect browser developer tools for console errors.
- [ ] Confirm the frontend communicates with the deployed backend without CORS errors.
- [ ] Run an accessibility check using an appropriate tool such as axe.
- [ ] Run a performance audit using Lighthouse.
- [ ] Perform an appropriate security review.
- [ ] Record and publish the project walkthrough video.

No accessibility, performance, or external security audit scores are claimed in this report because those audits have not been recorded here.

## 6. Test Environment

| Component | Environment |
|---|---|
| Backend runtime | Node.js |
| Backend framework | Express |
| Automated testing | Node.js built-in test runner |
| Local database support | SQLite |
| Production database | Neon PostgreSQL |
| Backend hosting | Render |
| Frontend hosting | Cloudflare Pages |
| Source control | Git and GitHub |

The automated test results refer to the local test run. Production checks refer only to the specific live behaviours listed in this document.

## 7. Known Limitations

- Render's free instance may spin down during inactivity, causing delayed responses on the next request.
- The project has not been independently audited for production security.
- Accessibility and performance audit scores have not been recorded.
- Manual regression checks remain necessary after future code changes.
- A successful frontend message alone does not independently prove database persistence.

## 8. Conclusion

The latest recorded local backend test run completed successfully, with **9 tests passed and 0 failed**.

The deployed API health check reported that the database was connected. The public application lookup endpoint returned `ROUTE_NOT_FOUND`, and the live frontend displayed internship listings and the application form.

The project has a working deployment and a passing automated backend test suite. Completing the remaining manual checks and publishing the walkthrough video will improve the final submission.

**Report status:** Automated tests passed; selected production checks passed; additional quality checks remain pending.
