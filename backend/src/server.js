require('dotenv').config();
const app = require('./app');
const { closeDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.info(`Internship API listening on port ${PORT}`);
});

function shutdown(signal) {
  console.info(`${signal} received; shutting down gracefully`);
  server.close((error) => {
    if (error) {
      console.error('Server shutdown failed:', error.message);
      process.exitCode = 1;
    }

    closeDatabase()
      .catch((closeError) => {
        console.error('Database shutdown failed:', closeError.message);
        process.exitCode = 1;
      })
      .finally(() => process.exit());
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
