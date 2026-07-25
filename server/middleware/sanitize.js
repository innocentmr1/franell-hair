// Strips any key starting with "$" or containing "." from request data, so a
// JSON body/query like {"email": {"$ne": null}} can't be interpreted as a
// MongoDB query operator by Mongoose. Mutates objects in place (rather than
// reassigning req.query/req.params) since Express 5 made those read-only
// getters — reassignment would silently fail or throw.
const stripBadKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    if (obj[key] && typeof obj[key] === 'object') stripBadKeys(obj[key]);
  }
};

const sanitize = (req, res, next) => {
  stripBadKeys(req.body);
  stripBadKeys(req.query);
  stripBadKeys(req.params);
  next();
};

module.exports = sanitize;
