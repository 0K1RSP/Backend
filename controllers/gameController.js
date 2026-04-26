const User = require('../models/User');
const Puff = require('../models/Puff');
const Upgrade = require('../models/Upgrade');
const Event = require('../models/Event');
const Box = require('../models/Box');
const Announcement = require('../models/Announcement');
const Log = require('../models/Log');

// ============ HELPERS ============

function getEndOfDay() {
  const d = new Date(); d.setHours(23,59,59,999); return d;
}
function getEndOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() + (7 - d.getDay()));
  d.setHours(23,59,59,999);
  return d;
}

function generateDailyQuests() {
  const t = Date.now();
  return [
    { questId: `d_click_${t}`, type:'daily', description:'Faire 100 clics', target:100, reward:5, rewardType:'gems', expiresAt: getEndOfDay() },
    { questId: `d_smoke_${t}`, type:'daily', description:'Générer 5,000 fumée', target:5000, reward:3, rewardType:'gems', expiresAt: getEndOfDay() },
    { questId: `d_upgrade_${t}`, type:'daily', description:'Acheter 3 améliorations', target:3, reward:5, rewardType:'gems', expiresAt: getEndOfDay() },
    { questId: `d_crit_${t}`, type:'daily', description:'Faire 10 clics critiques', target:10, reward:8, rewardType:'gems', expiresAt: getEndOfDay() },
  ];
}

function generateWeeklyQuests() {
  const t = Date.now();
  return [
    { questId: `w_click_${t}`, type:'weekly', description:'Faire 5,000 clics', target:5000, reward:25, rewardType:'gems', expiresAt: getEndOfWeek() },
    { questId: `w_smoke_${t}`, type:'weekly', description:'Générer 500,000 fumée', target:500000, reward:50, rewardType:'gems', expiresAt: getEndOfWeek() },
    { questId: `w_box_${t}`, type:'weekly', description:'Ouvrir 10 boîtes', target:10, reward:30, rewardType:'gems', expiresAt: getEndOfWeek() },
  ];
}

