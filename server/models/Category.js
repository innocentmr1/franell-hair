const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, unique: true, sparse: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

categorySchema.pre('save', async function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
