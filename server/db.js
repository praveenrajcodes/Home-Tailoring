const { Pool, types } = require('pg');

// Postgres returns NUMERIC columns as strings by default (to avoid float
// rounding surprises). This app treats money fields as plain JS numbers,
// so we parse NUMERIC (OID 1700) to float globally.
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

// By default node-postgres parses DATE columns (OID 1082) into JS Date
// objects. Once Express serializes those to JSON, they turn into full
// ISO timestamps (e.g. "2026-09-26T18:30:00.000Z") instead of the plain
// "YYYY-MM-DD" string this app's frontend expects for delivery dates,
// created dates, joined dates, etc. Keep the raw "YYYY-MM-DD" string
// Postgres sends on the wire instead of letting pg convert it.
types.setTypeParser(1082, (val) => val);

const useSSL = process.env.DB_SSL !== 'false'; // default true (needed for Render Postgres)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});

module.exports = pool;
