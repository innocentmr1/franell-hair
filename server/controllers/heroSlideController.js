const HeroSlide = require('../models/HeroSlide');

const getSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addSlide = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image URL is required' });
    const count = await HeroSlide.countDocuments();
    const slide = await HeroSlide.create({ imageUrl, order: count });
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSlide = async (req, res) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reorderSlides = async (req, res) => {
  try {
    const { ids } = req.body; // ordered array of slide IDs
    await Promise.all(ids.map((id, i) => HeroSlide.findByIdAndUpdate(id, { order: i })));
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSlides, addSlide, deleteSlide, reorderSlides };
