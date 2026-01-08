const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BreachCheck = sequelize.define('BreachCheck', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  breachCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  breached: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  breachDetails: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  checkType: {
    type: DataTypes.STRING(20),
    defaultValue: 'email'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'breach_checks',
  timestamps: true
});

module.exports = BreachCheck;