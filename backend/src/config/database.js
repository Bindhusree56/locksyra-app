require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/locksyra_db', {
      // MongoDB connection options
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
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
    logger.error('❌ MongoDB connection failed:', error);
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
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