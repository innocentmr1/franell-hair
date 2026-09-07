const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// For routes that support both guest and logged-in access (e.g. checkout) —
// attaches req.user when a valid token is present, but never rejects the
// request for having none.
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    // Invalid/expired token on an optional-auth route — proceed as a guest
    // rather than rejecting, since auth isn't required here.
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, optionalAuth, admin };
