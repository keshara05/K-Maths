const router = require('express').Router();
const ctrl = require('../controllers/enrollment.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/',            authenticate, ctrl.enroll);
router.get('/mine',         authenticate, ctrl.getMyEnrollments);
router.get('/admin/all',    authenticate, requireRole('admin'), ctrl.getAllEnrollments);
router.patch('/:id/status', authenticate, requireRole('admin'), ctrl.updateEnrollmentStatus);

module.exports = router;
