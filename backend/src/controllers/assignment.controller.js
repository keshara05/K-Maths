const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { uploadFile, getSignedUrl } = require('../utils/s3.utils');

// GET /api/assignments?course_id=
const getAssignments = async (req, res) => {
  const { course_id } = req.query;
  const params = [req.user.id];
  const conditions = req.user.role === 'student'
    ? [`e.student_id = $1 AND e.status = 'active'`]
    : [];

  if (course_id) {
    params.push(course_id);
    conditions.push(`a.course_id = $${params.length}`);
  }

  const joinClause = req.user.role === 'student'
    ? 'JOIN enrollments e ON e.course_id = a.course_id'
    : '';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await query(
    `SELECT DISTINCT a.*, c.title AS course_title,
            sub.id AS submission_id, sub.submitted_at, sub.marks, sub.feedback
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     ${joinClause}
     LEFT JOIN assignment_submissions sub
       ON sub.assignment_id = a.id AND sub.student_id = $1
     ${where}
     ORDER BY a.due_date ASC NULLS LAST`,
    params
  );
  res.json({ assignments: rows });
};

// POST /api/assignments/:id/submit
const submitAssignment = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const { rows: assign } = await query(
    'SELECT * FROM assignments WHERE id = $1', [req.params.id]
  );
  if (!assign[0]) return res.status(404).json({ error: 'Assignment not found' });

  // Verify enrollment
  const { rows: enroll } = await query(
    `SELECT id FROM enrollments
     WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
    [req.user.id, assign[0].course_id]
  );
  if (!enroll[0]) return res.status(403).json({ error: 'Not enrolled in this course' });

  const key = `assignments/${req.params.id}/${req.user.id}-${uuidv4()}.${req.file.originalname.split('.').pop()}`;
  await uploadFile(req.file.buffer, key, req.file.mimetype);

  const { rows } = await query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, notes)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (assignment_id, student_id)
     DO UPDATE SET file_url = $3, notes = $4, submitted_at = NOW()
     RETURNING *`,
    [req.params.id, req.user.id, key, req.body.notes || null]
  );
  res.status(201).json({ submission: rows[0] });
};

// POST /api/admin/assignments [admin]
const createAssignment = async (req, res) => {
  const { error, value } = Joi.object({
    course_id: Joi.string().uuid().required(),
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    due_date: Joi.string().isoDate().optional().allow(null),
    max_marks: Joi.number().integer().min(1).optional(),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { rows } = await query(
    `INSERT INTO assignments (course_id, title, description, due_date, max_marks)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [value.course_id, value.title, value.description, value.due_date, value.max_marks || 100]
  );
  res.status(201).json({ assignment: rows[0] });
};

// PATCH /api/admin/submissions/:id/grade [admin]
const gradeSubmission = async (req, res) => {
  const { error, value } = Joi.object({
    marks: Joi.number().integer().min(0).required(),
    feedback: Joi.string().optional().allow(''),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { rows } = await query(
    `UPDATE assignment_submissions SET marks = $1, feedback = $2, graded_at = NOW()
     WHERE id = $3 RETURNING *`,
    [value.marks, value.feedback || null, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Submission not found' });
  res.json({ submission: rows[0] });
};

// GET /api/admin/assignments/:id/submissions [admin]
const getSubmissions = async (req, res) => {
  const { rows } = await query(
    `SELECT s.*, u.full_name, u.email
     FROM assignment_submissions s
     JOIN users u ON u.id = s.student_id
     WHERE s.assignment_id = $1
     ORDER BY s.submitted_at DESC`,
    [req.params.id]
  );
  res.json({ submissions: rows });
};

module.exports = { getAssignments, submitAssignment, createAssignment, gradeSubmission, getSubmissions };
