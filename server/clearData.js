require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/Product');
const Order    = require('./models/Order');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.deleteMany({});
  console.log(`Deleted ${products.deletedCount} products`);

  const orders = await Order.deleteMany({});
  console.log(`Deleted ${orders.deletedCount} orders`);

  console.log('Done. Users, settings and hero slides are untouched.');
  process.exit(0);
};

run().catch((e) => { console.error(e.message); process.exit(1); });
