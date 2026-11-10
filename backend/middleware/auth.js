const jwt = require('jsonwebtoken');

// Requires a valid JWT. Sets req.user = { id, role }.
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Login required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Restricts a route to one role.
const requireRole = (role) => (req, res, next) =>
  req.user && req.user.role === role
    ? next()
    : res.status(403).json({ message: `${role} access only` });

module.exports = { auth, requireRole };
