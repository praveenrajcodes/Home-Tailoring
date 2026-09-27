const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.put('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const entries = Object.entries(req.body || {});
    for (const [key, value] of entries) {
      await pool.query(
        'INSERT INTO settings(key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, String(value ?? '')]
      );
    }
    res.json({ message: 'Settings saved' });
  } catch (e) {
    res.status(500).json({ error: 'Could not save settings' });
  }
});

module.exports = router;
