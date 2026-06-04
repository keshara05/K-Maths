const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/initiate',     authenticate, ctrl.initiatePayment);
router.post('/webhook',      ctrl.handleWebhook);
router.get('/history',       authenticate, ctrl.getPaymentHistory);
router.get('/admin/all',     authenticate, requireRole('admin'), ctrl.getAllPayments);
router.get('/admin/summary', authenticate, requireRole('admin'), ctrl.getRevenueSummary);

module.exports = router;
