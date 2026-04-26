require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

const Puff = require('./models/Puff');
const Upgrade = require('./models/Upgrade');
const Box = require('./models/Box');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://backend-rnxv.onrender.com',
  /\.netlify\.app$/,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((entry) =>
      entry instanceof RegExp ? entry.test(origin) : entry === origin
    );
    if (allowed) return callback(null, true);
    return callback(new Error('CORS blocked for this origin'));
  },
  credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/admin', adminRoutes);

// 404 handler pour API pure
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function seedDatabase() {
  try {
    // Seed Puffs
    if (await Puff.countDocuments() === 0) {
      await Puff.insertMany([
        { puffId:'basic', name:'Puff Basique', description:'Une puff simple pour débuter.', priceSmoke:0, priceGems:0, multiplier:1, autoSmoke:0, critBonus:0, rarity:'common', emoji:'🌫️', color:'#9e9e9e', unlockLevel:1, maxPuffLevel:10, levelUpCost:500 },
        { puffId:'cool_mint', name:'Cool Mint', description:'Menthol rafraîchissant.', priceSmoke:500, priceGems:0, multiplier:1.5, autoSmoke:1, critBonus:0.01, rarity:'common', emoji:'🧊', color:'#00bcd4', unlockLevel:3, maxPuffLevel:15, levelUpCost:1000 },
        { puffId:'tropical', name:'Tropical Vibes', description:'Arômes exotiques tropicaux.', priceSmoke:2000, priceGems:5, multiplier:2, autoSmoke:3, critBonus:0.02, rarity:'uncommon', emoji:'🌴', color:'#ff9800', unlockLevel:5, maxPuffLevel:15, levelUpCost:3000 },
        { puffId:'blueberry', name:'Blueberry Blast', description:'Explosion de myrtilles.', priceSmoke:10000, priceGems:15, multiplier:3, autoSmoke:8, critBonus:0.02, rarity:'uncommon', emoji:'🫐', color:'#3f51b5', unlockLevel:8, maxPuffLevel:20, levelUpCost:8000 },
        { puffId:'strawberry', name:'Strawberry Cloud', description:'Nuage de fraise sucrée.', priceSmoke:50000, priceGems:30, multiplier:5, autoSmoke:20, critBonus:0.03, rarity:'rare', emoji:'🍓', color:'#e91e63', unlockLevel:12, maxPuffLevel:20, levelUpCost:25000 },
        { puffId:'cotton_candy', name:'Cotton Candy', description:'Barbe à papa vaporeuse.', priceSmoke:200000, priceGems:60, multiplier:8, autoSmoke:50, critBonus:0.03, rarity:'rare', emoji:'🍬', color:'#e040fb', unlockLevel:18, maxPuffLevel:25, levelUpCost:80000 },
        { puffId:'dragon_fruit', name:'Dragon Fruit', description:'Le fruit du dragon mystique.', priceSmoke:1000000, priceGems:150, multiplier:15, autoSmoke:150, critBonus:0.05, rarity:'epic', emoji:'🐉', color:'#ff1744', unlockLevel:25, maxPuffLevel:25, levelUpCost:300000 },
        { puffId:'galaxy', name:'Galaxy Nebula', description:'La puissance d\'une galaxie.', priceSmoke:5000000, priceGems:300, multiplier:25, autoSmoke:400, critBonus:0.05, rarity:'epic', emoji:'🌌', color:'#7c4dff', unlockLevel:35, maxPuffLevel:30, levelUpCost:1500000 },
        { puffId:'golden', name:'Golden Vape', description:'La puff en or légendaire.', priceSmoke:25000000, priceGems:750, multiplier:50, autoSmoke:1000, critBonus:0.08, rarity:'legendary', emoji:'✨', color:'#ffd600', unlockLevel:50, maxPuffLevel:30, levelUpCost:8000000 },
        { puffId:'mythic_cloud', name:'Mythic Cloud', description:'Le nuage mythique ultime.', priceSmoke:100000000, priceGems:2000, multiplier:100, autoSmoke:5000, critBonus:0.1, rarity:'mythic', emoji:'☁️', color:'#ff6d00', unlockLevel:75, maxPuffLevel:50, levelUpCost:50000000 },
        { puffId:'divine_storm', name:'Divine Storm', description:'Tempête divine dévastatrice.', priceSmoke:1000000000, priceGems:5000, multiplier:250, autoSmoke:25000, critBonus:0.15, rarity:'divine', emoji:'⛈️', color:'#00e5ff', unlockLevel:100, maxPuffLevel:50, levelUpCost:500000000, requiresAscension:true },
        { puffId:'cosmic_void', name:'Cosmic Void', description:'Le vide cosmique infini.', priceSmoke:10000000000, priceGems:15000, multiplier:500, autoSmoke:100000, critBonus:0.2, rarity:'cosmic', emoji:'🕳️', color:'#ea80fc', unlockLevel:150, maxPuffLevel:100, levelUpCost:5000000000, requiresAscension:true },
      ]);
      console.log('✅ Puffs seeded');
    }

    // Seed Upgrades
    if (await Upgrade.countDocuments() === 0) {
      await Upgrade.insertMany([
        { upgradeId:'click_1', name:'Doigts Agiles', description:'+1 fumée/clic', basePrice:50, priceMultiplier:1.4, currency:'smoke', effect:'click_power', effectValue:1, maxLevel:100, category:'click', unlockLevel:1 },
        { upgradeId:'click_2', name:'Poumons d\'Acier', description:'+5 fumée/clic', basePrice:500, priceMultiplier:1.5, currency:'smoke', effect:'click_power', effectValue:5, maxLevel:50, category:'click', unlockLevel:5 },
        { upgradeId:'click_3', name:'Machine à Fumée', description:'+25 fumée/clic', basePrice:5000, priceMultiplier:1.6, currency:'smoke', effect:'click_power', effectValue:25, maxLevel:30, category:'click', unlockLevel:15 },
        { upgradeId:'click_4', name:'Tornade Digitale', description:'+100 fumée/clic', basePrice:50000, priceMultiplier:1.7, currency:'smoke', effect:'click_power', effectValue:100, maxLevel:20, category:'click', unlockLevel:30, requiresRebirth:1 },
        { upgradeId:'auto_1', name:'Ventilateur', description:'+1 fumée/sec', basePrice:100, priceMultiplier:1.4, currency:'smoke', effect:'auto_smoke', effectValue:1, maxLevel:100, category:'auto', unlockLevel:2 },
        { upgradeId:'auto_2', name:'Brumisateur', description:'+5 fumée/sec', basePrice:1000, priceMultiplier:1.5, currency:'smoke', effect:'auto_smoke', effectValue:5, maxLevel:50, category:'auto', unlockLevel:8 },
        { upgradeId:'auto_3', name:'Générateur de Brouillard', description:'+25 fumée/sec', basePrice:10000, priceMultiplier:1.6, currency:'smoke', effect:'auto_smoke', effectValue:25, maxLevel:30, category:'auto', unlockLevel:20 },
        { upgradeId:'auto_4', name:'Usine à Vapeur', description:'+100 fumée/sec', basePrice:100000, priceMultiplier:1.7, currency:'smoke', effect:'auto_smoke', effectValue:100, maxLevel:20, category:'auto', unlockLevel:35, requiresRebirth:1 },
        { upgradeId:'mult_1', name:'Double Aspiration', description:'+0.5x multi', basePrice:1000, priceMultiplier:2, currency:'smoke', effect:'multiplier', effectValue:0.5, maxLevel:20, category:'multiplier', unlockLevel:5 },
        { upgradeId:'mult_2', name:'Super Multiplicateur', description:'+1x multi', basePrice:50000, priceMultiplier:2.5, currency:'smoke', effect:'multiplier', effectValue:1, maxLevel:10, category:'multiplier', unlockLevel:15 },
        { upgradeId:'crit_1', name:'Oeil de Lynx', description:'+2% chance crit', basePrice:2000, priceMultiplier:2.0, currency:'smoke', effect:'crit_chance', effectValue:0.02, maxLevel:15, category:'critical', unlockLevel:7 },
        { upgradeId:'crit_2', name:'Frappe Dévastatrice', description:'+0.5x multi crit', basePrice:5000, priceMultiplier:2.2, currency:'smoke', effect:'crit_mult', effectValue:0.5, maxLevel:10, category:'critical', unlockLevel:12 },
        { upgradeId:'gem_rebirth', name:'Doigts Dorés', description:'+0.1x multi renaissance', basePrice:10, priceMultiplier:2, currency:'gems', effect:'rebirth_bonus', effectValue:0.1, maxLevel:50, category:'special', unlockLevel:10 },
        { upgradeId:'gem_auto', name:'Fumée Éternelle', description:'+10 fumée/sec', basePrice:5, priceMultiplier:1.8, currency:'gems', effect:'auto_smoke', effectValue:10, maxLevel:30, category:'special', unlockLevel:10 },
        { upgradeId:'gem_crit', name:'Chance Dorée', description:'+3% chance crit', basePrice:15, priceMultiplier:2.0, currency:'gems', effect:'crit_chance', effectValue:0.03, maxLevel:10, category:'special', unlockLevel:15 },
      ]);
      console.log('✅ Upgrades seeded');
    }

    // Seed Boxes
    if (await Box.countDocuments() === 0) {
      await Box.insertMany([
        {
          boxId:'basic_box', name:'Boîte Basique', description:'Un mélange de liquides communs.', priceSmoke:1000, priceGems:0, emoji:'📦', color:'#9e9e9e', unlockLevel:1,
          lootTable: [
            { name:'Menthe Fraîche', rarity:'common', multiplier:1.05, effect:'smoke_mult', effectValue:0, weight:50 },
            { name:'Tabac Classique', rarity:'common', multiplier:1.08, effect:'smoke_mult', effectValue:0, weight:40 },
            { name:'Fruit Rouge', rarity:'uncommon', multiplier:1.15, effect:'smoke_mult', effectValue:0, weight:8 },
            { name:'Vanille Royale', rarity:'rare', multiplier:1.3, effect:'click_power', effectValue:2, weight:2 },
          ]
        },
        {
          boxId:'premium_box', name:'Boîte Premium', description:'Des liquides de qualité supérieure.', priceSmoke:25000, priceGems:0, emoji:'🎁', color:'#7c4dff', unlockLevel:10,
          lootTable: [
            { name:'Pomme Verte', rarity:'common', multiplier:1.1, effect:'smoke_mult', effectValue:0, weight:35 },
            { name:'Mangue Glacée', rarity:'uncommon', multiplier:1.2, effect:'auto_smoke', effectValue:5, weight:30 },
            { name:'Kiwi Explosion', rarity:'rare', multiplier:1.4, effect:'click_power', effectValue:5, weight:20 },
            { name:'Litchi Doré', rarity:'epic', multiplier:1.7, effect:'crit_chance', effectValue:0.02, weight:10 },
            { name:'Nectar Divin', rarity:'legendary', multiplier:2.0, effect:'smoke_mult', effectValue:0, weight:5 },
          ]
        },
        {
          boxId:'legendary_box', name:'Boîte Légendaire', description:'Des liquides extrêmement rares.', priceSmoke:0, priceGems:50, emoji:'👑', color:'#ffd600', unlockLevel:20,
          lootTable: [
            { name:'Elixir de Fumée', rarity:'rare', multiplier:1.5, effect:'smoke_mult', effectValue:0, weight:30 },
            { name:'Nectar Astral', rarity:'epic', multiplier:2.0, effect:'crit_mult', effectValue:0.5, weight:30 },
            { name:'Essence Mythique', rarity:'legendary', multiplier:3.0, effect:'auto_smoke', effectValue:50, weight:20 },
            { name:'Larme de Dragon', rarity:'mythic', multiplier:5.0, effect:'smoke_mult', effectValue:0, weight:12 },
            { name:'Souffle Divin', rarity:'divine', multiplier:8.0, effect:'crit_chance', effectValue:0.1, weight:6 },
            { name:'Plasma Cosmique', rarity:'cosmic', multiplier:15.0, effect:'smoke_mult', effectValue:0, weight:2 },
          ]
        },
        {
          boxId:'cosmic_box', name:'Boîte Cosmique', description:'La boîte ultime de l\'univers.', priceSmoke:0, priceGems:200, emoji:'🌠', color:'#ea80fc', unlockLevel:50,
          lootTable: [
            { name:'Vapeur Stellaire', rarity:'epic', multiplier:3.0, effect:'smoke_mult', effectValue:0, weight:25 },
            { name:'Brume Galactique', rarity:'legendary', multiplier:5.0, effect:'auto_smoke', effectValue:200, weight:25 },
            { name:'Essence Céleste', rarity:'mythic', multiplier:8.0, effect:'crit_mult', effectValue:1, weight:20 },
            { name:'Fragment Divin', rarity:'divine', multiplier:15.0, effect:'smoke_mult', effectValue:0, weight:15 },
            { name:'Matière Noire', rarity:'cosmic', multiplier:25.0, effect:'smoke_mult', effectValue:0, weight:10 },
            { name:'Big Bang Liquid', rarity:'cosmic', multiplier:50.0, effect:'crit_chance', effectValue:0.15, weight:5 },
          ]
        },
      ]);
      console.log('✅ Boxes seeded');
    }
  } catch (err) {
    console.error('❌ Seed error:', err);
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
    app.listen(PORT, () => console.log(`🚀 Puff Clicker Simulator running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });
