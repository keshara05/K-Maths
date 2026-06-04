const router = require('express').Router();
const ctrl = require('../controllers/attendance.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/join/:lessonId',       authenticate, ctrl.joinLesson);
router.post('/leave/:lessonId',      authenticate, ctrl.leaveLesson);
router.get('/student/:studentId',    authenticate, ctrl.getStudentAttendance);
router.get('/lesson/:lessonId',      authenticate, requireRole('admin','teacher'), ctrl.getLessonAttendance);
router.post('/admin/mark',           authenticate, requireRole('admin','teacher'), ctrl.markAttendance);
router.get('/admin/summary',         authenticate, requireRole('admin','teacher'), ctrl.getAttendanceSummary);

module.exports = router;
