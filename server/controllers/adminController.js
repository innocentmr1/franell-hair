const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');

const getStats = async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, revenueAgg, recentOrders, topProducts, monthlyRevenue] =
    await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.find().populate('user', 'name email').sort('-createdAt').limit(5),
      Product.find().sort('-sold').limit(5),
      Order.aggregate([
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month', revenue: 1 } },
      ]),
    ]);

  res.json({
    totalOrders,
    totalProducts,
    totalUsers,
    revenue: revenueAgg[0]?.total || 0,
    recentOrders,
    topProducts,
    monthlyRevenue,
  });
};

const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isAdmin) return res.status(400).json({ message: 'Cannot delete admin user' });
  await user.deleteOne();
  res.json({ message: 'User removed' });
};

module.exports = { getStats, getUsers, deleteUser };
