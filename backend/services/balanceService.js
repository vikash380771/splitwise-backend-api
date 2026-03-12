const { Balance, User, Expense, ExpenseParticipant, sequelize } = require('../models');
const { Op } = require('sequelize');
class BalanceService {
  
  // Update balances when an expense is added
  async updateBalancesForExpense(expenseId, transaction) {
    const expense = await Expense.findByPk(expenseId, {
      include: [{
        model: ExpenseParticipant,
        include: [User]
      }],
      transaction
    });

    if (!expense) throw new Error('Expense not found');

    const payerId = expense.payerId;
    const participants = expense.ExpenseParticipants;
    
    // Calculate equal share if not specified
    const totalParticipants = participants.length;
    const sharePerPerson = expense.amount / totalParticipants;

    for (const participant of participants) {
      if (participant.userId === payerId) continue;

      const shareAmount = participant.share || sharePerPerson;
      
      // Update or create balance between payer and participant
      await this.updateBalance(
        payerId, 
        participant.userId, 
        shareAmount, 
        expense.currency,
        transaction
      );
    }
  }

  // Update balance between two users
  async updateBalance(userId1, userId2, amount, currency, transaction) {
    // Ensure userId1 < userId2 for consistent ordering
    const [smallId, largeId] = [userId1, userId2].sort((a, b) => a - b);
    
    let balance = await Balance.findOne({
      where: {
        userId: smallId,
        otherUserId: largeId,
        currency
      },
      transaction
    });

    if (!balance) {
      balance = await Balance.create({
        userId: smallId,
        otherUserId: largeId,
        amount: 0,
        currency
      }, { transaction });
    }

    // Update amount based on who owes whom
    if (userId1 === smallId) {
      // userId1 is the smaller ID, amount positive means userId2 owes userId1
      balance.amount += amount;
    } else {
      // userId1 is the larger ID, amount positive means userId1 owes userId2
      balance.amount -= amount;
    }

    await balance.save({ transaction });
    return balance;
  }

  // Get balances for a user
  async getUserBalances(userId) {
    const balances = await Balance.findAll({
      where: {
        [Op.or]: [
          { userId },
          { otherUserId: userId }
        ]
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'] },
        { model: User, as: 'otherUser', attributes: ['id', 'email'] }
      ]
    });

    // Transform balances to show from user's perspective
    const formattedBalances = balances.map(balance => {
      let amount = balance.amount;
      let otherUser;

      if (balance.userId === userId) {
        otherUser = balance.otherUser;
        // Positive amount means otherUser owes user
      } else {
        otherUser = balance.user;
        amount = -balance.amount; // Reverse sign
      }

      return {
        userId: otherUser.id,
        email: otherUser.email,
        amount: amount,
        currency: balance.currency,
        direction: amount > 0 ? 'owes_you' : amount < 0 ? 'you_owe' : 'settled'
      };
    });

    return formattedBalances;
  }
}

module.exports = new BalanceService();