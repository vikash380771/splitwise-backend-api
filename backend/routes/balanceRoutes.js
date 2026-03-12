const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

// Routes
router.get('/user/:userId', balanceController.getUserBalances);
router.get('/:userId/with/:otherUserId', balanceController.getBalanceWithUser);
router.post('/:userId/settle/:otherUserId', balanceController.settleBalance);
router.post('/:userId/monthly-report', balanceController.sendMonthlyReport);

module.exports = router;