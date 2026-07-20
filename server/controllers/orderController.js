const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusEmail } = require('../utils/emailTemplates');

const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, shippingMethod, paymentMethod } = req.body;
  if (!orderItems?.length) return res.status(400).json({ message: 'No order items' });

  const itemsPrice = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shippingPrice = shippingMethod === 'express' ? 30 : 0;
  const totalPrice = +(itemsPrice + shippingPrice).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  // Update stock
  for (const item of orderItems) {
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
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  order.paymentResult = req.body;
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
