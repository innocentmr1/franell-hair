const Setting = require('../models/Setting');

const DEFAULT_ANNOUNCEMENT = '✦ FREE SHIPPING ON ORDERS $150+  ·  BUY NOW PAY LATER AVAILABLE  ·  NEW ARRIVALS EVERY WEEK ✦';

const getAnnouncement = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'announcement' });
    res.json({ value: setting ? setting.value : DEFAULT_ANNOUNCEMENT });
  } catch (err) {
    res.json({ value: DEFAULT_ANNOUNCEMENT });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || !String(value).trim()) {
      return res.status(400).json({ message: 'Announcement text is required' });
    }
    const setting = await Setting.findOneAndUpdate(
      { key: 'announcement' },
      { $set: { value: String(value).trim() } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ value: setting.value });
  } catch (err) {
    console.error('updateAnnouncement error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnnouncement, updateAnnouncement };
