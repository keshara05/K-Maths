const router = require('express').Router();
const ctrl = require('../controllers/course.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { imageUpload } = require('../middleware/upload.middleware');

router.get('/',        authenticate, ctrl.getCourses);
router.get('/mine',    authenticate, ctrl.getMyCourses);
router.get('/:id',     authenticate, ctrl.getCourse);
router.post('/',       authenticate, requireRole('admin','teacher'), imageUpload.single('thumbnail'), ctrl.createCourse);
router.patch('/:id',   authenticate, requireRole('admin','teacher'), ctrl.updateCourse);
router.delete('/:id',  authenticate, requireRole('admin'), ctrl.deleteCourse);

module.exports = router;
