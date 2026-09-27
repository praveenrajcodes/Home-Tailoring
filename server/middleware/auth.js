const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose) return res.status(401).json({ error: 'Invalid session token' }); // reject reset tokens here
    req.user = payload; // { id, role, name, email }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { auth, requireRole };
