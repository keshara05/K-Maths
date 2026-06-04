const { verifyAccessToken } = require('../utils/jwt.utils');
const { query } = require('../config/db');

/**
 * Verify JWT access token and attach user to request
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    const { rows } = await query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
      [decoded.sub]
    );
    if (!rows[0] || !rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-based access guard factory
 * Usage: requireRole('admin') or requireRole('admin', 'teacher')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};

/**
 * Check student is enrolled in a course
 */
const requireEnrollment = async (req, res, next) => {
  const courseId = req.params.courseId || req.body.course_id;
  if (!courseId) return next();

  if (req.user.role === 'admin' || req.user.role === 'teacher') return next();

  const { rows } = await query(
    `SELECT id FROM enrollments
     WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
    [req.user.id, courseId]
  );
  if (!rows[0]) {
    return res.status(403).json({ error: 'You are not enrolled in this course' });
  }
  next();
};

module.exports = { authenticate, requireRole, requireEnrollment };
