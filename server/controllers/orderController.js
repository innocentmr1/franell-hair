const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusEmail } = require('../utils/emailTemplates');
const { computeOrderPricing } = require('../utils/pricing');

const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, shippingMethod, paymentMethod, promoCode } = req.body;

  let pricing;
  try {
    pricing = await computeOrderPricing({ orderItems, shippingMethod, promoCode });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const { orderItems: verifiedItems, itemsPrice, shippingPrice, discount, totalPrice } = pricing;

  const order = await Order.create({
    user: req.user._id,
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

  const { subject, html } = orderConfirmationEmail({ ...order.toObject(), user: req.user });
  sendEmail({ to: req.user.email, subject, html });

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)
    return res.status(403).json({ message: 'Not authorized' });
  res.json(order);
};

const payOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin)
    return res.status(403).json({ message: 'Not authorized' });
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
    email: req.user.email,
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
    const { subject, html } = orderStatusEmail(order, req.body.status);
    sendEmail({ to: order.user.email, subject, html });
  }
  res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById, payOrder, getAllOrders, updateOrderStatus };
