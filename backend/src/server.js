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
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
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
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Connected'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/breach', require('./routes/breach'));
app.use('/api/phishing', require('./routes/phishing'));
app.use('/api/security', require('./routes/security'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Locksyra Backend API - MongoDB',
    version: '2.0.0',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      breach: '/api/breach',
      phishing: '/api/phishing',
      security: '/api/security'
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
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  logger.info(`🍃 Database: MongoDB`);
  console.log(`
╔════════════════════════════════════════╗
║   🛡️ Locksyra Backend Server Started  ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                          
║   Database: MongoDB ✅                    
║   Status: ✅ Running                    
║   Health: http://localhost:${PORT}/health
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app;