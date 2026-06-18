const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:        { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value:       { type: Number, required: true }, // percent off or dollars off
  minOrder:    { type: Number, default: 0 },
  maxUses:     { type: Number, default: 0 }, // 0 = unlimited
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date, default: null },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);
