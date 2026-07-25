const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { computeOrderPricing } = require('../utils/pricing');

const createPaymentIntent = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe is not configured on the server' });
    }

    const { orderItems, shippingMethod, promoCode } = req.body;
    const { totalPrice } = await computeOrderPricing({ orderItems, shippingMethod, promoCode });
    if (totalPrice <= 0) return res.status(400).json({ message: 'Invalid order total' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'cad',
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret, totalPrice });
  } catch (err) {
    console.error('Stripe createPaymentIntent error:', err.message);
    res.status(400).json({ message: err.message || 'Payment initialization failed' });
  }
};

module.exports = { createPaymentIntent };
