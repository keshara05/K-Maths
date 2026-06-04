const Joi = require('joi');
const { query } = require('../config/db');

// POST /api/payments/initiate
const initiatePayment = async (req, res) => {
  const { error, value } = Joi.object({
    enrollment_id: Joi.string().uuid().required(),
    month_year: Joi.string().pattern(/^\d{4}-\d{2}-01$/).required(), // e.g. "2024-01-01"
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Verify enrollment belongs to this student
  const { rows: enroll } = await query(
    `SELECT e.id, e.course_id, c.monthly_fee, c.title
     FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE e.id = $1 AND e.student_id = $2 AND e.status = 'active'`,
    [value.enrollment_id, req.user.id]
  );
  if (!enroll[0]) return res.status(404).json({ error: 'Active enrollment not found' });

  // Check if payment already exists for this month
  const { rows: existing } = await query(
    `SELECT id, status FROM payments
     WHERE enrollment_id = $1 AND month_year = $2`,
    [value.enrollment_id, value.month_year]
  );
  if (existing[0]?.status === 'paid') {
    return res.status(409).json({ error: 'Payment already made for this month' });
  }

  // Create pending payment record
  const { rows } = await query(
    `INSERT INTO payments (enrollment_id, amount, month_year, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT DO NOTHING RETURNING *`,
    [value.enrollment_id, enroll[0].monthly_fee, value.month_year]
  );

  // In production: initiate Stripe/PayHere session here and return checkout URL
  res.status(201).json({
    payment: rows[0] || existing[0],
    amount: enroll[0].monthly_fee,
    course: enroll[0].title,
    // checkout_url: 'https://checkout.stripe.com/...'  ← add when integrating gateway
    message: 'Payment record created. Integrate payment gateway to proceed.',
  });
};

// POST /api/payments/webhook - called by Stripe/PayHere
const handleWebhook = async (req, res) => {
  // TODO: Verify webhook signature from payment gateway
  const { payment_id, status, gateway_ref } = req.body;

  if (!payment_id || !status) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const mappedStatus = status === 'SUCCESS' || status === 'succeeded' ? 'paid' : 'failed';

  const { rows } = await query(
    `UPDATE payments SET status = $1, gateway_ref = $2,
     paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE NULL END
     WHERE id = $3 RETURNING *`,
    [mappedStatus, gateway_ref || null, payment_id]
  );

  if (!rows[0]) return res.status(404).json({ error: 'Payment not found' });

  // TODO: Generate PDF receipt and send email on success
  res.json({ received: true });
};

// GET /api/payments/history
const getPaymentHistory = async (req, res) => {
  const { rows } = await query(
    `SELECT p.*, c.title AS course_title
     FROM payments p
     JOIN enrollments e ON e.id = p.enrollment_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = $1
     ORDER BY p.month_year DESC`,
    [req.user.id]
  );
  res.json({ payments: rows });
};

// GET /api/admin/payments [admin]
const getAllPayments = async (req, res) => {
  const { status, month_year, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (status) { params.push(status); conditions.push(`p.status = $${params.length}`); }
  if (month_year) { params.push(month_year); conditions.push(`p.month_year = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT p.*, u.full_name AS student_name, u.email, c.title AS course_title
     FROM payments p
     JOIN enrollments e ON e.id = p.enrollment_id
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ payments: rows, page: +page, limit: +limit });
};

// GET /api/payments/summary [admin] - monthly revenue
const getRevenueSummary = async (req, res) => {
  const { rows } = await query(
    `SELECT DATE_TRUNC('month', month_year) AS month,
            SUM(amount) AS total_revenue,
            COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending_count
     FROM payments
     GROUP BY DATE_TRUNC('month', month_year)
     ORDER BY month DESC
     LIMIT 12`
  );
  res.json({ summary: rows });
};

module.exports = {
  initiatePayment, handleWebhook, getPaymentHistory,
  getAllPayments, getRevenueSummary,
};
