const Category = require('../models/Category');
const Product  = require('../models/Product');

const getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort('name');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const cat = await Category.create({ name: name.trim(), description: description || '', image: image || '' });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const update = {};
    if (name?.trim()) {
      update.name = name.trim();
      update.slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    if (description !== undefined) update.description = description;
    if (image !== undefined) update.image = image;

    const cat = await Category.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const inUse = await Product.countDocuments({ category: cat.name });
    if (inUse > 0) {
      return res.status(400).json({ message: `Cannot delete — ${inUse} product(s) use this category` });
    }

    await cat.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
