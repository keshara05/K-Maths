const { query } = require('../config/db');

// GET /api/admin/analytics/overview
const getOverview = async (req, res) => {
  const [students, revenue, courses, attendance] = await Promise.all([
    query(`SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS new_this_month
           FROM users WHERE role = 'student'`),
    query(`SELECT COALESCE(SUM(amount),0) AS total_revenue,
           COALESCE(SUM(amount) FILTER (WHERE month_year >= DATE_TRUNC('month', NOW())),0) AS this_month
           FROM payments WHERE status = 'paid'`),
    query(`SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE is_published = true) AS published
           FROM courses`),
    query(`SELECT COUNT(*) AS total_sessions,
           COALESCE(AVG(cnt),0) AS avg_per_lesson
           FROM (SELECT lesson_id, COUNT(*) AS cnt FROM attendance GROUP BY lesson_id) sub`),
  ]);

  res.json({
    students: students.rows[0],
    revenue: revenue.rows[0],
    courses: courses.rows[0],
    attendance: attendance.rows[0],
  });
};

// GET /api/admin/analytics/engagement
const getEngagement = async (req, res) => {
  // Daily active students (last 30 days)
  const { rows: daily } = await query(
    `SELECT DATE(joined_at) AS date, COUNT(DISTINCT student_id) AS active_students
     FROM attendance
     WHERE joined_at > NOW() - INTERVAL '30 days'
     GROUP BY DATE(joined_at)
     ORDER BY date`
  );

  // Top performing students
  const { rows: topStudents } = await query(
    `SELECT u.full_name, u.email,
            AVG(qa.score::float / NULLIF(qa.total, 0) * 100) AS avg_score,
            COUNT(qa.id) AS quizzes_taken
     FROM quiz_attempts qa
     JOIN users u ON u.id = qa.student_id
     GROUP BY u.id, u.full_name, u.email
     HAVING COUNT(qa.id) >= 1
     ORDER BY avg_score DESC LIMIT 10`
  );

  // Course popularity
  const { rows: courseStats } = await query(
    `SELECT c.title, COUNT(e.id) AS enrolled,
            COUNT(e.id) FILTER (WHERE e.status = 'active') AS active
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id = c.id
     GROUP BY c.id, c.title
     ORDER BY enrolled DESC`
  );

  res.json({ daily_active: daily, top_students: topStudents, course_stats: courseStats });
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (role) { params.push(role); conditions.push(`role = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT id, full_name, email, phone, role, grade, school, is_active, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: count } = await query(
    `SELECT COUNT(*) FROM users ${where}`,
    params.slice(0, -2)
  );

  res.json({ users: rows, total: parseInt(count[0].count), page: +page, limit: +limit });
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res) => {
  const { is_active, role } = req.body;
  const updates = [];
  const params = [req.params.id];

  if (typeof is_active === 'boolean') {
    params.push(is_active);
    updates.push(`is_active = $${params.length}`);
  }
  if (role && ['student', 'teacher', 'admin'].includes(role)) {
    params.push(role);
    updates.push(`role = $${params.length}`);
  }
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });

  const { rows } = await query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $1 RETURNING id, full_name, email, role, is_active`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: rows[0] });
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  // Soft delete — deactivate instead of hard delete
  const { rows } = await query(
    `UPDATE users SET is_active = false, updated_at = NOW()
     WHERE id = $1 AND role != 'admin' RETURNING id`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found or cannot delete admin' });
  res.json({ message: 'User deactivated' });
};

module.exports = { getOverview, getEngagement, getUsers, updateUser, deleteUser };
