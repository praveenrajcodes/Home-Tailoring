# StitchCraft Home Tailoring — Hosted Edition (v4)

A real, database-backed version of the Home Tailoring Management System:
**Node.js + Express** API, **PostgreSQL** database, and **JWT + bcrypt**
authentication, serving the same dashboard/customer-portal frontend you
already have. No more LocalStorage — every order, measurement, payment,
login and design lives in a real, hosted database.

```
├── public/            the frontend (unchanged UI: index.html, style.css, script.js)
├── server/            Express API + PostgreSQL access
│   ├── index.js        app entry point
│   ├── db.js           Postgres connection pool
│   ├── schema.sql       full database schema (idempotent — safe to re-run)
│   ├── migrate.js      runs schema.sql against DATABASE_URL
│   ├── seed.js         inserts demo admin/customer/orders (safe to re-run, skips if data exists)
│   ├── middleware/auth.js
│   ├── utils/customerLink.js
│   └── routes/         one file per resource (auth, orders, customers, measurements,
│                        materials, designs, feedback, staff, settings, admin)
├── render.yaml         one-click Render.com Blueprint (web service + Postgres)
├── .env.example        environment variables template
└── package.json
```

## What changed from the LocalStorage prototype

- **Real database** — PostgreSQL tables for users, customers, orders, measurements,
  materials, designs, feedback, settings, and password-reset OTPs. See `server/schema.sql`.
- **Real authentication** — passwords are hashed with bcrypt (never stored in
  plain text), and sessions are signed JWTs (7-day expiry). "Remember me" keeps
  you signed in across browser restarts; unchecked, the session ends when the tab closes.
- **Server-enforced security** — a customer's API calls only ever return *their own*
  orders, measurements and feedback (enforced in the database queries, not just
  hidden in the UI). Only an existing Admin can create another Admin/Staff account —
  there is no code path anywhere that lets a customer become an Admin.
- **Design photos** are stored as base64 in the `orders.design_image` /
  `designs.image` columns, so no separate file storage/S3 setup is needed.
- **Forgot password** still uses a *simulated* OTP (no SMS/email account is
  wired up) — the OTP is generated server-side and returned directly in the API
  response so you can test the full flow. Before real production use, swap this
  for a provider like Twilio or Amazon SES (see `server/routes/auth.js`).

The frontend (`public/`) is the exact same UI as before. Only how it loads and
saves data changed — it now calls the API in `server/routes/` instead of
reading/writing LocalStorage.

## Run it locally

Requirements: Node 18+, a PostgreSQL database (local or hosted).

```bash
npm install
cp .env.example .env        # then edit .env with your local DATABASE_URL
npm run migrate             # creates the tables
npm run seed                # optional: adds demo admin/customer/orders
npm start                   # http://localhost:4000
```

Demo logins after seeding:
- **Admin:** `admin@stitchcraft.local` / `admin123`
- **Customer:** `9876511111` / `customer123`

## Deploy to Render.com (free tier)

