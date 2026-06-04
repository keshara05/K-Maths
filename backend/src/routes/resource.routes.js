const router = require('express').Router();
const ctrl = require('../controllers/resource.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { pdfUpload } = require('../middleware/upload.middleware');

router.get('/',              authenticate, ctrl.getResources);
router.get('/:id/download',  authenticate, ctrl.downloadResource);
router.post('/admin/create', authenticate, requireRole('admin','teacher'), pdfUpload.single('file'), ctrl.createResource);
router.delete('/admin/:id',  authenticate, requireRole('admin'), ctrl.deleteResource);

module.exports = router;
