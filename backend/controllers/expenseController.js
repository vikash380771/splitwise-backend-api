const { Expense, User, ExpenseParticipant, sequelize } = require('../models');
const balanceService = require('../services/balanceService');
const { Op } = require('sequelize');
const moment = require('moment');

class ExpenseController {
  
  // Add expense
  async addExpense(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { name, amount, currency, date, payerId, participants } = req.body;

      // Validate participants include payer
      if (!participants.includes(payerId)) {
        participants.push(payerId);
      }

      // Create expense
      const expense = await Expense.create({
        name,
        amount,
        currency: currency || 'USD',
        date: date || new Date(),
        payerId
      }, { transaction });

      // Add participants
      const shareAmount = amount / participants.length;
      const participantRecords = participants.map(userId => ({
        expenseId: expense.id,
        userId,
        share: shareAmount
      }));

      await ExpenseParticipant.bulkCreate(participantRecords, { transaction });

      // Update balances
      await balanceService.updateBalancesForExpense(expense.id, transaction);

      await transaction.commit();

      res.status(201).json({
        ...expense.toJSON(),
        message: 'Expense added successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Get all expenses for a user with filters
  async getExpenses(req, res, next) {
    try {
      const userId = req.params.userId;
      const { filter, startDate, endDate } = req.query;

      let dateFilter = {};

      if (filter === 'current-month') {
        dateFilter = {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate()
        };
      } else if (filter === 'last-month') {
        dateFilter = {
          [Op.gte]: moment().subtract(1, 'month').startOf('month').toDate(),
          [Op.lte]: moment().subtract(1, 'month').endOf('month').toDate()
        };
      } else if (startDate && endDate) {
        dateFilter = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        };
      }

      // Find all expenses where user is either payer or participant
      const expenses = await Expense.findAll({
        where: dateFilter,
        include: [
          {
            model: User,
            as: 'payer',
            attributes: ['id', 'email']
          },
          {
            model: ExpenseParticipant,
            where: { userId },
            required: true,
            include: [{
              model: User,
              attributes: ['id', 'email']
            }]
          },
          {
            model: User,
            as: 'participants',
            attributes: ['id', 'email'],
            through: { attributes: ['share', 'settled'] }
          }
        ],
        order: [['date', 'DESC']]
      });

      res.json(expenses);
    } catch (error) {
      next(error);
    }
  }

  // Get single expense
  async getExpense(req, res, next) {
    try {
      const { expenseId } = req.params;

      const expense = await Expense.findByPk(expenseId, {
        include: [
          {
            model: User,
            as: 'payer',
            attributes: ['id', 'email']
          },
          {
            model: User,
            as: 'participants',
            attributes: ['id', 'email'],
            through: { attributes: ['share', 'settled'] }
          }
        ]
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(expense);
    } catch (error) {
      next(error);
    }
  }

  // Update expense
  async updateExpense(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { expenseId } = req.params;
      const { name, amount, currency, date, participants } = req.body;

      const expense = await Expense.findByPk(expenseId, {
        include: [ExpenseParticipant]
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      // Update expense details
      if (name) expense.name = name;
      if (amount) expense.amount = amount;
      if (currency) expense.currency = currency;
      if (date) expense.date = date;

      await expense.save({ transaction });

      // Update participants if provided
      if (participants) {
        // Delete old participants
        await ExpenseParticipant.destroy({
          where: { expenseId },
          transaction
        });

        // Add new participants
        const shareAmount = expense.amount / participants.length;
        const participantRecords = participants.map(userId => ({
          expenseId,
          userId,
          share: shareAmount
        }));

        await ExpenseParticipant.bulkCreate(participantRecords, { transaction });
      }

      await transaction.commit();

      res.json({
        ...expense.toJSON(),
        message: 'Expense updated successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Delete expense
  async deleteExpense(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const { expenseId } = req.params;

      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      // Delete participants first
      await ExpenseParticipant.destroy({
        where: { expenseId },
        transaction
      });

      // Delete expense
      await expense.destroy({ transaction });

      await transaction.commit();

      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = new ExpenseController();