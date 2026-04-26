const mongoose = require('mongoose');

const puffSchema = new mongoose.Schema({
  puffId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  priceSmoke: { type: Number, default: 0 },
  priceGems: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  autoSmoke: { type: Number, default: 0 },
  critBonus: { type: Number, default: 0 },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary','mythic','divine','cosmic'], default: 'common' },
  emoji: { type: String, default: '🌬️' },
  color: { type: String, default: '#888' },
  unlockLevel: { type: Number, default: 1 },
  maxPuffLevel: { type: Number, default: 10 },
  levelUpCost: { type: Number, default: 1000 },
  requiresAscension: { type: Boolean, default: false },
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Puff', puffSchema);
