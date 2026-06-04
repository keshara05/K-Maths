const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { uploadFile, getSignedUrl } = require('../utils/s3.utils');

const lessonSchema = Joi.object({
  course_id: Joi.string().uuid().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().optional().allow(''),
  type: Joi.string().valid('live', 'recorded', 'pdf', 'zoom').required(),
  zoom_link: Joi.string().uri().optional().allow(''),
  scheduled_at: Joi.string().isoDate().optional().allow(''),
  duration_min: Joi.number().integer().min(1).optional(),
  sort_order: Joi.number().integer().optional(),
  is_published: Joi.boolean().optional(),
});

// GET /api/courses/:courseId/lessons
const getLessons = async (req, res) => {
  const { courseId } = req.params;
  const isAdminOrTeacher = ['admin', 'teacher'].includes(req.user?.role);

  const { rows } = await query(
    `SELECT l.*,
            CASE WHEN a.id IS NOT NULL THEN true ELSE false END AS attended
     FROM lessons l
     LEFT JOIN attendance a ON a.lesson_id = l.id AND a.student_id = $2
     WHERE l.course_id = $1 ${isAdminOrTeacher ? '' : 'AND l.is_published = true'}
     ORDER BY l.sort_order, l.scheduled_at`,
    [courseId, req.user?.id || null]
  );
  res.json({ lessons: rows });
};

// GET /api/lessons/:id
const getLesson = async (req, res) => {
  const { rows } = await query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson: rows[0] });
};

// GET /api/lessons/:id/video-url  - returns a 15-min signed S3 URL
const getVideoUrl = async (req, res) => {
  const { rows } = await query(
    'SELECT video_url FROM lessons WHERE id = $1',
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  if (!rows[0].video_url) return res.status(404).json({ error: 'No video for this lesson' });

  // Extract S3 key from full URL if stored as full URL
  const url = rows[0].video_url;
  const key = url.startsWith('http') ? new URL(url).pathname.slice(1) : url;
  const signedUrl = await getSignedUrl(key, 900); // 15 min
  res.json({ url: signedUrl, expires_in: 900 });
};

// POST /api/lessons [admin]
const createLesson = async (req, res) => {
  const { error, value } = lessonSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { rows } = await query(
    `INSERT INTO lessons
     (course_id, title, description, type, zoom_link, scheduled_at, duration_min, sort_order, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      value.course_id, value.title, value.description, value.type,
      value.zoom_link || null, value.scheduled_at || null,
      value.duration_min || null, value.sort_order || 0,
      value.is_published ?? false,
    ]
  );
  res.status(201).json({ lesson: rows[0] });
};

// POST /api/lessons/:id/upload [admin] - upload video to S3
const uploadVideo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file provided' });

  const { rows: lesson } = await query('SELECT id FROM lessons WHERE id = $1', [req.params.id]);
  if (!lesson[0]) return res.status(404).json({ error: 'Lesson not found' });

  const ext = req.file.originalname.split('.').pop();
  const key = `videos/${req.params.id}/${uuidv4()}.${ext}`;
  const videoUrl = await uploadFile(req.file.buffer, key, req.file.mimetype);

  const { rows } = await query(
    'UPDATE lessons SET video_url = $1 WHERE id = $2 RETURNING *',
    [key, req.params.id]
  );
  res.json({ lesson: rows[0], message: 'Video uploaded successfully' });
};

// PATCH /api/lessons/:id [admin]
const updateLesson = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    description: Joi.string().optional().allow(''),
    type: Joi.string().valid('live', 'recorded', 'pdf', 'zoom').optional(),
    zoom_link: Joi.string().uri().optional().allow(''),
    scheduled_at: Joi.string().isoDate().optional().allow(''),
    duration_min: Joi.number().integer().min(1).optional(),
    sort_order: Joi.number().integer().optional(),
    is_published: Joi.boolean().optional(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const fields = Object.keys(value);
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const { rows } = await query(
    `UPDATE lessons SET ${setClause} WHERE id = $1 RETURNING *`,
    [req.params.id, ...fields.map((f) => value[f])]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson: rows[0] });
};

// DELETE /api/lessons/:id [admin]
const deleteLesson = async (req, res) => {
  const { rowCount } = await query('DELETE FROM lessons WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ message: 'Lesson deleted' });
};

module.exports = {
  getLessons, getLesson, getVideoUrl, createLesson,
  uploadVideo, updateLesson, deleteLesson,
};
