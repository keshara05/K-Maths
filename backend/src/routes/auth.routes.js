const router = require('express').Router();
const { register, login, refresh, logout, getMe, updateMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        authenticate, getMe);
router.patch('/me',      authenticate, updateMe);

module.exports = router;
