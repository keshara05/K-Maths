const router = require('express').Router();
const ctrl = require('../controllers/assignment.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { assignmentUpload } = require('../middleware/upload.middleware');

router.get('/',                              authenticate, ctrl.getAssignments);
router.post('/:id/submit',                   authenticate, assignmentUpload.single('file'), ctrl.submitAssignment);
router.post('/admin/create',                 authenticate, requireRole('admin','teacher'), ctrl.createAssignment);
router.get('/admin/:id/submissions',         authenticate, requireRole('admin','teacher'), ctrl.getSubmissions);
router.patch('/admin/submissions/:id/grade', authenticate, requireRole('admin','teacher'), ctrl.gradeSubmission);

module.exports = router;
