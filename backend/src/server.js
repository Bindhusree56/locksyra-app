require('dotenv').config();

// Mandatory Environment Variables Validation
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'MONGODB_URI'
];

const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ CRITICAL ERROR: Mandatory environment variables are missing:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nEnsure your .env file is correctly configured before restarting the server.');
  process.exit(1);
}

// ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)
if (process.env.ENCRYPTION_KEY && !/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY)) {
  console.error('❌ CRITICAL ERROR: ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).');
  process.exit(1);
}
const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const xss = require('xss-clean');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach io to request for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`🔌 New socket connection: ${socket.id}`);
  
  // Join user-specific room if authenticated (frontend should send userId/token)
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      logger.info(`👤 Socket ${socket.id} joined room user:${userId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 Socket disconnected: ${socket.id}`);
  });
});

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
app.use(compression()); // Gzip compression
app.use(xss()); // XSS Sanitization

// Request logging with correlation IDs
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Correlation-ID', req.id);
  
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const os = require('os');
  
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: `MongoDB ${dbStatus}`,
    system: {
      platform: os.platform(),
      cpus: os.cpus().length,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`
    }
  });
});

// API Routes (Version 1)
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/breach', require('./routes/breach'));
app.use('/api/v1/phishing', require('./routes/phishing'));
app.use('/api/v1/security', require('./routes/security'));
app.use('/api/v1/passwords', require('./routes/passwords'));

// Legacy support for versionless routes
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
    version: '1.0.0', // Standardized versioning
    apiVersion: 'v1',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      v1: '/api/v1'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5001;

// Start server
server.listen(PORT, async () => {
  await connectDB();
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
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