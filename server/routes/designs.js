const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, category, icon, image } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Design name is required' });
    const q = await pool.query(
      'INSERT INTO designs(name, category, icon, image) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, category || 'Custom · New', icon || '✨', image || null]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save design (image may be too large)' });
  }
});

module.exports = router;
