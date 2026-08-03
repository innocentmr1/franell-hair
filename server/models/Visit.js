const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    visitorId: { type: String, required: true },
  },
  { timestamps: true }
);

visitSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Visit', visitSchema);
