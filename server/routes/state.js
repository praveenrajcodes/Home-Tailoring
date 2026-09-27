const router = require('express').Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

const ORDER_COLS = `id, name, phone, garment, type, delivery_date AS delivery, status, amount, paid,
  chest, waist, length, notes, design_image AS "designImage", created_date AS created,
  customer_id AS "customerId", customer_user_id AS "customerUserId"`;

const MEASUREMENT_COLS = `id, customer_name AS customer, type, updated_date AS updated, m`;

router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    const customers = isAdmin
      ? (await pool.query('SELECT id, name, phone, joined_date AS joined FROM customers ORDER BY id')).rows
      : [];

    const orders = isAdmin
      ? (await pool.query(`SELECT ${ORDER_COLS} FROM orders ORDER BY id DESC`)).rows
      : (await pool.query(`SELECT ${ORDER_COLS} FROM orders WHERE customer_user_id = $1 ORDER BY id DESC`, [req.user.id])).rows;

    const measurements = isAdmin
      ? (await pool.query(`SELECT ${MEASUREMENT_COLS} FROM measurements ORDER BY id DESC`)).rows
      : (await pool.query(`SELECT ${MEASUREMENT_COLS} FROM measurements WHERE customer_user_id = $1 ORDER BY id DESC`, [req.user.id])).rows;

    const materials = (await pool.query('SELECT id, name, unit, stock, reorder, icon FROM materials ORDER BY id')).rows;
    const designs = (await pool.query('SELECT id, name, category, icon, image FROM designs ORDER BY id')).rows;

    const settingsRows = (await pool.query('SELECT key, value FROM settings')).rows;
    const settings = {};
    settingsRows.forEach((r) => { settings[r.key] = r.value; });

    res.json({ customers, orders, measurements, materials, designs, settings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load data' });
  }
});

module.exports = router;
