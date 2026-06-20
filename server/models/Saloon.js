const mongoose = require('mongoose');

const saloonSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  address: { type: String, required: true },
  phone:   { type: String, default: '' },
  images:  [{ type: String }],
  active:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Saloon', saloonSchema);
