require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'secureu_db',
  process.env.DB_USER || 'secureu_user',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    console.log('✅ Database connected!');
  } catch (err) {
    logger.error('❌ Unable to connect to the database:', err);
    console.error('❌ Database connection failed:', err.message);
  }
};

testConnection();

module.exports = sequelize;