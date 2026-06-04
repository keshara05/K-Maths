const Joi = require('joi');
const { query } = require('../config/db');

// POST /api/attendance/join/:lessonId — auto-mark when student opens video
const joinLesson = async (req, res) => {
  const { lessonId } = req.params;

  // Verify lesson exists and student is enrolled in its course
  const { rows: lesson } = await query(
    `SELECT l.id, l.course_id FROM lessons l WHERE l.id = $1`,
    [lessonId]
  );
  if (!lesson[0]) return res.status(404).json({ error: 'Lesson not found' });

  if (req.user.role === 'student') {
    const { rows: enroll } = await query(
      `SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
      [req.user.id, lesson[0].course_id]
    );
    if (!enroll[0]) return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  // Upsert attendance record
  const { rows } = await query(
    `INSERT INTO attendance (student_id, lesson_id, mode)
     VALUES ($1, $2, 'online')
     ON CONFLICT (student_id, lesson_id) DO NOTHING
     RETURNING *`,
    [req.user.id, lessonId]
  );

  res.json({ attendance: rows[0] || null, message: 'Attendance recorded' });
};

// POST /api/attendance/leave/:lessonId — update left_at timestamp
const leaveLesson = async (req, res) => {
  const { rows } = await query(
    `UPDATE attendance SET left_at = NOW()
     WHERE student_id = $1 AND lesson_id = $2 AND left_at IS NULL
     RETURNING *`,
    [req.user.id, req.params.lessonId]
  );
  res.json({ attendance: rows[0] || null });
};

// GET /api/attendance/student/:studentId — get attendance for a student
const getStudentAttendance = async (req, res) => {
  const studentId = req.params.studentId === 'me' ? req.user.id : req.params.studentId;

  // Students can only see own attendance
  if (req.user.role === 'student' && studentId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { rows } = await query(
    `SELECT a.*, l.title AS lesson_title, l.scheduled_at, l.type,
            c.title AS course_title
     FROM attendance a
     JOIN lessons l ON l.id = a.lesson_id
     JOIN courses c ON c.id = l.course_id
     WHERE a.student_id = $1
     ORDER BY a.joined_at DESC`,
    [studentId]
  );
  res.json({ attendance: rows });
};

// GET /api/admin/attendance/:lessonId — all students for a lesson
const getLessonAttendance = async (req, res) => {
  const { rows } = await query(
    `SELECT a.*, u.full_name, u.email
     FROM attendance a
     JOIN users u ON u.id = a.student_id
     WHERE a.lesson_id = $1
     ORDER BY a.joined_at`,
    [req.params.lessonId]
  );
  res.json({ attendance: rows, count: rows.length });
};

// POST /api/admin/attendance/mark — manual mark for physical class
const markAttendance = async (req, res) => {
  const { error, value } = Joi.object({
    student_id: Joi.string().uuid().required(),
    lesson_id: Joi.string().uuid().required(),
    mode: Joi.string().valid('online', 'physical').default('physical'),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { rows } = await query(
    `INSERT INTO attendance (student_id, lesson_id, mode, marked_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, lesson_id)
     DO UPDATE SET mode = $3, marked_by = $4
     RETURNING *`,
    [value.student_id, value.lesson_id, value.mode, req.user.id]
  );
  res.json({ attendance: rows[0] });
};

// GET /api/admin/attendance/summary — overall attendance stats
const getAttendanceSummary = async (req, res) => {
  const { course_id } = req.query;
  const params = course_id ? [course_id] : [];
  const courseFilter = course_id ? 'WHERE l.course_id = $1' : '';

  const { rows } = await query(
    `SELECT l.id AS lesson_id, l.title, l.scheduled_at, l.course_id,
            c.title AS course_title,
            COUNT(a.id) AS attended_count
     FROM lessons l
     LEFT JOIN attendance a ON a.lesson_id = l.id
     JOIN courses c ON c.id = l.course_id
     ${courseFilter}
     GROUP BY l.id, l.title, l.scheduled_at, l.course_id, c.title
     ORDER BY l.scheduled_at DESC
     LIMIT 50`,
    params
  );
  res.json({ lessons: rows });
};

module.exports = {
  joinLesson, leaveLesson, getStudentAttendance,
  getLessonAttendance, markAttendance, getAttendanceSummary,
};
