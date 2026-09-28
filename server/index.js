require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ---- Live updates (Socket.IO) ----
// The server only broadcasts a tiny "something changed" signal. Each client then
// re-fetches /api/state, which is authenticated and role-filtered, so no data
// leaks through the socket.
const io = new Server(server, { cors: { origin: '*' } });
io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth && socket.handshake.auth.token, process.env.JWT_SECRET);
    if (payload.purpose) return next(new Error('unauthorized'));
    socket.user = payload;
    next();
  } catch (e) {
    next(new Error('unauthorized'));
  }
});

if (!process.env.JWT_SECRET) {
  console.warn('⚠ JWT_SECRET is not set. Set it in your environment before deploying — see .env.example.');
}

app.use(cors());
app.use(express.json({ limit: '8mb' })); // generous limit: design photos are stored as base64

// After any successful write to the API (data now saved in Neon), tell every
// connected client to refresh.
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    res.on('finish', () => {
      if (res.statusCode < 400) io.emit('data-changed');
    });
  }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/state', require('./routes/state'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/admin', require('./routes/admin'));

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Centralized error handler (keeps stack traces out of API responses)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`StitchCraft server running on port ${port}`));
