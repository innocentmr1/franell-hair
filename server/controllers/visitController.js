const Visit = require('../models/Visit');

const recordVisit = async (req, res) => {
  const { path, visitorId } = req.body;
  if (
    typeof path !== 'string' || typeof visitorId !== 'string' ||
    !path || !visitorId || path.length > 200 || visitorId.length > 100
  ) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  await Visit.create({ path, visitorId });
  res.status(204).end();
};

const getVisitStats = async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [totalViews, viewsToday, viewsThisWeek, uniqueVisitors30d, dailyViewsRaw, topPagesRaw] = await Promise.all([
    Visit.countDocuments(),
    Visit.countDocuments({ createdAt: { $gte: startOfToday } }),
    Visit.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Visit.distinct('visitorId', { createdAt: { $gte: thirtyDaysAgo } }),
    Visit.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Visit.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ]);

  res.json({
    totalViews,
    viewsToday,
    viewsThisWeek,
    uniqueVisitors30d: uniqueVisitors30d.length,
    dailyViews: dailyViewsRaw.map((d) => ({ date: d._id, count: d.count })),
    topPages: topPagesRaw.map((p) => ({ path: p._id, count: p.count })),
  });
};

module.exports = { recordVisit, getVisitStats };
