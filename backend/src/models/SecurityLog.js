const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SecurityLog = sequelize.define('SecurityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  actionType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  severity: {
    type: DataTypes.STRING(20),
    defaultValue: 'info'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'security_logs',
  timestamps: true
});

module.exports = SecurityLog;