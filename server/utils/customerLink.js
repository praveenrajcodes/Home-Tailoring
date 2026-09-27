const pool = require('../db');

// If a customer has self-registered with this phone number, return their
// user id so orders/measurements/feedback created by Admin can still be
// securely filtered to that customer's own portal.
async function linkCustomerUser(phone) {
  if (!phone) return null;
  const clean = String(phone).replace(/\D/g, '');
  if (!clean) return null;
  const q = await pool.query(
    `SELECT id FROM users WHERE role='customer' AND regexp_replace(phone,'\\D','','g') = $1 LIMIT 1`,
    [clean]
  );
  return q.rows[0] ? q.rows[0].id : null;
}

async function findOrCreateCustomer(name, phone, userId) {
  const existing = await pool.query('SELECT id FROM customers WHERE name = $1 LIMIT 1', [name]);
  if (existing.rows.length) return existing.rows[0].id;
  const created = await pool.query(
    'INSERT INTO customers(user_id,name,phone) VALUES ($1,$2,$3) RETURNING id',
    [userId, name, phone]
  );
  return created.rows[0].id;
}

module.exports = { linkCustomerUser, findOrCreateCustomer };
