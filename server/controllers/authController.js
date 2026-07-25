const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { welcomeEmail } = require('../utils/emailTemplates');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string')
    return res.status(400).json({ message: 'Invalid input' });
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
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });

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
  if (req.body.password)                      user.password        = req.body.password;
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

module.exports = { register, login, getProfile, updateProfile };
