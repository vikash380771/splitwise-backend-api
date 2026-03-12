const sequelize = require('../config/database');
const User = require('./User');
const Expense = require('./Expense');
const ExpenseParticipant = require('./ExpenseParticipant');
const Balance = require('./Balance');

// Define associations
User.hasMany(Expense, { as: 'paidExpenses', foreignKey: 'payerId' });
Expense.belongsTo(User, { as: 'payer', foreignKey: 'payerId' });

User.belongsToMany(Expense, { 
  through: ExpenseParticipant, 
  as: 'participatedExpenses', 
  foreignKey: 'userId' 
});
Expense.belongsToMany(User, { 
  through: ExpenseParticipant, 
  as: 'participants', 
  foreignKey: 'expenseId' 
});

Expense.hasMany(ExpenseParticipant, { foreignKey: 'expenseId' });
ExpenseParticipant.belongsTo(Expense, { foreignKey: 'expenseId' });
ExpenseParticipant.belongsTo(User, { foreignKey: 'userId' });

// Balance associations
User.hasMany(Balance, { as: 'balancesOwed', foreignKey: 'userId' });
User.hasMany(Balance, { as: 'balancesToOthers', foreignKey: 'otherUserId' });
Balance.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Balance.belongsTo(User, { as: 'otherUser', foreignKey: 'otherUserId' });

module.exports = {
  sequelize,
  User,
  Expense,
  ExpenseParticipant,
  Balance
};