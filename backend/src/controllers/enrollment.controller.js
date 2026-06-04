const Joi = require('joi');
const { query } = require('../config/db');

// POST /api/enrollments
const enroll = async (req, res) => {
  const { error, value } = Joi.object({
    course_id: Joi.string().uuid().required(),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Verify course exists and is published
  const { rows: course } = await query(
    'SELECT id, title, monthly_fee FROM courses WHERE id = $1 AND is_published = true',
    [value.course_id]
  );
  if (!course[0]) return res.status(404).json({ error: 'Course not found or not published' });

  // Check already enrolled
  const { rows: existing } = await query(
    'SELECT id, status FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [req.user.id, value.course_id]
  );
  if (existing[0]) {
    if (existing[0].status === 'active') {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }
    // Re-activate suspended enrollment
    const { rows } = await query(
      `UPDATE enrollments SET status = 'active' WHERE id = $1 RETURNING *`,
      [existing[0].id]
    );
    return res.json({ enrollment: rows[0], message: 'Enrollment re-activated' });
  }

  const { rows } = await query(
    'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
    [req.user.id, value.course_id]
  );
  res.status(201).json({ enrollment: rows[0], course: course[0] });
};

// GET /api/enrollments/mine
const getMyEnrollments = async (req, res) => {
  const { rows } = await query(
    `SELECT e.*, c.title AS course_title, c.thumbnail_url, c.monthly_fee,
            c.topic_tag, u.full_name AS teacher_name
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN users u ON u.id = c.created_by
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [req.user.id]
  );
  res.json({ enrollments: rows });
};

// GET /api/admin/enrollments [admin]
const getAllEnrollments = async (req, res) => {
  const { course_id, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (course_id) { params.push(course_id); conditions.push(`e.course_id = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`e.status = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT e.*, u.full_name AS student_name, u.email AS student_email,
            c.title AS course_title
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     ${where}
     ORDER BY e.enrolled_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: count } = await query(
    `SELECT COUNT(*) FROM enrollments e ${where}`,
    params.slice(0, -2)
  );

  res.json({ enrollments: rows, total: parseInt(count[0].count), page: +page, limit: +limit });
};

// PATCH /api/enrollments/:id/status [admin]
const updateEnrollmentStatus = async (req, res) => {
  const { error, value } = Joi.object({
    status: Joi.string().valid('active', 'suspended', 'completed').required(),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { rows } = await query(
    'UPDATE enrollments SET status = $1 WHERE id = $2 RETURNING *',
    [value.status, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Enrollment not found' });
  res.json({ enrollment: rows[0] });
};

module.exports = { enroll, getMyEnrollments, getAllEnrollments, updateEnrollmentStatus };
