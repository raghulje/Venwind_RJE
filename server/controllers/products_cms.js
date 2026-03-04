const db = require('../models');

const getHero = async (req, res) => {
  try {
    const hero = await db.ProductHero.findOne();
    return res.json({ success: true, data: hero });
  } catch (err) {
    console.error('Get ProductHero error', err);
    return res.status(500).json({ success: false, message: 'Failed to load product hero' });
  }
};

const upsertHero = async (req, res) => {
  try {
    const payload = req.body || {};
    const existing = await db.ProductHero.findOne();
    if (existing) {
      await existing.update(payload);
      return res.json({ success: true, data: existing });
    }
    const created = await db.ProductHero.create(payload);
    return res.json({ success: true, data: created });
  } catch (err) {
    console.error('Upsert ProductHero error', err);
    return res.status(500).json({ success: false, message: 'Failed to save product hero' });
  }
};

module.exports = {
  hero: { get: getHero, upsert: upsertHero },
};