const { Pool, types } = require('pg');

// Postgres returns NUMERIC columns as strings by default (to avoid float
// rounding surprises). This app treats money fields as plain JS numbers,
// so we parse NUMERIC (OID 1700) to float globally.
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const useSSL = process.env.DB_SSL !== 'false'; // default true (needed for Render Postgres)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});

module.exports = pool;
