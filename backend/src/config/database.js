require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { Pool } = require('pg');

const isPostgres = Boolean(process.env.DATABASE_URL);
const seedDataPath = path.resolve(__dirname, '../../data', 'seed.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

function parseRow(row) {
  if (!row) return null;

  const internship = { ...row };

  if (typeof internship.skills === 'string') {
    try {
      internship.skills = JSON.parse(internship.skills);
    } catch (error) {
      internship.skills = [];
    }
  }

  return internship;
}

function createSqliteDatabase() {
  const configuredDatabasePath = process.env.DATABASE_PATH;
  const databasePath = configuredDatabasePath
    ? path.resolve(configuredDatabasePath)
    : path.resolve(__dirname, '../../database/internships.db');
  const databaseDir = path.dirname(databasePath);
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

  fs.mkdirSync(databaseDir, { recursive: true });

  const sqlite = new Database(databasePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.exec(fs.readFileSync(schemaPath, 'utf8'));

  const existingCount = sqlite.prepare('SELECT COUNT(*) AS total FROM internships').get().total;
  if (Number(existingCount) === 0) {
    const insertStatement = sqlite.prepare(`
      INSERT INTO internships (
        title, company, domain, location, work_type, duration, stipend,
        skills, description, eligibility, deadline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = sqlite.transaction((records) => {
      for (const record of records) {
        insertStatement.run(
          record.title,
          record.company,
          record.domain,
          record.location,
          record.work_type,
          record.duration,
          Number(record.stipend),
          JSON.stringify(Array.isArray(record.skills) ? record.skills : []),
          record.description,
          record.eligibility,
          record.deadline || null
        );
      }
    });

    insertMany(seedData);
  }

  return {
    kind: 'sqlite',
    databasePath,
    async all(sql, params = []) {
      return sqlite.prepare(sql).all(...params);
    },
    async get(sql, params = []) {
      return sqlite.prepare(sql).get(...params);
    },
    async run(sql, params = []) {
      const result = sqlite.prepare(sql).run(...params);
      return {
        rowCount: result.changes,
        rows: result.lastInsertRowid ? [{ id: result.lastInsertRowid }] : []
      };
    },
    async check() {
      sqlite.prepare('SELECT 1 AS ok').get();
    },
    async close() {
      if (sqlite.open) {
        sqlite.close();
      }
    }
  };
}

function toPostgresPlaceholders(sql) {
  let parameterIndex = 0;
  return sql.replace(/\?/g, () => `$${++parameterIndex}`);
}

async function seedPostgres(pool) {
  const existingCount = await pool.query('SELECT COUNT(*) AS total FROM internships');
  if (Number(existingCount.rows[0].total) > 0) {
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const record of seedData) {
      await client.query(`
        INSERT INTO internships (
          title, company, domain, location, work_type, duration, stipend,
          skills, description, eligibility, deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)
      `, [
        record.title,
        record.company,
        record.domain,
        record.location,
        record.work_type,
        record.duration,
        Number(record.stipend),
        JSON.stringify(Array.isArray(record.skills) ? record.skills : []),
        record.description,
        record.eligibility,
        record.deadline || null
      ]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function createPostgresDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 5
  });
  pool.on('error', (error) => {
    console.error('PostgreSQL pool error:', error.message);
  });
  const schemaPath = path.resolve(__dirname, '../../database/schema.postgres.sql');
  const ready = (async () => {
    await pool.query(fs.readFileSync(schemaPath, 'utf8'));
    await seedPostgres(pool);
  })();

  return {
    kind: 'postgres',
    databasePath: null,
    async all(sql, params = []) {
      await ready;
      return (await pool.query(toPostgresPlaceholders(sql), params)).rows;
    },
    async get(sql, params = []) {
      await ready;
      return (await pool.query(toPostgresPlaceholders(sql), params)).rows[0];
    },
    async run(sql, params = []) {
      await ready;
      const result = await pool.query(toPostgresPlaceholders(sql), params);
      return { rowCount: result.rowCount, rows: result.rows };
    },
    async check() {
      await ready;
      await pool.query('SELECT 1 AS ok');
    },
    async close() {
      await ready;
      await pool.end();
    }
  };
}

const db = isPostgres ? createPostgresDatabase() : createSqliteDatabase();

module.exports = {
  db,
  parseRow,
  databaseType: db.kind,
  databasePath: db.databasePath,
  checkDatabaseConnection: () => db.check(),
  closeDatabase: () => db.close(),
  toPostgresPlaceholders
};
