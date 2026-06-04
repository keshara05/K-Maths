const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { query } = require('../config/db');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');

// ── Validation schemas ────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[\d\s\+\-\(\)]{7,20}$/).optional(),
  password: Joi.string().min(8).required(),
  grade: Joi.number().integer().min(6).max(13).optional(),
  school: Joi.string().max(200).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const REFRESH_EXPIRY_DAYS = 7;

const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRY_DAYS);
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
};

const buildTokens = (user) => {
  const payload = { sub: user.id, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const safeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
};

// ── Controllers ───────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { full_name, email, phone, password, grade, school } = value;

  // Check duplicate email
  const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing[0]) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = await bcrypt.hash(password, 10);

  const { rows } = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, grade, school)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, phone, role, grade, school, created_at`,
    [full_name, email, phone || null, password_hash, grade || null, school || null]
  );

  const user = rows[0];
  const { accessToken, refreshToken } = buildTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  res.status(201).json({ user: safeUser(user), accessToken, refreshToken });
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = value;

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.is_active) {
    return res.status(403).json({ error: 'Account suspended. Contact admin.' });
  }

  const { accessToken, refreshToken } = buildTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  res.json({ user: safeUser(user), accessToken, refreshToken });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Validate token exists and not expired in DB
  const { rows } = await query(
    `SELECT rt.*, u.role, u.is_active FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = $1 AND rt.expires_at > NOW()`,
    [refreshToken]
  );
  if (!rows[0] || !rows[0].is_active) {
    return res.status(401).json({ error: 'Refresh token expired or revoked' });
  }

  // Rotate: delete old, issue new
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

  const payload = { sub: decoded.sub, role: rows[0].role };
  const newAccess = generateAccessToken(payload);
  const newRefresh = generateRefreshToken(payload);
  await storeRefreshToken(decoded.sub, newRefresh);

  res.json({ accessToken: newAccess, refreshToken: newRefresh });
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  const { rows } = await query(
    `SELECT id, full_name, email, phone, role, avatar_url, grade, school, is_active, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json({ user: rows[0] });
};

const updateMe = async (req, res) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(120).optional(),
    phone: Joi.string().optional(),
    grade: Joi.number().integer().min(6).max(13).optional(),
    school: Joi.string().max(200).optional(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const fields = Object.keys(value);
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = [req.user.id, ...fields.map((f) => value[f])];

  const { rows } = await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1
     RETURNING id, full_name, email, phone, role, avatar_url, grade, school`,
    values
  );
  res.json({ user: rows[0] });
};

module.exports = { register, login, refresh, logout, getMe, updateMe };
