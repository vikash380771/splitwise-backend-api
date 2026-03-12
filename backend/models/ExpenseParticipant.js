const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseParticipant = sequelize.define('ExpenseParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  expenseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Expenses',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  share: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  settled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = ExpenseParticipant;