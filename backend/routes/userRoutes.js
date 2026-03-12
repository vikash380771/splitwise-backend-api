const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Validation rules
const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'])
];

// Routes
router.post('/register', userValidation, userController.createUser);
router.post('/login', userController.login);
router.get('/:userId', userController.getProfile);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router;