1. **Push this project to a GitHub repository.** (Render deploys from Git.)
2. On [render.com](https://render.com), click **New → Blueprint**, connect your
   repo, and Render will read `render.yaml` and create both pieces for you:
   - a **free PostgreSQL database** (`stitchcraft-db`)
   - a **free web service** (`stitchcraft-app`) with `DATABASE_URL` and a
     random `JWT_SECRET` already wired in as environment variables
3. Click **Apply**. Render will run `npm install && npm run migrate` (creating
   the tables), then start the app with `npm start`.
4. Once it's live, open the **Shell** tab on the `stitchcraft-app` service and
   run one command to load demo data (optional, but recommended so you have
   something to click around):
   ```
   npm run seed
   ```
5. Visit the URL Render gives you (looks like `https://stitchcraft-app.onrender.com`).
   Log in with the demo admin/customer credentials above, or register a new
   customer account from the login screen.

### Important free-tier limits to know about (from Render's own docs, checked Sept 2026)

- **Free Postgres expires 30 days after creation**, with a 14-day grace period
  to upgrade before the data is deleted. This is fine for a demo/prototype, but
  **before that window closes, upgrade the database to a paid plan** (Render
  → your database → "Upgrade") if you want to keep the data. Paid plans start
  around $7–8/month and remove the expiry.
- **Free web services spin down after 15 minutes of inactivity** and take
  about a minute to wake back up on the next request — the first login after
  a quiet period will feel slow; that's normal on Render's free plan, not a bug.
- Render grants **750 free instance-hours per workspace per month**, which
  comfortably covers one always-warm-ish small app.
- If you'd rather avoid the 30-day database expiry altogether, you can point
  `DATABASE_URL` at any other PostgreSQL host instead (e.g. Neon or Supabase,
  which both offer a persistent free Postgres tier) — the app doesn't care
  where the database lives, only that `DATABASE_URL` and `DB_SSL` are set correctly.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string. Render sets this automatically via the Blueprint. |
| `DB_SSL` | no | Set to `false` for a local Postgres without SSL. Leave unset (defaults to on) for Render/any hosted Postgres. |
| `JWT_SECRET` | yes | Long random string signing login sessions. Render's Blueprint generates one for you. For local dev, generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `PORT` | no | Defaults to 4000 locally; Render sets this automatically. |

## Database schema at a glance

- `users` — every login (role `admin` or `customer`), bcrypt password hash.
  New Admins can **only** be created by an existing Admin (`POST /api/staff`,
  which requires an admin JWT) — there is no public registration path for the
  Admin role.
- `customers` — the CRM/customer directory Admin manages, optionally linked to
  a `users` row if that person has an account.
- `orders`, `measurements`, `feedback` — each carries a `customer_user_id` so
  the API can filter a customer's own portal pages at the database level, not
  just hide them in the UI.
- `materials`, `designs`, `settings` — shop-wide data, Admin-only to write.
- `password_resets` — short-lived OTP codes for the forgot-password flow.

If Admin creates an order/measurement for a customer by phone number *before*
that customer has registered (a walk-in), and the customer later signs up
with the same phone number, their existing history is automatically linked
to their new account (see `server/routes/auth.js` → `/register`).

## API overview

All endpoints are under `/api`. Except `/api/auth/register`, `/api/auth/login`
and the `/api/auth/forgot/*` steps, every route requires a `Bearer <token>`
Authorization header (the frontend handles this automatically after login).

| Method & path | Who | What |
|---|---|---|
| POST `/api/auth/register` | anyone | Customer self-registration |
| POST `/api/auth/login` | anyone | Returns a JWT + user profile |
| GET/PUT `/api/auth/me` | logged in | View/update your own profile |
| PUT `/api/auth/me/password` | logged in | Change your own password |
| POST `/api/auth/forgot/send-otp` → `/verify-otp` → `/reset` | anyone | Simulated OTP password reset |
| GET `/api/state` | logged in | Bootstrap: customers, orders, measurements, materials, designs, settings — filtered to your own data if you're a customer |
| POST/PUT/PATCH/DELETE `/api/orders...` | Admin | Order CRUD + recording payments |
| POST `/api/customers` | Admin | Add a CRM customer record |
| POST `/api/measurements` | Admin | Save a measurement record |
| POST `/api/materials` | Admin | Add inventory |
| POST `/api/designs` | Admin | Upload a design to the gallery |
| GET/POST `/api/feedback` | logged in | View (own/all) or submit feedback |
| GET/POST `/api/staff` | Admin | List/add Admin & Staff accounts |
| PUT `/api/settings` | Admin | Shop name/phone/address |
| POST `/api/admin/reset-demo` | Admin | Clears orders/measurements/feedback only |

## Before you use this for a real business

This is a solid, real foundation, but a few things are worth doing before it
handles real customer data at scale:
- Wire up a real SMS/email provider for the forgot-password OTP instead of
  returning it in the API response.
- Add rate-limiting to the login and OTP endpoints (e.g. `express-rate-limit`)
  to slow down brute-force attempts.
- Upgrade the free Postgres plan before the 30-day expiry if this becomes your
  real database of record, and turn on Render's automated backups (available
  on paid plans).
- Consider moving design-image storage to object storage (e.g. S3 / Render
  Disks) once photos get large or numerous — base64-in-Postgres is simple and
  works well at prototype scale, but isn't the most storage-efficient approach
  long-term.
