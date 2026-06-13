const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const { category, hairType, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (hairType) filter.hairType = hairType;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
  if (search) filter.$or = [
    { name:        { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { category:    { $regex: search, $options: 'i' } },
    { hairType:    { $regex: search, $options: 'i' } },
  ];

  const sortMap = { newest: '-createdAt', price_asc: 'price', price_desc: '-price', rating: '-rating' };
  const sortBy = sortMap[sort] || '-createdAt';

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortBy)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({ products, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
};

const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id }).populate('reviews.user', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product removed' });
};

const addReview = async (req, res) => {
  try {
  // Try by ID; fall back to exact name match (handles orders placed before a reseed)
  let product = null;
  try { product = await Product.findById(req.params.id); } catch (_) {}
  if (!product && req.body.productName) {
    const safe = String(req.body.productName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    product = await Product.findOne({ name: new RegExp(`^${safe}$`, 'i') });
  }
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBestseller = async (req, res) => {
  try {
    const product = await Product.findOne({ sold: { $gt: 0 } }).sort({ sold: -1 });
    if (!product) return res.json(null);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTopReviews = async (req, res) => {
  const products = await Product.find(
    { 'reviews.0': { $exists: true } },
    { name: 1, reviews: 1 }
  );

  // Flatten all reviews, attach product name, keep only 4-5 star with real comments
  const all = [];
  for (const p of products) {
    for (const r of p.reviews) {
      if (r.rating >= 4 && r.comment?.trim().length > 10) {
        all.push({
          _id:         r._id,
          name:        r.name,
          rating:      r.rating,
          comment:     r.comment,
          productName: p.name,
          createdAt:   r.createdAt,
        });
      }
    }
  }

  // Sort by rating desc, then newest, take top 6
  all.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
  res.json(all.slice(0, 6));
};

module.exports = { getProducts, getFeaturedProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getTopReviews, getBestseller };
