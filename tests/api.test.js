const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../backend/src/app');
const { db, closeDatabase, toPostgresPlaceholders } = require('../backend/src/config/database');

test.after(() => {
  closeDatabase();
});

test('database adapter exposes a common query interface and PostgreSQL placeholders', async () => {
  assert.equal(db.kind, 'sqlite');
  assert.equal((await db.get('SELECT ? AS value', ['adapter'])).value, 'adapter');
  assert.equal(
    toPostgresPlaceholders('SELECT * FROM internships WHERE domain = ? AND location = ?'),
    'SELECT * FROM internships WHERE domain = $1 AND location = $2'
  );
});

async function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        port: typeof address === 'object' && address ? address.port : 0
      });
    });
  });
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

test('GET /api/health responds with running status', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.message, 'Internship API is running');
    assert.equal(payload.database, 'connected');
  } finally {
    await closeServer(server);
  }
});

test('POST /api/applications returns a consistent error for malformed JSON', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"internship_id":'
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'INVALID_JSON');
  } finally {
    await closeServer(server);
  }
});

test('GET /api/internships returns a paginated list of internships', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/internships?limit=2&page=1`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.ok(Array.isArray(payload.data));
    assert.equal(payload.data.length, 2);
    assert.equal(payload.pagination.page, 1);
    assert.equal(payload.pagination.limit, 2);
    assert.ok(payload.pagination.total >= 2);
  } finally {
    await closeServer(server);
  }
});

test('GET /api/internships/:id returns 404 for missing internship', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/internships/99999`);
    const payload = await response.json();

    assert.equal(response.status, 404);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'INTERNSHIP_NOT_FOUND');
  } finally {
    await closeServer(server);
  }
});

test('POST /api/applications accepts a valid application and rejects bad input', async () => {
  const { server, port } = await startServer();

  try {
    const validPayload = {
      internship_id: 1,
      full_name: 'Aarav Sharma',
      email: 'aarav@example.com',
      phone: '+91 9876543210',
      education: 'B.Tech in Computer Science',
      college: 'Indian Institute of Technology',
      resume_url: 'https://example.com/resume.pdf',
      cover_message: 'I am excited to contribute to this internship and would love to learn from the team.'
    };

    const validResponse = await fetch(`http://127.0.0.1:${port}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });
    const validBody = await validResponse.json();

    assert.equal(validResponse.status, 201);
    assert.equal(validBody.success, true);
    assert.ok(validBody.data && validBody.data.id);

    const invalidResponse = await fetch(`http://127.0.0.1:${port}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internship_id: 1,
        full_name: 'A',
        email: 'not-an-email',
        phone: 'abc',
        education: '',
        college: '',
        resume_url: 'not-a-url',
        cover_message: 'short'
      })
    });
    const invalidBody = await invalidResponse.json();

    assert.equal(invalidResponse.status, 400);
    assert.equal(invalidBody.success, false);
    assert.equal(invalidBody.error.code, 'VALIDATION_ERROR');
  } finally {
    await closeServer(server);
  }
});

test('POST /api/applications returns 404 when internship does not exist', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internship_id: 999999,
        full_name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '+91 9876543210',
        education: 'B.Tech in Computer Science',
        college: 'Indian Institute of Technology',
        resume_url: 'https://example.com/resume.pdf',
        cover_message: 'I am excited to contribute to this internship and would love to learn from the team.'
      })
    });

    test('GET /api/applications/:id is not publicly available', async () => {
      const { server, port } = await startServer();

      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/applications/1`);
        const payload = await response.json();

        assert.equal(response.status, 404);
        assert.equal(payload.success, false);
        assert.equal(payload.error.code, 'ROUTE_NOT_FOUND');
      } finally {
        await closeServer(server);
      }
    });
    const payload = await response.json();

    assert.equal(response.status, 404);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'INTERNSHIP_NOT_FOUND');
  } finally {
    await closeServer(server);
  }
});

test('API rate limiting triggers 429 when request limit is exceeded', async () => {
  const { server, port } = await startServer();

  try {
    let rateLimited = false;

    for (let index = 0; index < 120; index += 1) {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.status === 429) {
        rateLimited = true;
        const payload = await response.json();
        assert.equal(payload.success, false);
        assert.equal(payload.error.code, 'RATE_LIMIT_EXCEEDED');
        break;
      }
    }

    assert.equal(rateLimited, true);
  } finally {
    await closeServer(server);
  }
});
