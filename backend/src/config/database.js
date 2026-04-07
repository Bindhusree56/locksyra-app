require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 5;
  const RETRY_INTERVAL = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff max 30s

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/locksyra_db', {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Reset connection event handlers if re-connecting
    mongoose.connection.removeAllListeners('error');
    mongoose.connection.removeAllListeners('disconnected');
    mongoose.connection.removeAllListeners('reconnected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    console.error(`❌ MongoDB connection failed (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    
    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(retryCount + 1);
    } else {
      logger.error('💥 Max database connection retries reached. Exiting...');
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during MongoDB shutdown:', err);
    process.exit(1);
  }
});

module.exports = connectDB;