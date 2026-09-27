const router = require('express').Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { linkCustomerUser, findOrCreateCustomer } = require('../utils/customerLink');

const ORDER_COLS = `id, name, phone, garment, type, delivery_date AS delivery, status, amount, paid,
  chest, waist, length, notes, design_image AS "designImage", created_date AS created,
  customer_id AS "customerId", customer_user_id AS "customerUserId"`;

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.garment) return res.status(400).json({ error: 'Customer name and garment are required' });
    const customerUserId = await linkCustomerUser(b.phone);
    const customerId = await findOrCreateCustomer(b.name, b.phone, customerUserId);
    const q = await pool.query(
      `INSERT INTO orders(customer_id, customer_user_id, name, phone, garment, type, delivery_date, status, amount, paid, chest, waist, length, notes, design_image, created_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, CURRENT_DATE)
       RETURNING ${ORDER_COLS}`,
      [customerId, customerUserId, b.name, b.phone, b.garment, b.type, b.delivery || null, b.status || 'Pending',
        b.amount || 0, b.paid || 0, b.chest || 'N/A', b.waist || 'N/A', b.length || 'N/A', b.notes || '', b.designImage || null]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create order' });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const b = req.body || {};
    const customerUserId = await linkCustomerUser(b.phone);
    const q = await pool.query(
      `UPDATE orders SET name=$1, phone=$2, garment=$3, type=$4, delivery_date=$5, status=$6, amount=$7, paid=$8,
         chest=$9, waist=$10, length=$11, notes=$12, design_image=$13, customer_user_id=$14
       WHERE id = $15
       RETURNING ${ORDER_COLS}`,
      [b.name, b.phone, b.garment, b.type, b.delivery || null, b.status, b.amount || 0, b.paid || 0,
        b.chest || 'N/A', b.waist || 'N/A', b.length || 'N/A', b.notes || '', b.designImage || null, customerUserId, req.params.id]
    );
    if (!q.rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not update order' });
  }
});

router.patch('/:id/payment', auth, requireRole('admin'), async (req, res) => {
  try {
    const amount = Number(req.body?.amount || 0);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Enter a valid payment amount' });
    const cur = await pool.query('SELECT amount, paid FROM orders WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Order not found' });
    const newPaid = Math.min(cur.rows[0].amount, cur.rows[0].paid + amount);
    const q = await pool.query(`UPDATE orders SET paid = $1 WHERE id = $2 RETURNING ${ORDER_COLS}`, [newPaid, req.params.id]);
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not record payment' });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ message: 'deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Could not delete order' });
  }
});

module.exports = router;
