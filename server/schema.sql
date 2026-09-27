-- StitchCraft Home Tailoring — database schema
-- Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','customer')),
  title VARCHAR(50) DEFAULT 'Admin',
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  customer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(150),
  phone VARCHAR(30),
  garment VARCHAR(150),
  type VARCHAR(50),
  delivery_date DATE,
  status VARCHAR(30) DEFAULT 'Pending',
  amount NUMERIC(10,2) DEFAULT 0,
  paid NUMERIC(10,2) DEFAULT 0,
  chest VARCHAR(20),
  waist VARCHAR(20),
  length VARCHAR(20),
  notes TEXT,
  design_image TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  customer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(150),
  type VARCHAR(50),
  updated_date DATE DEFAULT CURRENT_DATE,
  m JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  unit VARCHAR(30) DEFAULT 'units',
  stock NUMERIC(10,2) DEFAULT 0,
  reorder NUMERIC(10,2) DEFAULT 5,
  icon VARCHAR(10) DEFAULT '📦'
);

CREATE TABLE IF NOT EXISTS designs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(150),
  icon VARCHAR(10) DEFAULT '✨',
  image TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  customer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(150),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO settings (key, value) VALUES ('shopName','StitchCraft Studio') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('shopPhone','+91 98765 43210') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('shopAddress','Chennai, Tamil Nadu') ON CONFLICT (key) DO NOTHING;
