const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, unit, stock, reorder, icon } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Material name is required' });
    const q = await pool.query(
      'INSERT INTO materials(name, unit, stock, reorder, icon) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, unit || 'units', stock || 0, reorder || 5, icon || '📦']
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not add material' });
  }
});

module.exports = router;
