const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const configuredDatabasePath = process.env.DATABASE_PATH;
const databasePath = configuredDatabasePath
  ? path.resolve(configuredDatabasePath)
  : path.resolve(__dirname, '../../database/internships.db');
const databaseDir = path.dirname(databasePath);
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
const seedDataPath = path.resolve(__dirname, '../../data', 'seed.json');

fs.mkdirSync(databaseDir, { recursive: true });

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
const existingCount = db.prepare('SELECT COUNT(*) AS total FROM internships').get().total;

if (Number(existingCount) === 0) {
  const insertStatement = db.prepare(`
    INSERT INTO internships (
      title,
      company,
      domain,
      location,
      work_type,
      duration,
      stipend,
      skills,
      description,
      eligibility,
      deadline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((records) => {
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

function checkDatabaseConnection() {
  db.prepare('SELECT 1 AS ok').get();
  return true;
}

function closeDatabase() {
  if (db.open) {
    db.close();
  }
}

module.exports = {
  db,
  parseRow,
  databasePath,
  checkDatabaseConnection,
  closeDatabase
};
