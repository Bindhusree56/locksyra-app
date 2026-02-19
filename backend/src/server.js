require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: `MongoDB ${dbStatus}`,
    port: PORT
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/breach', require('./routes/breach'));
app.use('/api/phishing', require('./routes/phishing'));
app.use('/api/security', require('./routes/security'));
app.use('/api/passwords', require('./routes/passwords'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Locksyra Backend API',
    version: '2.1.0',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      breach: '/api/breach',
      phishing: '/api/phishing',
      security: '/api/security',
      passwords: '/api/passwords'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  console.log(`
╔════════════════════════════════════════╗
║   🛡️  Locksyra Backend Server Started ║
╠════════════════════════════════════════╣
║   Port:     ${PORT}                        
║   Database: MongoDB (localhost)            
║   Status:   ✅ Running                    
║   Health:   http://localhost:${PORT}/health
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;