const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const contentRoutes = require('./routes/content.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

function createApp({ db } = {}) {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.use((req, res, next) => {
    req.db = db || require('./config/db');
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
