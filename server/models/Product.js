const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: String, required: true },
    hairType: {
      type: String,
      enum: ['Braids', 'Locs', 'Twists', 'Straight', 'Wavy', 'Curly', 'Kinky'],
    },
    video:  { type: String, default: '' },
    videos: [{ type: String }],
    lengths: [{ type: String }],
    colors: [{ type: String }],
    colorImages: [{ color: { type: String }, image: { type: String } }],
    stock: { type: Number, required: true, default: 0 },
    sold: { type: Number, default: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

productSchema.pre('save', async function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
});

module.exports = mongoose.model('Product', productSchema);
