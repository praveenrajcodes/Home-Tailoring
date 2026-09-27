require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✔ Schema created / already up to date.');
  await pool.end();
  process.exit(0);
})().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
