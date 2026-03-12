const { Balance, User, sequelize } = require('../models');
const balanceService = require('../services/balanceService');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

class BalanceController {

  // Get all balances for a user
  async getUserBalances(req, res, next) {
    try {
      const userId = parseInt(req.params.userId);

      const balances = await balanceService.getUserBalances(userId);

      res.json(balances);
    } catch (error) {
      next(error);
    }
  }

  // Get balance between two users
  async getBalanceWithUser(req, res, next) {
    try {
      const userId = parseInt(req.params.userId);
      const otherUserId = parseInt(req.params.otherUserId);

      const balances = await Balance.findAll({
        where: {
          [Op.or]: [
            { userId, otherUserId },
            { userId: otherUserId, otherUserId: userId }
          ]
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'email'] },
          { model: User, as: 'otherUser', attributes: ['id', 'email'] }
        ]
      });

      if (balances.length === 0) {
        return res.json({
          userId: otherUserId,
          amount: 0,
          currency: 'USD',
          direction: 'settled'
        });
      }

      const balance = balances[0];
      let amount = balance.amount;

      if (balance.userId !== userId) {
        amount = -balance.amount;
      }

      res.json({
        userId: otherUserId,
        amount,
        currency: balance.currency,
        direction:
          amount > 0
            ? 'owes_you'
            : amount < 0
            ? 'you_owe'
            : 'settled'
      });

    } catch (error) {
      next(error);
    }
  }

  // Send monthly email report
  async sendMonthlyReport(req, res, next) {
    try {
      const userId = parseInt(req.params.userId);

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const balances = await balanceService.getUserBalances(userId);

      await emailService.sendMonthlyBalanceReport(
        user.email,
        balances
      );

      res.json({
        message: 'Monthly report sent successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  // Settle balance
  async settleBalance(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const userId = parseInt(req.params.userId);
      const otherUserId = parseInt(req.params.otherUserId);

      const { amount, currency } = req.body;

      const minUser = Math.min(userId, otherUserId);
      const maxUser = Math.max(userId, otherUserId);

      // Find or create balance
      let [balance] = await Balance.findOrCreate({
        where: {
          userId: minUser,
          otherUserId: maxUser,
          currency
        },
        defaults: {
          userId: minUser,
          otherUserId: maxUser,
          amount: 0,
          currency
        },
        transaction
      });

      // Update balance
      if (userId === minUser) {
        balance.amount -= amount;
      } else {
        balance.amount += amount;
      }

      await balance.save({ transaction });

      await transaction.commit();

      res.json({
        message: 'Balance settled successfully',
        remainingBalance: balance.amount
      });

    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = new BalanceController();