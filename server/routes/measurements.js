const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { linkCustomerUser } = require('../utils/customerLink');

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { customer, type, m } = req.body || {};
    if (!customer || !type) return res.status(400).json({ error: 'Customer and garment type are required' });
    const cust = await pool.query('SELECT id, phone FROM customers WHERE name = $1 LIMIT 1', [customer]);
    const custId = cust.rows[0]?.id || null;
    const phone = cust.rows[0]?.phone || null;
    const userId = await linkCustomerUser(phone);
    const q = await pool.query(
      `INSERT INTO measurements(customer_id, customer_user_id, customer_name, type, updated_date, m)
       VALUES ($1,$2,$3,$4,CURRENT_DATE,$5)
       RETURNING id, customer_name AS customer, type, updated_date AS updated, m`,
      [custId, userId, customer, type, JSON.stringify(m || {})]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save measurement' });
  }
});

module.exports = router;
