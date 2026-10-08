const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const databaseDir = path.resolve(__dirname, '..', 'database');
const databasePath = path.join(databaseDir, 'internships.db');
const schemaPath = path.join(databaseDir, 'schema.sql');
const seedDataPath = path.resolve(__dirname, '..', 'data', 'seed.json');

fs.mkdirSync(databaseDir, { recursive: true });

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
const existingCount = db.prepare('SELECT COUNT(*) AS total FROM internships').get().total;

if (existingCount === 0) {
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
        record.stipend,
        JSON.stringify(record.skills),
        record.description,
        record.eligibility,
        record.deadline || null
      );
    }
  });

  insertMany(seedData);
  console.log(`Seeded ${seedData.length} internships into ${databasePath}`);
} else {
  console.log(`Database already contains ${existingCount} internship records. No new records inserted.`);
}

db.close();
