const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  getPendingPayments,
  createPayments,
  getWorkerSummary,
  createWithdrawal,
  getWorkerWithdrawals
} = require('../controllers/paymentsController');

const router = express.Router();

// Admin payments
router.get('/pending', authenticateToken, authorize('admin'), getPendingPayments);
router.post('/', authenticateToken, authorize('admin'), createPayments);
// Aliases for clarity
router.get('/payouts/pending', authenticateToken, authorize('admin'), getPendingPayments);
router.post('/payouts', authenticateToken, authorize('admin'), createPayments);

// Worker payment views and actions
router.get('/worker/summary', authenticateToken, authorize('worker'), getWorkerSummary);
router.get('/worker/withdrawals', authenticateToken, authorize('worker'), getWorkerWithdrawals);
router.post('/worker/withdrawals', authenticateToken, authorize('worker'), createWithdrawal);
// Alias: earnings
router.get('/worker/earnings/summary', authenticateToken, authorize('worker'), getWorkerSummary);

module.exports = router;
