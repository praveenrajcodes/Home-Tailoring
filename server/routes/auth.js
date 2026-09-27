const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { auth } = require('../middleware/auth');

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function findUserByIdentifier(role, identifier) {
  const clean = String(identifier || '').replace(/\D/g, '');
  const q = await pool.query(
    `SELECT * FROM users
     WHERE role = $1
       AND (LOWER(email) = LOWER($2) OR ($3 <> '' AND regexp_replace(phone,'\\D','','g') = $3))
     LIMIT 1`,
    [role, identifier, clean]
  );
  return q.rows[0] || null;
}

/* ---- Customer self-registration (Admin accounts can never be created here) ---- */
router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body || {};
  if (!name || !phone || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const exists = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR phone = $2', [email, phone]);
    if (exists.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'An account with this email or mobile number already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const u = await client.query(
      `INSERT INTO users(role,name,email,phone,password_hash) VALUES ('customer',$1,$2,$3,$4)
       RETURNING id, role, name, email, phone`,
      [name, email, phone, hash]
    );
    const newUserId = u.rows[0].id;
    const clean = phone.replace(/\D/g, '');

    // If Admin already has a CRM record for this phone (e.g. a walk-in order
    // taken before this person created an account), link it instead of
    // creating a duplicate customer.
    const existingCust = await client.query(
      `SELECT id FROM customers WHERE regexp_replace(phone,'\\D','','g') = $1 LIMIT 1`,
      [clean]
    );
    if (existingCust.rows.length) {
      await client.query('UPDATE customers SET user_id = $1, name = $2 WHERE id = $3', [newUserId, name, existingCust.rows[0].id]);
    } else {
      await client.query('INSERT INTO customers(user_id,name,phone) VALUES ($1,$2,$3)', [newUserId, name, phone]);
    }

    // Backfill any orders/measurements/feedback Admin already created for
    // this phone number before the customer signed up, so they see their
    // full history immediately after registering.
    await client.query(
      `UPDATE orders SET customer_user_id = $1 WHERE customer_user_id IS NULL AND regexp_replace(phone,'\\D','','g') = $2`,
      [newUserId, clean]
    );
    await client.query(
      `UPDATE measurements SET customer_user_id = $1
       WHERE customer_user_id IS NULL
         AND customer_id IN (SELECT id FROM customers WHERE regexp_replace(phone,'\\D','','g') = $2)`,
      [newUserId, clean]
    );

    await client.query('COMMIT');
    res.json({ message: 'Account created', user: u.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Registration failed, please try again' });
  } finally {
    client.release();
  }
});

/* ---- Login (role is required so an admin email and a customer phone never collide) ---- */
router.post('/login', async (req, res) => {
  const { role, identifier, password } = req.body || {};
  if (!role || !identifier || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = await findUserByIdentifier(role, identifier);
  if (!user) return res.status(401).json({ error: 'Incorrect email/phone or password' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Incorrect email/phone or password' });
  res.json({
    token: sign(user),
    user: { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone, title: user.title },
  });
});

/* ---- Current user profile ---- */
router.get('/me', auth, async (req, res) => {
  const q = await pool.query('SELECT id, role, name, email, phone, title FROM users WHERE id = $1', [req.user.id]);
  if (!q.rows.length) return res.status(404).json({ error: 'Account not found' });
  res.json(q.rows[0]);
});

router.put('/me', auth, async (req, res) => {
  const { name, phone, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const q = await pool.query(
      'UPDATE users SET name = $1, phone = $2, email = $3 WHERE id = $4 RETURNING id, role, name, email, phone',
      [name, phone, email, req.user.id]
    );
    // Keep denormalized name/phone in sync everywhere this customer's data lives.
    await pool.query('UPDATE customers SET name = $1, phone = $2 WHERE user_id = $3', [name, phone, req.user.id]);
    await pool.query('UPDATE orders SET name = $1, phone = $2 WHERE customer_user_id = $3', [name, phone, req.user.id]);
    await pool.query('UPDATE measurements SET customer_name = $1 WHERE customer_user_id = $2', [name, req.user.id]);
    await pool.query('UPDATE feedback SET customer_name = $1 WHERE customer_user_id = $2', [name, req.user.id]);
    res.json(q.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Could not update profile (email may already be in use)' });
  }
});

router.put('/me/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: 'New password must be at least 4 characters' });
  const q = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!q.rows.length) return res.status(404).json({ error: 'Account not found' });
  const ok = await bcrypt.compare(currentPassword || '', q.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
  res.json({ message: 'Password updated' });
});

/* ---- Forgot password — simulated OTP (no SMS/email provider connected) ----
   The OTP is generated and returned directly in the API response so the
   prototype works end-to-end without a paid SMS/email gateway. Before real
   production use, replace this with a provider (Twilio, SES, etc.) and stop
   returning `otp` in the response body. */
router.post('/forgot/send-otp', async (req, res) => {
  const { role, identifier } = req.body || {};
  if (!role || !identifier) return res.status(400).json({ error: 'Missing details' });
  const user = await findUserByIdentifier(role, identifier);
  if (!user) return res.status(404).json({ error: 'No account found with these details' });
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query('INSERT INTO password_resets(user_id, otp_code, expires_at) VALUES ($1,$2,$3)', [user.id, otp, expiresAt]);
  res.json({ message: 'OTP generated', otp, demoNotice: 'No SMS/email provider connected — showing the OTP directly for this demo.' });
});

router.post('/forgot/verify-otp', async (req, res) => {
  const { role, identifier, otp } = req.body || {};
  const user = await findUserByIdentifier(role, identifier);
  if (!user) return res.status(404).json({ error: 'Account not found' });
  const r = await pool.query(
    `SELECT * FROM password_resets WHERE user_id = $1 AND otp_code = $2 AND used = false AND expires_at > now()
     ORDER BY id DESC LIMIT 1`,
    [user.id, otp]
  );
  if (!r.rows.length) return res.status(400).json({ error: 'Incorrect or expired OTP' });
  await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [r.rows[0].id]);
  const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });
  res.json({ resetToken });
});

router.post('/forgot/reset', async (req, res) => {
  const { resetToken, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Reset session expired, please start again' });
  }
  if (payload.purpose !== 'reset') return res.status(401).json({ error: 'Invalid reset session' });
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, payload.id]);
  res.json({ message: 'Password reset successful' });
});

module.exports = router;
