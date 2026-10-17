require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Demasiadas peticiones' }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/cities', require('./routes/cities'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/admin', require('./routes/admin'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log('============================================');
  console.log('  SAJI GO - Servidor API');
  console.log('============================================');
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log('============================================');
});