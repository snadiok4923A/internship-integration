# Test Report

This report documents only the commands and results that were verified during validation.

## Verified commands and outcomes

### Backend health and internship retrieval

Command run:

```bash
curl.exe -sS http://localhost:3000/api/health && echo; curl.exe -sS "http://localhost:3000/api/internships?limit=2&page=1"
```

Verified result:

- `/api/health` returned a successful JSON response with `success: true`
- `/api/internships?limit=2&page=1` returned a valid pagination object with `page: 1`, `limit: 2`, and seeded internship data

### Database seed validation

Command run:

```bash
Set-Location 'c:\Users\Sandipan Paul\Documents\Websites\temp3\internship-integration\backend'; node -e "const {db}=require('./src/config/database'); console.log(db.prepare('SELECT COUNT(*) AS total FROM internships').get().total); console.log(JSON.stringify(db.prepare('SELECT id,title,company FROM internships ORDER BY id LIMIT 3').all()));"
```

Verified result:

- SQLite database contains `6` seed records
- The first three seeded internships were returned successfully

### Automated test suite

Command run:

```bash
Set-Location 'c:\Users\Sandipan Paul\Documents\Websites\temp3\internship-integration\backend'; npm test
```

Verified result:

- The Node test suite passed successfully
- Covered status codes included `200`, `201`, `400`, `404`, and `429`
- Verified the following behaviors:
  - health check
  - internship listing with pagination
  - missing internship error handling
  - valid application submission
  - invalid application validation
  - nonexistent internship rejection
  - rate limiting activation

## Summary

The backend API is running successfully, the SQLite database is seeded with internship records, and the actual automated tests confirm the core integration flows behave as expected.

## Task 05 validation notes

- The initial baseline run passed 6 tests, 0 failed.
- The final standard `npm test` command now runs with `--test-isolation=none` and passed all 7 tests, including malformed JSON handling, across five consecutive runs.
- The explicit `node --test --test-isolation=none ..\tests\api.test.js` command also passed all 7 tests.
- The frontend uses safe DOM APIs for API data and has visible focus styles, skip navigation, labelled controls, keyboard-closeable dialogs, and live status regions.
- No Lighthouse or axe runner is installed in this repository, so numeric accessibility and performance scores are not claimed.
- No live deployment or walkthrough video was available during this local run. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the remaining manual steps.
