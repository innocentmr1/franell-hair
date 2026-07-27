const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');
const { welcomeEmail, passwordResetEmail } = require('../utils/emailTemplates');

// Login attempts against admin accounts are logged directly (not via
// logAdminAction, since there's no req.user yet at this point).
const logAdminLoginAttempt = (user, action) => {
  if (!user.isAdmin) return;
  AuditLog.create({ admin: user._id, adminName: user.name, action, target: user.email })
    .catch((err) => console.error('Audit log write failed:', err.message));
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Min 8 chars, at least one uppercase, one lowercase, one digit.
const isStrongPassword = (pw) =>
  typeof pw === 'string' && pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string')
    return res.status(400).json({ message: 'Invalid input' });
  if (!isStrongPassword(password))
    return res.status(400).json({ message: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.' });
  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password });

  const { subject, html } = welcomeEmail(user);
  sendEmail({ to: user.email, subject, html });

  res.status(201).json(formatUser(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string')
    return res.status(401).json({ message: 'Invalid email or password' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({ message: `Account temporarily locked due to repeated failed logins. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` });
  }

  const matches = await user.matchPassword(password);
  if (!matches) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      user.failedLoginAttempts = 0;
      logAdminLoginAttempt(user, 'admin.accountLocked');
    } else {
      logAdminLoginAttempt(user, 'admin.loginFailed');
    }
    await user.save();
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }
  logAdminLoginAttempt(user, 'admin.loginSuccess');

  res.json(formatUser(user));
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericResponse = { message: 'If that email is registered, a password reset link has been sent.' };
  if (typeof email !== 'string') return res.json(genericResponse);

  const user = await User.findOne({ email });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `https://www.franellhair.com/reset-password/${rawToken}`;
    const { subject, html } = passwordResetEmail(user, resetUrl);
    sendEmail({ to: user.email, subject, html });
  }
  // Same response whether or not the email exists, so this can't be used to
  // enumerate registered accounts.
  res.json(genericResponse);
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (typeof token !== 'string' || !isStrongPassword(password))
    return res.status(400).json({ message: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.' });

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  res.json(formatUser(user));
};

const getProfile = async (req, res) => {
  res.json(formatUser(req.user));
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  if (req.body.phone !== undefined)           user.phone           = req.body.phone;
  if (req.body.password) {
    if (!isStrongPassword(req.body.password))
      return res.status(400).json({ message: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.' });
    user.password = req.body.password;
  }
  if (req.body.shippingAddress)               user.shippingAddress = req.body.shippingAddress;
  if (req.body.preferences !== undefined)     user.preferences     = req.body.preferences;
  const updated = await user.save();
  res.json(formatUser(updated));
};

function formatUser(u) {
  return {
    _id: u._id, name: u.name, email: u.email,
    isAdmin: u.isAdmin, phone: u.phone || '',
    shippingAddress: u.shippingAddress || {},
    preferences: u.preferences || { newsletter: false, orderUpdates: true },
    createdAt: u.createdAt,
    token: generateToken(u._id),
  };
}

module.exports = { register, login, forgotPassword, resetPassword, getProfile, updateProfile };
