require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const exportRoutes = require('./routes/export');
const uploadRoutes = require('./routes/upload');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/login', authRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/upload-signature', authMiddleware, uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
