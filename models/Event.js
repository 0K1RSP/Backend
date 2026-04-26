const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['double_smoke','double_gems','crit_storm','smoke_storm','rainbow_liquids','puff_fire','boss_global','weekend_boost','sale'], required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  bonusMultiplier: { type: Number, default: 2 },
  active: { type: Boolean, default: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  createdBy: { type: String, default: 'system' }
});

module.exports = mongoose.model('Event', eventSchema);
