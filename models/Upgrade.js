const mongoose = require('mongoose');

const upgradeSchema = new mongoose.Schema({
  upgradeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  priceMultiplier: { type: Number, default: 1.5 },
  currency: { type: String, enum: ['smoke','gems'], default: 'smoke' },
  effect: { type: String, enum: ['click_power','auto_smoke','multiplier','crit_chance','crit_mult','gem_bonus','rebirth_bonus','ascension_bonus'], required: true },
  effectValue: { type: Number, required: true },
  maxLevel: { type: Number, default: 100 },
  category: { type: String, enum: ['click','auto','multiplier','critical','special'], default: 'click' },
  unlockLevel: { type: Number, default: 1 },
  requiresRebirth: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
});

upgradeSchema.methods.getPriceAtLevel = function(level) {
  return Math.floor(this.basePrice * Math.pow(this.priceMultiplier, level - 1));
};

module.exports = mongoose.model('Upgrade', upgradeSchema);
