const Setting = require('../models/Setting');

const DEFAULT_ANNOUNCEMENT = '✦ FREE STANDARD SHIPPING ON EVERY ORDER  ·  EXPRESS DELIVERY AVAILABLE  ·  NEW ARRIVALS EVERY WEEK ✦';

const DEFAULT_PERKS = [
  { icon: 'Truck',      title: 'Free Shipping',   desc: 'Always free, every order' },
  { icon: 'RotateCcw',  title: '10-Day Returns',  desc: 'Hassle-free returns' },
  { icon: 'Shield',     title: '100% Human Hair', desc: 'Certified & authentic' },
  { icon: 'CreditCard', title: 'Secure Payment',  desc: 'Powered by Stripe' },
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

/* ─ About Page ─ */
const DEFAULT_ABOUT = {
  heroTitle: 'About Franell Hair',
  heroSub: 'Premium hair for every queen.',
  storyTag: 'Our Story',
  storyTitle: 'Born from passion, built for you',
  storyParagraph1: 'Franell Hair was founded with one mission — to make premium, long-lasting hair accessible to every woman. We source only the finest quality hair extensions, wigs, bundles and braiding products, working directly with trusted suppliers to ensure every strand meets our high standards.',
  storyParagraph2: "Whether you're after a sleek straight wig, bouncy body wave bundles or vibrant braiding hair for your next protective style, we have something for every texture, length and colour preference.",
  storyImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=700&fit=crop&q=80',
  valuesTitle: 'Why choose Franell?',
  values: [
    { icon: '✦', title: 'Premium Quality', body: '100% high-grade hair sourced from trusted suppliers. Every product is quality-checked before shipping.' },
    { icon: '🚚', title: 'Fast Shipping',   body: 'Orders ship within 1–2 business days. Standard shipping is free and takes 3 days; express is $30 for 2-day delivery.' },
    { icon: '↩',  title: '10-Day Returns',  body: 'Not satisfied? Return any unused, unopened product within 10 days for a full refund.' },
    { icon: '💬', title: 'Expert Support',  body: 'Our hair specialists are available 7 days a week to help you choose the right product.' },
  ],
};

const getAboutPage = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'aboutPage' });
    res.json(setting ? JSON.parse(setting.value) : DEFAULT_ABOUT);
  } catch {
    res.json(DEFAULT_ABOUT);
  }
};

const updateAboutPage = async (req, res) => {
  try {
    const data = req.body;
    await Setting.findOneAndUpdate(
      { key: 'aboutPage' },
      { $set: { value: JSON.stringify(data) } },
      { upsert: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnnouncement, updateAnnouncement, getPerks, updatePerks, getHeroPill, updateHeroPill, getAboutPage, updateAboutPage };
