require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const exportRoutes = require('./routes/export');
const uploadRoutes = require('./routes/upload');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(
  isProd && corsOrigin
    ? { origin: corsOrigin.split(',').map((s) => s.trim()), credentials: true }
    : {}
));

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/login', authRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/upload-signature', authMiddleware, uploadRoutes);

app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT} (${isProd ? 'production' : 'development'})`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
