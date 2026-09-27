const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('admin'), async (req, res) => {
  const q = await pool.query(`SELECT id, name, email, title AS role FROM users WHERE role = 'admin' ORDER BY id`);
  res.json(q.rows);
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, role, password } = req.body || {};
    if (!name || !email || !password || password.length < 4) {
      return res.status(400).json({ error: 'Name, email and a password of at least 4 characters are required' });
    }
    const exists = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'An account with this email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const q = await pool.query(
      `INSERT INTO users(role, title, name, email, password_hash) VALUES ('admin', $1, $2, $3, $4)
       RETURNING id, name, email, title AS role`,
      [role || 'Admin', name, email, hash]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create staff account' });
  }
});

module.exports = router;
