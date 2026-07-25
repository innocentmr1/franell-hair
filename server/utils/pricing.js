const Product = require('../models/Product');
const PromoCode = require('../models/PromoCode');

const computeShippingPrice = (shippingMethod) => (shippingMethod === 'express' ? 30 : 0);

// Rebuilds orderItems from authoritative DB data (name/image/price) — a
// client-sent price/name/image is never trusted, only product id + qty +
// the customer's chosen length/color.
const buildOrderItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || !rawItems.length) throw new Error('No order items');

  const ids = rawItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = rawItems.map((item) => {
    const product = byId.get(String(item.product));
    if (!product) throw new Error(`Product not found: ${item.product}`);
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty <= 0) throw new Error('Invalid quantity');
    return {
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      qty,
      length: item.length || '',
      color: item.color || '',
    };
  });

  const itemsPrice = +orderItems.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
  return { orderItems, itemsPrice };
};

// Re-validates a promo code server-side using the same rules as
// POST /api/promo/validate — a client-sent discount amount is never trusted.
const computePromoDiscount = async (code, orderTotal) => {
  if (!code) return { discount: 0, promo: null };

  const promo = await PromoCode.findOne({ code: code.trim().toUpperCase(), active: true });
  if (!promo) throw new Error('Invalid or expired promo code');
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error('This promo code has expired');
  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) throw new Error('This promo code has reached its usage limit');
  if (orderTotal < promo.minOrder) throw new Error(`Minimum order of $${promo.minOrder.toFixed(2)} required`);

  const discount = promo.type === 'percent'
    ? Math.min(orderTotal * (promo.value / 100), orderTotal)
    : Math.min(promo.value, orderTotal);
  return { discount: +discount.toFixed(2), promo };
};

// Single source of truth for order pricing — used by both createPaymentIntent
// (to charge the correct amount) and createOrder (to persist the same
// numbers), so the two can never disagree.
const computeOrderPricing = async ({ orderItems: rawItems, shippingMethod, promoCode }) => {
  const { orderItems, itemsPrice } = await buildOrderItems(rawItems);
  const shippingPrice = computeShippingPrice(shippingMethod);
  const { discount, promo } = await computePromoDiscount(promoCode, itemsPrice);
  const totalPrice = +(itemsPrice + shippingPrice - discount).toFixed(2);
  return { orderItems, itemsPrice, shippingPrice, discount, totalPrice, promo };
};

module.exports = { computeOrderPricing };
