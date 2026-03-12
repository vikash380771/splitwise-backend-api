const { User, Balance, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
class UserController {
  
  // Create new user
  async createUser(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, currency } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const user = await User.create({
        email,
        password,
        currency: currency || 'USD'
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        id: user.id,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        id: user.id,
        email: user.email,
        currency: user.currency,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user profile
  async getProfile(req, res, next) {
    try {
      const userId = req.params.userId || req.body.userId || req.query.userId;
      
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'currency', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Update user
  async updateUser(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.params.userId;
      const { email, currency, currentPassword, newPassword } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If updating password, verify current password
      if (newPassword) {
        const isValid = await user.validatePassword(currentPassword);
        if (!isValid) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        user.password = newPassword;
      }

      if (email) user.email = email;
      if (currency) user.currency = currency;

      await user.save({ transaction });
      await transaction.commit();

      res.json({
        id: user.id,
        email: user.email,
        currency: user.currency,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  // Delete user
  async deleteUser(req, res, next) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.params.userId;
      const { password } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Delete all related data (balances will cascade)
     await Balance.destroy({ 
  where: { 
    [Op.or]: [
      { userId },
      { otherUserId: userId }
    ]
  },
  transaction
});
      await user.destroy({ transaction });
      await transaction.commit();

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = new UserController();