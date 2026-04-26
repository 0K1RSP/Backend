const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
  boxId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  priceSmoke: { type: Number, default: 0 },
  priceGems: { type: Number, default: 0 },
  emoji: { type: String, default: '📦' },
  color: { type: String, default: '#888' },
  unlockLevel: { type: Number, default: 1 },
  available: { type: Boolean, default: true },
  lootTable: [{
    name: String,
    rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary','mythic','divine','cosmic'], default: 'common' },
    multiplier: { type: Number, default: 1 },
    effect: { type: String, enum: ['smoke_mult','crit_chance','crit_mult','auto_smoke','click_power','gem_bonus','rebirth_bonus'], default: 'smoke_mult' },
    effectValue: { type: Number, default: 0 },
    weight: { type: Number, default: 100 },
    _id: false
  }]
});

module.exports = mongoose.model('Box', boxSchema);
