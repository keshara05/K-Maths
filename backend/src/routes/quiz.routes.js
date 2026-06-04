const router = require('express').Router();
const ctrl = require('../controllers/quiz.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.get('/progress/me',    authenticate, ctrl.getProgress);
router.get('/admin/list',     authenticate, requireRole('admin','teacher'), ctrl.listQuizzes);
router.post('/admin/create',  authenticate, requireRole('admin','teacher'), ctrl.createQuiz);
router.get('/:id',            authenticate, ctrl.getQuiz);
router.post('/:id/submit',    authenticate, ctrl.submitQuiz);
router.get('/:id/result',     authenticate, ctrl.getQuizResult);

module.exports = router;
