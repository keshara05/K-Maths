const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { uploadFile, getSignedUrl } = require('../utils/s3.utils');

// GET /api/resources
const getResources = async (req, res) => {
  const { type, course_id } = req.query;
  const params = [];
  const conditions = ['(r.is_public = true OR e.id IS NOT NULL)'];

  if (type) { params.push(type); conditions.push(`r.type = $${params.length}`); }
  if (course_id) { params.push(course_id); conditions.push(`r.course_id = $${params.length}`); }

  params.push(req.user.id);
  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await query(
    `SELECT DISTINCT r.id, r.title, r.description, r.type, r.year,
            r.file_size, r.is_public, r.created_at, c.title AS course_title
     FROM resources r
     LEFT JOIN courses c ON c.id = r.course_id
     LEFT JOIN enrollments e ON e.course_id = r.course_id
       AND e.student_id = $${params.length} AND e.status = 'active'
     ${where}
     ORDER BY r.created_at DESC`,
    params
  );
  res.json({ resources: rows });
};

// GET /api/resources/:id/download — returns signed URL
const downloadResource = async (req, res) => {
  const { rows } = await query('SELECT * FROM resources WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Resource not found' });

  const resource = rows[0];

  // Check access: public or enrolled
  if (!resource.is_public && req.user.role === 'student') {
    const { rows: enroll } = await query(
      `SELECT id FROM enrollments
       WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
      [req.user.id, resource.course_id]
    );
    if (!enroll[0]) return res.status(403).json({ error: 'Enroll in this course to access' });
  }

  const key = resource.file_url.startsWith('http')
    ? new URL(resource.file_url).pathname.slice(1)
    : resource.file_url;

  const url = await getSignedUrl(key, 300); // 5 min
  res.json({ url, filename: resource.title });
};

// POST /api/admin/resources [admin]
const createResource = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const { error, value } = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    type: Joi.string().valid('notes', 'past_paper', 'model_paper', 'tutorial').required(),
    course_id: Joi.string().uuid().optional().allow('', null),
    year: Joi.number().integer().min(2000).max(2099).optional(),
    is_public: Joi.boolean().optional(),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const key = `resources/${uuidv4()}-${req.file.originalname}`;
  await uploadFile(req.file.buffer, key, req.file.mimetype);

  const { rows } = await query(
    `INSERT INTO resources (title, description, type, course_id, year, file_url, file_size, is_public, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      value.title, value.description, value.type,
      value.course_id || null, value.year || null,
      key, req.file.size, value.is_public ?? false, req.user.id,
    ]
  );
  res.status(201).json({ resource: rows[0] });
};

// DELETE /api/admin/resources/:id [admin]
const deleteResource = async (req, res) => {
  const { rowCount } = await query('DELETE FROM resources WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Resource not found' });
  res.json({ message: 'Resource deleted' });
};

module.exports = { getResources, downloadResource, createResource, deleteResource };
