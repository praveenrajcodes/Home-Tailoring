const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { linkCustomerUser } = require('../utils/customerLink');

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, phone } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const userId = await linkCustomerUser(phone);
    const q = await pool.query(
      'INSERT INTO customers(user_id, name, phone) VALUES ($1,$2,$3) RETURNING id, name, phone, joined_date AS joined',
      [userId, name, phone || '']
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not add customer' });
  }
});

module.exports = router;
