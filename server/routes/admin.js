const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// Clears transactional demo data only. Customers, materials, designs, shop
// settings and every login account are left untouched.
router.post('/reset-demo', auth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('TRUNCATE orders, measurements, feedback RESTART IDENTITY');
    res.json({ message: 'Orders, measurements and feedback cleared' });
  } catch (e) {
    res.status(500).json({ error: 'Could not reset demo data' });
  }
});

module.exports = router;
