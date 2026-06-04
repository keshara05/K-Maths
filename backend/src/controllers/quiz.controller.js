const Joi = require('joi');
const { query } = require('../config/db');

// GET /api/quizzes/:id — fetch quiz with questions (correct_index hidden for students)
const getQuiz = async (req, res) => {
  const { rows: quiz } = await query(
    'SELECT * FROM quizzes WHERE id = $1 AND is_published = true',
    [req.params.id]
  );
  if (!quiz[0]) return res.status(404).json({ error: 'Quiz not found' });

  const isAdmin = ['admin', 'teacher'].includes(req.user.role);
  const { rows: questions } = await query(
    `SELECT id, question_text, options, sort_order, topic_tag
     ${isAdmin ? ', correct_index, explanation' : ''}
     FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order`,
    [req.params.id]
  );

  res.json({ quiz: quiz[0], questions });
};

// POST /api/quizzes/:id/submit
const submitQuiz = async (req, res) => {
  const { error, value } = Joi.object({
    answers: Joi.object().pattern(Joi.string().uuid(), Joi.number().integer().min(0).max(3)).required(),
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Check quiz exists
  const { rows: quiz } = await query(
    'SELECT * FROM quizzes WHERE id = $1 AND is_published = true',
    [req.params.id]
  );
  if (!quiz[0]) return res.status(404).json({ error: 'Quiz not found' });

  // Fetch all questions with correct answers
  const { rows: questions } = await query(
    'SELECT id, correct_index, explanation, topic_tag FROM quiz_questions WHERE quiz_id = $1',
    [req.params.id]
  );

  // Grade
  let score = 0;
  const results = questions.map((q) => {
    const chosen = value.answers[q.id] ?? -1;
    const correct = chosen === q.correct_index;
    if (correct) score++;
    return {
      question_id: q.id,
      chosen_index: chosen,
      correct_index: q.correct_index,
      is_correct: correct,
      explanation: q.explanation,
      topic_tag: q.topic_tag,
    };
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Persist attempt
  const { rows: attempt } = await query(
    `INSERT INTO quiz_attempts (student_id, quiz_id, answers, score, total)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user.id, req.params.id, JSON.stringify(value.answers), score, total]
  );

  res.json({
    attempt: attempt[0],
    score,
    total,
    percentage,
    results,
  });
};

// GET /api/quizzes/:id/result — latest attempt result
const getQuizResult = async (req, res) => {
  const { rows } = await query(
    `SELECT qa.*, q.title AS quiz_title
     FROM quiz_attempts qa
     JOIN quizzes q ON q.id = qa.quiz_id
     WHERE qa.quiz_id = $1 AND qa.student_id = $2
     ORDER BY qa.submitted_at DESC LIMIT 1`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'No attempt found' });
  res.json({ attempt: rows[0] });
};

// GET /api/progress/me — weak area analysis
const getProgress = async (req, res) => {
  // Per-topic accuracy from quiz attempts
  const { rows: topicStats } = await query(
    `SELECT qq.topic_tag,
            COUNT(*) AS total_questions,
            SUM(CASE WHEN (qa.answers->>(qq.id::text))::int = qq.correct_index THEN 1 ELSE 0 END) AS correct_count
     FROM quiz_attempts qat
     JOIN quizzes q ON q.id = qat.quiz_id
     JOIN quiz_questions qq ON qq.quiz_id = q.id
     JOIN LATERAL json_each(qat.answers) ans ON ans.key = qq.id::text
     WHERE qat.student_id = $1
     GROUP BY qq.topic_tag
     ORDER BY correct_count::float / NULLIF(total_questions, 0) ASC`,
    [req.user.id]
  );

  // Overall quiz stats
  const { rows: overall } = await query(
    `SELECT COUNT(*) AS quizzes_taken,
            COALESCE(AVG(score::float / NULLIF(total, 0) * 100), 0) AS avg_score,
            MAX(submitted_at) AS last_attempt
     FROM quiz_attempts WHERE student_id = $1`,
    [req.user.id]
  );

  // Attendance rate
  const { rows: attStats } = await query(
    `SELECT COUNT(a.id) AS attended,
            COUNT(DISTINCT l.id) AS total_lessons
     FROM enrollments e
     JOIN lessons l ON l.course_id = e.course_id AND l.is_published = true
     LEFT JOIN attendance a ON a.lesson_id = l.id AND a.student_id = e.student_id
     WHERE e.student_id = $1 AND e.status = 'active'`,
    [req.user.id]
  );

  res.json({
    overall: {
      quizzes_taken: parseInt(overall[0].quizzes_taken),
      avg_score: Math.round(parseFloat(overall[0].avg_score)),
      last_attempt: overall[0].last_attempt,
    },
    topic_stats: topicStats.map((t) => ({
      topic: t.topic_tag || 'General',
      total: parseInt(t.total_questions),
      correct: parseInt(t.correct_count),
      accuracy: t.total_questions > 0
        ? Math.round((t.correct_count / t.total_questions) * 100)
        : 0,
    })),
    attendance: {
      attended: parseInt(attStats[0]?.attended || 0),
      total: parseInt(attStats[0]?.total_lessons || 0),
      rate: attStats[0]?.total_lessons > 0
        ? Math.round((attStats[0].attended / attStats[0].total_lessons) * 100)
        : 0,
    },
  });
};

// POST /api/admin/quizzes [admin]
const createQuiz = async (req, res) => {
  const schema = Joi.object({
    lesson_id: Joi.string().uuid().optional().allow(null),
    course_id: Joi.string().uuid().required(),
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    time_limit_min: Joi.number().integer().min(1).optional(),
    is_published: Joi.boolean().optional(),
    questions: Joi.array().items(Joi.object({
      question_text: Joi.string().required(),
      options: Joi.array().items(Joi.string()).length(4).required(),
      correct_index: Joi.number().integer().min(0).max(3).required(),
      explanation: Joi.string().optional().allow(''),
      topic_tag: Joi.string().max(60).optional(),
      sort_order: Joi.number().integer().optional(),
    })).min(1).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const client = await require('../config/db').getClient();
  try {
    await client.query('BEGIN');

    const { rows: quiz } = await client.query(
      `INSERT INTO quizzes (lesson_id, course_id, title, description, time_limit_min, is_published)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [value.lesson_id, value.course_id, value.title, value.description,
       value.time_limit_min, value.is_published ?? false]
    );

    for (let i = 0; i < value.questions.length; i++) {
      const q = value.questions[i];
      await client.query(
        `INSERT INTO quiz_questions
         (quiz_id, question_text, options, correct_index, explanation, topic_tag, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [quiz[0].id, q.question_text, JSON.stringify(q.options),
         q.correct_index, q.explanation, q.topic_tag, q.sort_order ?? i]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ quiz: quiz[0], questions_added: value.questions.length });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// GET /api/admin/quizzes [admin]
const listQuizzes = async (req, res) => {
  const { course_id } = req.query;
  const params = course_id ? [course_id] : [];
  const where = course_id ? 'WHERE q.course_id = $1' : '';

  const { rows } = await query(
    `SELECT q.*, c.title AS course_title,
            COUNT(qq.id) AS question_count,
            COUNT(DISTINCT qa.id) AS attempt_count
     FROM quizzes q
     LEFT JOIN courses c ON c.id = q.course_id
     LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
     LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
     ${where}
     GROUP BY q.id, c.title
     ORDER BY q.created_at DESC`,
    params
  );
  res.json({ quizzes: rows });
};

module.exports = { getQuiz, submitQuiz, getQuizResult, getProgress, createQuiz, listQuizzes };
