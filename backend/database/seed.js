require('dotenv').config();

const { db } = require('../src/config/database');

db.check()
  .then(() => {
    console.log(`Database initialized and seeded using ${db.kind}.`);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());