const ACHIEVEMENTS = [
  { id:'first_click', name:'Premier Souffle', desc:'Fais ton premier clic', check: u => u.clicks >= 1, reward: { gems: 1 } },
  { id:'click_100', name:'Cliqueur Assidu', desc:'Fais 100 clics', check: u => u.clicks >= 100, reward: { gems: 5 } },
  { id:'click_1000', name:'Doigts de Feu', desc:'Fais 1,000 clics', check: u => u.clicks >= 1000, reward: { gems: 15 } },
  { id:'click_10k', name:'Machine à Clics', desc:'Fais 10,000 clics', check: u => u.clicks >= 10000, reward: { gems: 50 } },
  { id:'click_100k', name:'Légende du Clic', desc:'Fais 100,000 clics', check: u => u.clicks >= 100000, reward: { gems: 200 } },
  { id:'smoke_1k', name:'Petit Nuage', desc:'Génère 1K fumée totale', check: u => u.allTimeSmoke >= 1000, reward: { gems: 3 } },
  { id:'smoke_100k', name:'Brouillard Dense', desc:'Génère 100K fumée totale', check: u => u.allTimeSmoke >= 100000, reward: { gems: 20 } },
  { id:'smoke_1m', name:'Tempête de Fumée', desc:'Génère 1M fumée totale', check: u => u.allTimeSmoke >= 1000000, reward: { gems: 75 } },
  { id:'smoke_100m', name:'Ouragan Vaporeux', desc:'Génère 100M fumée totale', check: u => u.allTimeSmoke >= 100000000, reward: { gems: 300 } },
  { id:'smoke_1b', name:'Apocalypse Fumée', desc:'Génère 1B fumée totale', check: u => u.allTimeSmoke >= 1000000000, reward: { gems: 1000 } },
  { id:'puff_3', name:'Collectionneur', desc:'Possède 3 puffs', check: u => u.inventory.length >= 3, reward: { gems: 10 } },
  { id:'puff_5', name:'Amateur de Puffs', desc:'Possède 5 puffs', check: u => u.inventory.length >= 5, reward: { gems: 25 } },
  { id:'puff_all', name:'Maître des Puffs', desc:'Possède toutes les puffs', check: u => u.inventory.length >= 10, reward: { gems: 100 } },
  { id:'rebirth_1', name:'Renaissance', desc:'Fais ta première renaissance', check: u => u.rebirthCount >= 1, reward: { gems: 50 } },
  { id:'rebirth_5', name:'Phoenix', desc:'Fais 5 renaissances', check: u => u.rebirthCount >= 5, reward: { gems: 150 } },
  { id:'rebirth_10', name:'Éternel', desc:'Fais 10 renaissances', check: u => u.rebirthCount >= 10, reward: { gems: 500 } },
  { id:'ascension_1', name:'Transcendance', desc:'Fais ta première ascension', check: u => u.ascensionCount >= 1, reward: { gems: 200 } },
  { id:'ascension_3', name:'Être Céleste', desc:'Fais 3 ascensions', check: u => u.ascensionCount >= 3, reward: { gems: 1000 } },
  { id:'box_10', name:'Déballeur', desc:'Ouvre 10 boîtes', check: u => u.boxesOpened >= 10, reward: { gems: 15 } },
  { id:'box_100', name:'Addict aux Boîtes', desc:'Ouvre 100 boîtes', check: u => u.boxesOpened >= 100, reward: { gems: 75 } },
  { id:'liquid_5', name:'Mixologue', desc:'Possède 5 liquides', check: u => u.liquids.length >= 5, reward: { gems: 20 } },
  { id:'liquid_20', name:'Alchimiste', desc:'Possède 20 liquides', check: u => u.liquids.length >= 20, reward: { gems: 100 } },
  { id:'level_10', name:'Niveau 10', desc:'Atteins le niveau 10', check: u => u.level >= 10, reward: { gems: 10 } },
  { id:'level_25', name:'Niveau 25', desc:'Atteins le niveau 25', check: u => u.level >= 25, reward: { gems: 30 } },
  { id:'level_50', name:'Niveau 50', desc:'Atteins le niveau 50', check: u => u.level >= 50, reward: { gems: 75 } },
  { id:'level_100', name:'Centurion', desc:'Atteins le niveau 100', check: u => u.level >= 100, reward: { gems: 200 } },
  { id:'gems_100', name:'Brillant', desc:'Accumule 100 gems au total', check: u => u.totalGems >= 100, reward: { gems: 10 } },
  { id:'gems_1000', name:'Diamantaire', desc:'Accumule 1,000 gems au total', check: u => u.totalGems >= 1000, reward: { gems: 50 } },
];

async function getActiveEvents() {
  const now = new Date();
  return Event.find({ active: true, startTime: { $lte: now }, endTime: { $gte: now } });
}

async function getEventMultiplier(type) {
  const events = await getActiveEvents();
  let m = 1;
  for (const e of events) { if (e.type === type) m *= e.bonusMultiplier; }
  return m;
}

function cleanExpiredBuffs(user) {
  const now = new Date();
  user.activeBuffs = user.activeBuffs.filter(b => new Date(b.expiresAt) > now);
}

function getBuffMultiplier(user, type) {
  let m = 1;
  for (const b of user.activeBuffs) {
    if (b.buffType === type && new Date(b.expiresAt) > new Date()) {
      m *= b.multiplier;
    }
  }
  return m;
}

function recalcLiquidMultiplier(user) {
  let m = 1;
  for (const liq of user.liquids) {
    if (liq.equipped) m *= liq.multiplier;
  }
  user.liquidMultiplier = m;
}

