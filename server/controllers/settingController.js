const Setting = require('../models/Setting');

const DEFAULT_ANNOUNCEMENT = '✦ FREE SHIPPING ON ORDERS $150+  ·  BUY NOW PAY LATER AVAILABLE  ·  NEW ARRIVALS EVERY WEEK ✦';

const DEFAULT_PERKS = [
  { icon: 'Truck',      title: 'Free Shipping',   desc: 'On orders over $200' },
  { icon: 'RotateCcw',  title: '30-Day Returns',  desc: 'Hassle-free returns' },
  { icon: 'Shield',     title: '100% Human Hair', desc: 'Certified & authentic' },
  { icon: 'CreditCard', title: 'Secure Payment',  desc: 'Flexible payments' },
];

const DEFAULT_HERO_PILL = { label: 'Free Ship', amount: '$150+' };

/* ─ Announcement ─ */
const getAnnouncement = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'announcement' });
    res.json({ value: setting ? setting.value : DEFAULT_ANNOUNCEMENT });
  } catch {
    res.json({ value: DEFAULT_ANNOUNCEMENT });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || !String(value).trim()) return res.status(400).json({ message: 'Announcement text is required' });
    const setting = await Setting.findOneAndUpdate(
      { key: 'announcement' },
      { $set: { value: String(value).trim() } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ value: setting.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─ Perks ─ */
const getPerks = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'perks' });
    res.json(setting ? JSON.parse(setting.value) : DEFAULT_PERKS);
  } catch {
    res.json(DEFAULT_PERKS);
  }
};

const updatePerks = async (req, res) => {
  try {
    const { perks } = req.body;
    if (!Array.isArray(perks)) return res.status(400).json({ message: 'perks must be an array' });
    await Setting.findOneAndUpdate(
      { key: 'perks' },
      { $set: { value: JSON.stringify(perks) } },
      { upsert: true }
    );
    res.json(perks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─ Hero Pill ─ */
const getHeroPill = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'heroPill' });
    res.json(setting ? JSON.parse(setting.value) : DEFAULT_HERO_PILL);
  } catch {
    res.json(DEFAULT_HERO_PILL);
  }
};

const updateHeroPill = async (req, res) => {
  try {
    const { label, amount } = req.body;
    const pill = { label: (label || 'Free Ship').trim(), amount: (amount || '$150+').trim() };
    await Setting.findOneAndUpdate(
      { key: 'heroPill' },
      { $set: { value: JSON.stringify(pill) } },
      { upsert: true }
    );
    res.json(pill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnnouncement, updateAnnouncement, getPerks, updatePerks, getHeroPill, updateHeroPill };
