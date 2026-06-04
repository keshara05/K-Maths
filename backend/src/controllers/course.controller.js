const Joi = require('joi');
const { query } = require('../config/db');
const { uploadFile } = require('../utils/s3.utils');
const { v4: uuidv4 } = require('uuid');

const courseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().optional().allow(''),
  topic_tag: Joi.string().max(60).optional(),
  monthly_fee: Joi.number().min(0).required(),
  is_published: Joi.boolean().optional(),
});

// GET /api/courses - list all published courses
const getCourses = async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, u.full_name AS teacher_name,
            COUNT(DISTINCT e.id) AS enrolled_count,
            COUNT(DISTINCT l.id) AS lesson_count
     FROM courses c
     LEFT JOIN users u ON u.id = c.created_by
     LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
     LEFT JOIN lessons l ON l.course_id = c.id AND l.is_published = true
     WHERE c.is_published = true
     GROUP BY c.id, u.full_name
     ORDER BY c.created_at DESC`
  );
  res.json({ courses: rows });
};

// GET /api/courses/:id
const getCourse = async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, u.full_name AS teacher_name,
            COUNT(DISTINCT e.id) AS enrolled_count
     FROM courses c
     LEFT JOIN users u ON u.id = c.created_by
     LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
     WHERE c.id = $1
     GROUP BY c.id, u.full_name`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
  res.json({ course: rows[0] });
};

// POST /api/courses [admin]
const createCourse = async (req, res) => {
  const { error, value } = courseSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  let thumbnail_url = null;
  if (req.file) {
    const key = `thumbnails/${uuidv4()}-${req.file.originalname}`;
    thumbnail_url = await uploadFile(req.file.buffer, key, req.file.mimetype);
  }

  const { rows } = await query(
    `INSERT INTO courses (title, description, topic_tag, monthly_fee, thumbnail_url, is_published, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      value.title, value.description, value.topic_tag,
      value.monthly_fee, thumbnail_url,
      value.is_published ?? false, req.user.id,
    ]
  );
  res.status(201).json({ course: rows[0] });
};

// PATCH /api/courses/:id [admin]
const updateCourse = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().optional().allow(''),
    topic_tag: Joi.string().max(60).optional(),
    monthly_fee: Joi.number().min(0).optional(),
    is_published: Joi.boolean().optional(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const fields = Object.keys(value);
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = [req.params.id, ...fields.map((f) => value[f])];

  const { rows } = await query(
    `UPDATE courses SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    values
  );
  if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
  res.json({ course: rows[0] });
};

// DELETE /api/courses/:id [admin]
const deleteCourse = async (req, res) => {
  const { rowCount } = await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course deleted' });
};

// GET /api/courses/mine - enrolled courses for current student
const getMyCourses = async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, e.status AS enrollment_status, e.enrolled_at,
            COUNT(DISTINCT l.id) AS lesson_count
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN lessons l ON l.course_id = c.id AND l.is_published = true
     WHERE e.student_id = $1
     GROUP BY c.id, e.status, e.enrolled_at
     ORDER BY e.enrolled_at DESC`,
    [req.user.id]
  );
  res.json({ courses: rows });
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getMyCourses };
