const router = require('express').Router();
const ctrl = require('../controllers/lesson.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { videoUpload } = require('../middleware/upload.middleware');

router.get('/course/:courseId', authenticate, ctrl.getLessons);
router.get('/:id',              authenticate, ctrl.getLesson);
router.get('/:id/video-url',    authenticate, ctrl.getVideoUrl);
router.post('/',                authenticate, requireRole('admin','teacher'), ctrl.createLesson);
router.post('/:id/upload',      authenticate, requireRole('admin','teacher'), videoUpload.single('video'), ctrl.uploadVideo);
router.patch('/:id',            authenticate, requireRole('admin','teacher'), ctrl.updateLesson);
router.delete('/:id',           authenticate, requireRole('admin'), ctrl.deleteLesson);

module.exports = router;