function checkAndUnlockAchievements(user) {
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    const already = user.achievements.find(a => a.achievementId === ach.id);
    if (!already && ach.check(user)) {
      user.achievements.push({ achievementId: ach.id });
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}

function updateQuestProgress(user, category, amount) {
  for (const q of user.quests) {
    if (q.completed) continue;
    const d = q.description.toLowerCase();
    if (category === 'click' && d.includes('clic') && !d.includes('critiq')) {
      q.current += amount;
    } else if (category === 'smoke' && d.includes('fumée')) {
      q.current += amount;
    } else if (category === 'upgrade' && d.includes('amélioration')) {
      q.current += amount;
    } else if (category === 'crit' && d.includes('critiq')) {
      q.current += amount;
    } else if (category === 'box' && d.includes('boîte')) {
      q.current += amount;
    }
    if (q.current >= q.target) q.completed = true;
  }
}

// ============ CONTROLLERS ============

exports.getData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    if (user.banned) return res.status(403).json({ error: 'Compte banni.' });

    cleanExpiredBuffs(user);

    // Reset daily quests
    const now = new Date();
    const lr = new Date(user.lastQuestReset);
    if (now.getDate() !== lr.getDate() || now.getMonth() !== lr.getMonth() || now.getFullYear() !== lr.getFullYear()) {
      user.quests = user.quests.filter(q => q.type !== 'daily');
      user.quests.push(...generateDailyQuests());
      user.lastQuestReset = now;
    }

    // Reset weekly
    const lw = new Date(user.lastWeeklyReset);
    if (Math.floor((now - lw) / 86400000) >= 7) {
      user.quests = user.quests.filter(q => q.type !== 'weekly');
      user.quests.push(...generateWeeklyQuests());
      user.lastWeeklyReset = now;
    }

    // Init if empty
    if (user.quests.length === 0) {
      user.quests = [...generateDailyQuests(), ...generateWeeklyQuests()];
      user.lastQuestReset = now;
      user.lastWeeklyReset = now;
    }

    // Login streak
    if (!user.lastLoginReward || now.getDate() !== new Date(user.lastLoginReward).getDate()) {
      const lastLogin = user.lastLoginReward ? new Date(user.lastLoginReward) : null;
      if (lastLogin && (now - lastLogin) < 172800000) {
        user.loginStreak += 1;
      } else {
        user.loginStreak = 1;
      }
      const streakReward = Math.min(user.loginStreak * 2, 20);
      user.gems += streakReward;
      user.totalGems += streakReward;
      user.lastLoginReward = now;
    }

    user.level = user.calcLevel();
    user.online = true;
    user.lastSave = now;
    checkAndUnlockAchievements(user);
    await user.save();

    const puffs = await Puff.find({ available: true });
    const upgrades = await Upgrade.find({ available: true });
    const boxes = await Box.find({ available: true });
    const events = await getActiveEvents();
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(5);

    res.json({
      user: {
        id: user._id, username: user.username, role: user.role,
        smoke: user.smoke, totalSmoke: user.totalSmoke, allTimeSmoke: user.allTimeSmoke,
        gems: user.gems, totalGems: user.totalGems,
        clicks: user.clicks,
        smokePerClick: user.smokePerClick, smokePerSecond: user.smokePerSecond,
        clickMultiplier: user.clickMultiplier,
        critChance: user.critChance, critMultiplier: user.critMultiplier,
        currentPuff: user.currentPuff, inventory: user.inventory,
        puffLevels: Object.fromEntries(user.puffLevels || new Map()),
        upgrades: user.upgrades, liquids: user.liquids, liquidMultiplier: user.liquidMultiplier,
        quests: user.quests, achievements: user.achievements,
        rebirthCount: user.rebirthCount, rebirthMultiplier: user.rebirthMultiplier,
        rebirthTokens: user.rebirthTokens, talents: Object.fromEntries(user.talents || new Map()),
        ascensionCount: user.ascensionCount, ascensionMultiplier: user.ascensionMultiplier,
        ascensionPower: user.ascensionPower, ascensionPerks: user.ascensionPerks,
        level: user.level, experience: user.experience,
        currentSkin: user.currentSkin, ownedSkins: user.ownedSkins,
        boxesOpened: user.boxesOpened,
        loginStreak: user.loginStreak,
        activeBuffs: user.activeBuffs,
      },
      puffs, upgrades, boxes, events, announcements,
      achievementsDef: ACHIEVEMENTS.map(a => ({ id: a.id, name: a.name, desc: a.desc, reward: a.reward }))
    });
  } catch (err) {
    console.error('getData error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.click = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    if (user.banned) return res.status(403).json({ error: 'Compte banni.' });

    cleanExpiredBuffs(user);

    const puff = await Puff.findOne({ puffId: user.currentPuff });
    const puffMult = puff ? puff.multiplier : 1;
    const puffLevel = user.puffLevels?.get(user.currentPuff) || 1;
    const puffLevelMult = 1 + (puffLevel - 1) * 0.15;
    const eventMult = await getEventMultiplier('double_smoke');
    const buffMult = getBuffMultiplier(user, 'smoke');

    // Crit check
    const isCrit = Math.random() < user.critChance;
    const critMult = isCrit ? user.critMultiplier : 1;

    const baseSmokePerClick = user.smokePerClick * user.clickMultiplier * puffMult * puffLevelMult;
    const totalMult = user.rebirthMultiplier * user.ascensionMultiplier * user.liquidMultiplier * eventMult * buffMult * critMult;
    const smokeGained = Math.floor(baseSmokePerClick * totalMult);

    user.smoke += smokeGained;
    user.totalSmoke += smokeGained;
    user.allTimeSmoke += smokeGained;
    user.clicks += 1;
    user.experience += 1;
    user.level = user.calcLevel();

    updateQuestProgress(user, 'click', 1);
    updateQuestProgress(user, 'smoke', smokeGained);
    if (isCrit) updateQuestProgress(user, 'crit', 1);

    const newAch = checkAndUnlockAchievements(user);
    await user.save();

    res.json({
      smoke: user.smoke, totalSmoke: user.totalSmoke, allTimeSmoke: user.allTimeSmoke,
      clicks: user.clicks, smokeGained, isCrit, level: user.level, experience: user.experience,
      newAchievements: newAch.map(a => ({ id: a.id, name: a.name }))
    });
  } catch (err) {
    console.error('Click error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.collectAutoSmoke = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    cleanExpiredBuffs(user);

    const puff = await Puff.findOne({ puffId: user.currentPuff });
    const puffAutoSmoke = puff ? puff.autoSmoke : 0;
    const puffLevel = user.puffLevels?.get(user.currentPuff) || 1;
    const puffLevelMult = 1 + (puffLevel - 1) * 0.15;
    const eventMult = await getEventMultiplier('double_smoke');
    const buffMult = getBuffMultiplier(user, 'smoke');

    const totalAuto = (user.smokePerSecond + puffAutoSmoke * puffLevelMult) * user.rebirthMultiplier * user.ascensionMultiplier * user.liquidMultiplier * eventMult * buffMult;
    const smokeGained = Math.floor(totalAuto);

    if (smokeGained > 0) {
      user.smoke += smokeGained;
      user.totalSmoke += smokeGained;
      user.allTimeSmoke += smokeGained;
      updateQuestProgress(user, 'smoke', smokeGained);
      checkAndUnlockAchievements(user);
      await user.save();
    }

    res.json({ smoke: user.smoke, totalSmoke: user.totalSmoke, smokeGained });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.buyUpgrade = async (req, res) => {
  try {
    const { upgradeId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const upgrade = await Upgrade.findOne({ upgradeId });
    if (!upgrade) return res.status(404).json({ error: 'Amélioration non trouvée.' });

    if (upgrade.requiresRebirth > user.rebirthCount) {
      return res.status(400).json({ error: `Nécessite ${upgrade.requiresRebirth} renaissances.` });
    }

    const owned = user.upgrades.find(u => u.upgradeId === upgradeId);
    const currentLevel = owned ? owned.level : 0;
    if (currentLevel >= upgrade.maxLevel) return res.status(400).json({ error: 'Niveau maximum atteint.' });

    const price = upgrade.getPriceAtLevel(currentLevel + 1);

    if (upgrade.currency === 'smoke') {
      if (user.smoke < price) return res.status(400).json({ error: 'Pas assez de fumée.' });
      user.smoke -= price;
    } else {
      if (user.gems < price) return res.status(400).json({ error: 'Pas assez de gems.' });
      user.gems -= price;
    }

    switch (upgrade.effect) {
      case 'click_power': user.smokePerClick += upgrade.effectValue; break;
      case 'auto_smoke': user.smokePerSecond += upgrade.effectValue; break;
      case 'multiplier': user.clickMultiplier += upgrade.effectValue; break;
      case 'crit_chance': user.critChance = Math.min(user.critChance + upgrade.effectValue, 0.9); break;
      case 'crit_mult': user.critMultiplier += upgrade.effectValue; break;
      case 'rebirth_bonus': user.rebirthMultiplier += upgrade.effectValue; break;
      case 'ascension_bonus': user.ascensionMultiplier += upgrade.effectValue; break;
    }

    if (owned) owned.level += 1;
    else user.upgrades.push({ upgradeId, level: 1 });

    updateQuestProgress(user, 'upgrade', 1);
    checkAndUnlockAchievements(user);
    await user.save();

    res.json({
      smoke: user.smoke, gems: user.gems,
      smokePerClick: user.smokePerClick, smokePerSecond: user.smokePerSecond,
      clickMultiplier: user.clickMultiplier, critChance: user.critChance, critMultiplier: user.critMultiplier,
      upgrades: user.upgrades
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.buyPuff = async (req, res) => {
  try {
    const { puffId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    if (user.inventory.includes(puffId)) return res.status(400).json({ error: 'Vous possédez déjà cette puff.' });

    const puff = await Puff.findOne({ puffId });
    if (!puff) return res.status(404).json({ error: 'Puff non trouvée.' });

    if (puff.requiresAscension && user.ascensionCount < 1) return res.status(400).json({ error: 'Nécessite une ascension.' });
    if (user.smoke < puff.priceSmoke) return res.status(400).json({ error: 'Pas assez de fumée.' });
    if (user.gems < puff.priceGems) return res.status(400).json({ error: 'Pas assez de gems.' });

    user.smoke -= puff.priceSmoke;
    user.gems -= puff.priceGems;
    user.inventory.push(puffId);
    user.puffLevels.set(puffId, 1);

    checkAndUnlockAchievements(user);
    await user.save();
    res.json({ smoke: user.smoke, gems: user.gems, inventory: user.inventory });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.equipPuff = async (req, res) => {
  try {
    const { puffId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    if (!user.inventory.includes(puffId)) return res.status(400).json({ error: 'Vous ne possédez pas cette puff.' });

    user.currentPuff = puffId;
    await user.save();
    res.json({ currentPuff: user.currentPuff });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.levelUpPuff = async (req, res) => {
  try {
    const { puffId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    if (!user.inventory.includes(puffId)) return res.status(400).json({ error: 'Vous ne possédez pas cette puff.' });

    const puff = await Puff.findOne({ puffId });
    if (!puff) return res.status(404).json({ error: 'Puff non trouvée.' });

    const currentLevel = user.puffLevels.get(puffId) || 1;
    if (currentLevel >= puff.maxPuffLevel) return res.status(400).json({ error: 'Niveau max de cette puff.' });

    const cost = Math.floor(puff.levelUpCost * Math.pow(2.2, currentLevel - 1));
    if (user.smoke < cost) return res.status(400).json({ error: 'Pas assez de fumée.' });

    user.smoke -= cost;
    user.puffLevels.set(puffId, currentLevel + 1);
    await user.save();

    res.json({ smoke: user.smoke, puffLevels: Object.fromEntries(user.puffLevels), newLevel: currentLevel + 1 });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.openBox = async (req, res) => {
  try {
    const { boxId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const box = await Box.findOne({ boxId });
    if (!box) return res.status(404).json({ error: 'Boîte non trouvée.' });

    if (box.priceSmoke > 0 && user.smoke < box.priceSmoke) return res.status(400).json({ error: 'Pas assez de fumée.' });
    if (box.priceGems > 0 && user.gems < box.priceGems) return res.status(400).json({ error: 'Pas assez de gems.' });

    user.smoke -= box.priceSmoke;
    user.gems -= box.priceGems;

    // Weighted random from loot table
    const totalWeight = box.lootTable.reduce((s, l) => s + l.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = box.lootTable[0];
    for (const item of box.lootTable) {
      rand -= item.weight;
      if (rand <= 0) { selected = item; break; }
    }

    // Event bonus for loot
    const eventLootMult = await getEventMultiplier('loot_bonus');
    const finalMult = +(selected.multiplier * (eventLootMult > 1 ? 1.5 : 1)).toFixed(3);

    const liquid = {
      liquidId: 'liq_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      name: selected.name,
      rarity: selected.rarity,
      multiplier: finalMult,
      effect: selected.effect,
      effectValue: selected.effectValue * (eventLootMult > 1 ? 1.5 : 1),
      equipped: false,
    };

    user.liquids.push(liquid);
    user.boxesOpened += 1;

    updateQuestProgress(user, 'box', 1);
    checkAndUnlockAchievements(user);
    await user.save();

    res.json({ smoke: user.smoke, gems: user.gems, liquid, boxesOpened: user.boxesOpened });
  } catch (err) {
    console.error('Open box error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.equipLiquid = async (req, res) => {
  try {
    const { liquidId, equip } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const liq = user.liquids.find(l => l.liquidId === liquidId);
    if (!liq) return res.status(404).json({ error: 'Liquide non trouvé.' });

    // Max 5 equipped
    const equippedCount = user.liquids.filter(l => l.equipped).length;
    if (equip && !liq.equipped && equippedCount >= 5) {
      return res.status(400).json({ error: 'Maximum 5 liquides équipés.' });
    }

    liq.equipped = !!equip;
    recalcLiquidMultiplier(user);
    await user.save();

    res.json({ liquids: user.liquids, liquidMultiplier: user.liquidMultiplier });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.sellLiquid = async (req, res) => {
  try {
    const { liquidId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const idx = user.liquids.findIndex(l => l.liquidId === liquidId);
    if (idx === -1) return res.status(404).json({ error: 'Liquide non trouvé.' });

    const rarity = user.liquids[idx].rarity;
    const sellValues = { common:5, uncommon:15, rare:50, epic:150, legendary:500, mythic:1500, divine:5000, cosmic:15000 };
    const smokeGain = sellValues[rarity] || 5;

    user.liquids.splice(idx, 1);
    user.smoke += smokeGain;
    user.totalSmoke += smokeGain;
    user.allTimeSmoke += smokeGain;
    recalcLiquidMultiplier(user);
    await user.save();

    res.json({ smoke: user.smoke, liquids: user.liquids, liquidMultiplier: user.liquidMultiplier });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.claimQuest = async (req, res) => {
  try {
    const { questId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const quest = user.quests.find(q => q.questId === questId);
    if (!quest) return res.status(404).json({ error: 'Quête non trouvée.' });
    if (!quest.completed) return res.status(400).json({ error: 'Quête non terminée.' });
    if (quest.claimed) return res.status(400).json({ error: 'Récompense déjà réclamée.' });

    const eventMult = await getEventMultiplier('double_gems');
    const reward = Math.floor(quest.reward * eventMult);

    if (quest.rewardType === 'gems') { user.gems += reward; user.totalGems += reward; }
    else { user.smoke += reward; user.totalSmoke += reward; user.allTimeSmoke += reward; }

    quest.claimed = true;
    checkAndUnlockAchievements(user);
    await user.save();

    res.json({ gems: user.gems, smoke: user.smoke, reward, rewardType: quest.rewardType });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.claimAchievement = async (req, res) => {
  try {
    const { achievementId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const ach = user.achievements.find(a => a.achievementId === achievementId);
    if (!ach) return res.status(404).json({ error: 'Succès non débloqué.' });
    if (ach.claimed) return res.status(400).json({ error: 'Récompense déjà réclamée.' });

    const def = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!def) return res.status(404).json({ error: 'Succès inconnu.' });

    if (def.reward.gems) { user.gems += def.reward.gems; user.totalGems += def.reward.gems; }
    ach.claimed = true;
    await user.save();

    res.json({ gems: user.gems, totalGems: user.totalGems });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.prestige = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const minSmoke = 1000000;
    if (user.totalSmoke < minSmoke) return res.status(400).json({ error: `Il faut au moins 1M fumée totale.` });

    const tokensEarned = Math.floor(Math.sqrt(user.totalSmoke / 1000));
    const gemsEarned = Math.floor(Math.pow(user.totalSmoke / 10000, 0.4));

    user.rebirthCount += 1;
    user.rebirthTokens += tokensEarned;
    user.rebirthMultiplier = 1 + user.rebirthCount * 0.3;
    user.gems += gemsEarned;
    user.totalGems += gemsEarned;

    // Reset
    user.smoke = 0;
    user.totalSmoke = 0;
    user.smokePerClick = 1;
    user.smokePerSecond = 0;
    user.clickMultiplier = 1;
    user.critChance = 0.05;
    user.critMultiplier = 3;
    user.upgrades = [];
    user.currentPuff = 'basic';
    user.inventory = ['basic'];
    user.puffLevels = new Map([['basic', 1]]);
    user.activeBuffs = [];

    checkAndUnlockAchievements(user);
    await user.save();

    await Log.create({ action: 'rebirth', userId: user._id, username: user.username, details: `Rebirth #${user.rebirthCount}, earned ${tokensEarned} tokens + ${gemsEarned} gems` });

    res.json({
      rebirthCount: user.rebirthCount, rebirthMultiplier: user.rebirthMultiplier,
      rebirthTokens: user.rebirthTokens, tokensEarned, gemsEarned, gems: user.gems
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.ascend = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    if (user.rebirthCount < 5) return res.status(400).json({ error: 'Il faut au moins 5 renaissances pour ascensionner.' });
    if (user.allTimeSmoke < 1000000000) return res.status(400).json({ error: 'Il faut au moins 1B fumée all-time.' });

    const ascPower = Math.floor(Math.pow(user.allTimeSmoke / 100000, 0.3));

    user.ascensionCount += 1;
    user.ascensionMultiplier = 1 + user.ascensionCount * 1.0;
    user.ascensionPower += ascPower;

    // Total reset
    user.smoke = 0;
    user.totalSmoke = 0;
    user.smokePerClick = 1;
    user.smokePerSecond = 0;
    user.clickMultiplier = 1;
    user.critChance = 0.05;
    user.critMultiplier = 3;
    user.upgrades = [];
    user.currentPuff = 'basic';
    user.inventory = ['basic'];
    user.puffLevels = new Map([['basic', 1]]);
    user.rebirthCount = 0;
    user.rebirthMultiplier = 1;
    user.rebirthTokens = 0;
    user.talents = new Map();
    user.activeBuffs = [];
    // Keep: liquids, gems, achievements, allTimeSmoke, ascension stats

    checkAndUnlockAchievements(user);
    await user.save();

    await Log.create({ action: 'ascension', userId: user._id, username: user.username, details: `Ascension #${user.ascensionCount}, power: ${ascPower}` });

    res.json({
      ascensionCount: user.ascensionCount, ascensionMultiplier: user.ascensionMultiplier,
      ascensionPower: user.ascensionPower
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.buyBuff = async (req, res) => {
  try {
    const { buffType, duration } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const buffDefs = {
      smoke_x2: { cost: 10, multiplier: 2, type: 'smoke' },
      smoke_x5: { cost: 25, multiplier: 5, type: 'smoke' },
      crit_x2: { cost: 15, multiplier: 2, type: 'crit' },
    };

    const def = buffDefs[buffType];
    if (!def) return res.status(400).json({ error: 'Buff inconnu.' });

    const durationMs = (duration || 300) * 1000; // default 5 min
    if (user.gems < def.cost) return res.status(400).json({ error: 'Pas assez de gems.' });

    user.gems -= def.cost;
    user.activeBuffs.push({
      buffType: def.type,
      multiplier: def.multiplier,
      expiresAt: new Date(Date.now() + durationMs)
    });

    await user.save();
    res.json({ gems: user.gems, activeBuffs: user.activeBuffs });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.save = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    user.lastSave = new Date();
    await user.save();
    res.json({ message: 'Sauvegarde réussie.', lastSave: user.lastSave });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
