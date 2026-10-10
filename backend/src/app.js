require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const internshipRoutes = require('./routes/internshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const { apiLimiter, applicationLimiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { checkDatabaseConnection } = require('./config/database');

function createApp() {
  const app = express();
  const frontendOrigins = (process.env.FRONTEND_URL || 'http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error('Origin is not allowed');
      error.statusCode = 403;
      error.code = 'CORS_FORBIDDEN';
      callback(error);
    },
    credentials: true
  }));
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  });
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.get('/', (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Internship integration API',
      documentation: '/api/health'
    });
  });

  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    try {
      checkDatabaseConnection();
      return res.status(200).json({
        success: true,
        message: 'Internship API is running',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check database failure:', error.message);
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'The API is temporarily unavailable'
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  app.use('/api/internships', internshipRoutes);
  app.use('/api/applications', applicationLimiter, applicationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();
module.exports = app;
module.exports.createApp = createApp;
