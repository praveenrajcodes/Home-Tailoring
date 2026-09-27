const router = require('express').Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const q = await pool.query('SELECT id, customer_name AS customer, rating, comment, created_date AS date FROM feedback ORDER BY id DESC');
      return res.json(q.rows);
    }
    const q = await pool.query(
      'SELECT id, customer_name AS customer, rating, comment, created_date AS date FROM feedback WHERE customer_user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );
    res.json(q.rows);
  } catch (e) {
    res.status(500).json({ error: 'Could not load feedback' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    const q = await pool.query(
      `INSERT INTO feedback(customer_user_id, customer_name, rating, comment)
       VALUES ($1,$2,$3,$4)
       RETURNING id, customer_name AS customer, rating, comment, created_date AS date`,
      [req.user.id, req.user.name, rating, comment || '']
    );
    res.json(q.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Could not submit feedback' });
  }
});

module.exports = router;
