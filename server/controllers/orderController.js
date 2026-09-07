const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const Saloon = require('../models/Saloon');
const AbandonedCart = require('../models/AbandonedCart');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusEmail, reviewReminderEmail, adminNewOrderEmail } = require('../utils/emailTemplates');
const { computeOrderPricing } = require('../utils/pricing');
const logAdminAction = require('../utils/auditLog');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@franellhair.com';

const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, shippingMethod, paymentMethod, promoCode, email, fullName } = req.body;

  // Guest checkout: no logged-in user, so a name/email must be supplied
  // directly (they're used for the confirmation email and admin notice).
  if (!req.user) {
    if (typeof email !== 'string' || !email.trim() || typeof fullName !== 'string' || !fullName.trim())
      return res.status(400).json({ message: 'Name and email are required' });
  }

  let pricing;
  try {
    pricing = await computeOrderPricing({ orderItems, shippingMethod, promoCode });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const { orderItems: verifiedItems, itemsPrice, shippingPrice, discount, totalPrice } = pricing;

  const order = await Order.create({
    user: req.user?._id || null,
    guestName: req.user ? '' : fullName.trim(),
    guestEmail: req.user ? '' : email.trim().toLowerCase(),
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discount,
    totalPrice,
  });

  // Update stock
  for (const item of verifiedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty, sold: item.qty },
    });
  }

  const customerEmail = req.user?.email || order.guestEmail;
  const customerForEmail = req.user || { name: order.guestName, email: order.guestEmail };

  const { subject, html } = orderConfirmationEmail({ ...order.toObject(), user: customerForEmail });
  sendEmail({ to: customerEmail, subject, html });

  const { subject: adminSubject, html: adminHtml } = adminNewOrderEmail({ ...order.toObject(), user: customerForEmail });
  sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });

  // They completed checkout — don't send them an "abandoned cart" reminder later.
  AbandonedCart.deleteMany({ email: customerEmail.toLowerCase() }).catch(() => {});

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  // Guest orders (order.user is null) have no account to check ownership
  // against — they're reachable by the (unguessable) order id alone, same
  // as the guest's own order-confirmation link right after checkout.
  if (order.user) {
    const isOwner = req.user && order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user?.isAdmin) return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
};

const payOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user) {
    const isOwner = req.user && order.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user?.isAdmin) return res.status(403).json({ message: 'Not authorized' });
  }
  if (order.isPaid) return res.json(order); // idempotent

  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return res.status(400).json({ message: 'Missing payment reference' });

  // A given Stripe payment can only ever settle one order
  const alreadyUsed = await Order.findOne({ 'paymentResult.id': paymentIntentId });
  if (alreadyUsed) return res.status(400).json({ message: 'Payment already applied to another order' });

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    return res.status(400).json({ message: 'Could not verify payment with Stripe' });
  }

  if (paymentIntent.status !== 'succeeded') {
    return res.status(400).json({ message: 'Payment has not succeeded' });
  }
  const expectedCents = Math.round(order.totalPrice * 100);
  if (paymentIntent.amount !== expectedCents || paymentIntent.currency !== 'cad') {
    return res.status(400).json({ message: 'Payment amount does not match order total' });
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  order.paymentResult = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    email: req.user?.email || order.guestEmail,
  };
  await order.save();
  res.json(order);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .populate('user', 'name email preferences');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
  }
  if (order.user?.email && order.user.preferences?.orderUpdates !== false) {
    const needsSaloons = req.body.status === 'shipped' || req.body.status === 'delivered';
    const saloons = needsSaloons ? await Saloon.find({ active: true }).sort('name').limit(3) : [];
    const { subject, html } = orderStatusEmail(order, req.body.status, saloons);
    sendEmail({ to: order.user.email, subject, html });
  }
  logAdminAction(req, 'order.statusChange', `#${order._id.toString().slice(-8).toUpperCase()}`, { orderId: order._id, status: req.body.status });
  res.json(order);
};

const REVIEW_REMINDER_DELAY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Called by an external scheduler (not a logged-in user), authenticated via
// a shared secret header rather than the normal JWT flow.
const sendReviewReminders = async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET || !process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const cutoff = new Date(Date.now() - REVIEW_REMINDER_DELAY_MS);
  const orders = await Order.find({
    status: 'delivered',
    deliveredAt: { $lte: cutoff },
    reviewReminderSentAt: null,
  }).populate('user', 'name email preferences');

  let sent = 0;
  for (const order of orders) {
    if (order.user?.email && order.user.preferences?.orderUpdates !== false) {
      const { subject, html } = reviewReminderEmail(order);
      sendEmail({ to: order.user.email, subject, html });
      sent += 1;
    }
    order.reviewReminderSentAt = new Date();
    await order.save();
  }

  res.json({ checked: orders.length, sent });
};

module.exports = { createOrder, getMyOrders, getOrderById, payOrder, getAllOrders, updateOrderStatus, sendReviewReminders };
