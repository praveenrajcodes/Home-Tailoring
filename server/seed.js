require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

(async () => {
  const existing = await pool.query('SELECT COUNT(*)::int AS n FROM orders');
  if (existing.rows[0].n > 0) {
    console.log('Demo data already present (orders table is not empty) — skipping seed.');
    console.log('Delete rows manually or use a fresh database if you want to reseed.');
    await pool.end();
    process.exit(0);
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  const custHash = await bcrypt.hash('customer123', 10);

  await pool.query(
    `INSERT INTO users(role,title,name,email,password_hash)
     VALUES ('admin','Admin','Administrator','admin@stitchcraft.local',$1)
     ON CONFLICT (email) DO NOTHING`,
    [adminHash]
  );

  await pool.query(
    `INSERT INTO users(role,name,email,phone,password_hash)
     VALUES ('customer','Priya Kumar','priya@example.com','9876511111',$1)
     ON CONFLICT (email) DO NOTHING`,
    [custHash]
  );

  const custUser = await pool.query(`SELECT id FROM users WHERE email='priya@example.com'`);
  const custUserId = custUser.rows[0].id;

  const custRec = await pool.query(
    `INSERT INTO customers(user_id,name,phone) VALUES ($1,'Priya Kumar','9876511111') RETURNING id`,
    [custUserId]
  );
  const custId = custRec.rows[0].id;

  await pool.query(
    `INSERT INTO orders(customer_id,customer_user_id,name,phone,garment,type,delivery_date,status,amount,paid,chest,waist,length,created_date)
     VALUES ($1,$2,'Priya Kumar','9876511111','Bridal Blouse','Blouse',CURRENT_DATE + 2,'In Progress',1800,800,'34','28','14',CURRENT_DATE - 2)`,
    [custId, custUserId]
  );

  await pool.query(
    `INSERT INTO measurements(customer_id,customer_user_id,customer_name,type,updated_date,m)
     VALUES ($1,$2,'Priya Kumar','Blouse',CURRENT_DATE,$3)`,
    [custId, custUserId, JSON.stringify({ Bust: '34"', Waist: '28"', Shoulder: '14"', Sleeve: '10"', Length: '14"', Armhole: '15"' })]
  );

  await pool.query(`INSERT INTO materials(name,unit,stock,reorder,icon) VALUES ('Silk Fabric','meters',24,10,'🧶')`);
  await pool.query(`INSERT INTO materials(name,unit,stock,reorder,icon) VALUES ('Cotton Lining','meters',8,10,'🪡')`);
  await pool.query(`INSERT INTO materials(name,unit,stock,reorder,icon) VALUES ('Embroidery Thread','spools',42,15,'🧵')`);

  await pool.query(`INSERT INTO designs(name,category,icon) VALUES ('Bridal Zari Blouse','Wedding · Traditional','👰')`);
  await pool.query(`INSERT INTO designs(name,category,icon) VALUES ('Classic Silk Blouse','Festive · Elegant','👗')`);
  await pool.query(`INSERT INTO designs(name,category,icon) VALUES ('Minimal Office Kurti','Office · Modern','🥻')`);

  console.log('✔ Seed complete.');
  console.log('  Demo admin:    admin@stitchcraft.local / admin123');
  console.log('  Demo customer: 9876511111 / customer123');
  await pool.end();
  process.exit(0);
})().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
