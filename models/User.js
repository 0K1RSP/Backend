const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ownedUpgradeSchema = new mongoose.Schema({
  upgradeId: String, level: { type: Number, default: 1 }
}, { _id: false });

const ownedLiquidSchema = new mongoose.Schema({
  liquidId: { type: String, default: () => 'liq_' + Date.now() + '_' + Math.random().toString(36).slice(2,8) },
  name: String, rarity: String, multiplier: { type: Number, default: 1 },
  effect: String, effectValue: { type: Number, default: 0 },
  equipped: { type: Boolean, default: false },
  obtainedAt: { type: Date, default: Date.now }
}, { _id: false });

const questSchema = new mongoose.Schema({
  questId: String, type: { type: String, enum: ['daily','weekly','special'], default: 'daily' },
  description: String, target: Number, current: { type: Number, default: 0 },
  reward: Number, rewardType: { type: String, default: 'gems' },
  completed: { type: Boolean, default: false }, claimed: { type: Boolean, default: false },
  expiresAt: Date
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  achievementId: String, unlockedAt: { type: Date, default: Date.now }, claimed: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  password: { type: String, required: true },
  role: { type: String, enum: ['player','admin'], default: 'player' },
  banned: { type: Boolean, default: false },

  smoke: { type: Number, default: 0 },
  totalSmoke: { type: Number, default: 0 },
  allTimeSmoke: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  totalGems: { type: Number, default: 0 },

  clicks: { type: Number, default: 0 },
  smokePerClick: { type: Number, default: 1 },
  smokePerSecond: { type: Number, default: 0 },
  clickMultiplier: { type: Number, default: 1 },
  critChance: { type: Number, default: 0.05 },
  critMultiplier: { type: Number, default: 3 },

  currentPuff: { type: String, default: 'basic' },
  inventory: [String],
  puffLevels: { type: Map, of: Number, default: new Map() },

  upgrades: [ownedUpgradeSchema],

  liquids: [ownedLiquidSchema],
  liquidMultiplier: { type: Number, default: 1 },

  quests: [questSchema],
  lastQuestReset: { type: Date, default: Date.now },
  lastWeeklyReset: { type: Date, default: Date.now },

  achievements: [achievementSchema],

  rebirthCount: { type: Number, default: 0 },
  rebirthMultiplier: { type: Number, default: 1 },
  rebirthTokens: { type: Number, default: 0 },
  talents: { type: Map, of: Number, default: new Map() },

  ascensionCount: { type: Number, default: 0 },
  ascensionMultiplier: { type: Number, default: 1 },
  ascensionPower: { type: Number, default: 0 },
  ascensionPerks: [String],

  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },

  currentSkin: { type: String, default: 'default' },
  ownedSkins: { type: [String], default: ['default'] },

  boxesOpened: { type: Number, default: 0 },

  loginStreak: { type: Number, default: 0 },
  lastLoginReward: { type: Date, default: null },

  activeBuffs: [{ buffType: String, multiplier: Number, expiresAt: Date, _id: false }],

  online: { type: Boolean, default: false },
  lastSave: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.calcLevel = function() {
  return Math.floor(Math.pow(this.allTimeSmoke / 50, 0.4)) + 1;
};

module.exports = mongoose.model('User', userSchema);
