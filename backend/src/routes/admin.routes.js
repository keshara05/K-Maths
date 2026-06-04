const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const guard = [authenticate, requireRole('admin')];

router.get('/analytics/overview',    ...guard, ctrl.getOverview);
router.get('/analytics/engagement',  ...guard, ctrl.getEngagement);
router.get('/users',                 ...guard, ctrl.getUsers);
router.patch('/users/:id',           ...guard, ctrl.updateUser);
router.delete('/users/:id',          ...guard, ctrl.deleteUser);

module.exports = router;
