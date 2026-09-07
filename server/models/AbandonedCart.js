const mongoose = require('mongoose');

const abandonedCartSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, default: '' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: { type: Number, default: 0 },
    reminderSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AbandonedCart', abandonedCartSchema);
