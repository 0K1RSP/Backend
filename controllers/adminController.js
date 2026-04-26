const User = require('../models/User');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Log = require('../models/Log');
const Puff = require('../models/Puff');

exports.getDashboard = async (req, res) => {
  try {
    const totalPlayers = await User.countDocuments();
    const onlinePlayers = await User.countDocuments({ online: true });
    const bannedCount = await User.countDocuments({ banned: true });
    const totalSmoke = await User.aggregate([{ $group: { _id: null, total: { $sum: '$allTimeSmoke' } } }]);
    const totalGems = await User.aggregate([{ $group: { _id: null, total: { $sum: '$totalGems' } } }]);
    const activeEvents = await Event.countDocuments({ active: true, endTime: { $gte: new Date() } });

    res.json({
      totalPlayers, onlinePlayers, bannedCount,
      totalSmoke: totalSmoke[0]?.total || 0,
      totalGems: totalGems[0]?.total || 0,
      activeEvents
    });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.getPlayers = async (req, res) => {
  try {
    const players = await User.find({}).select('-password').sort({ lastSave: -1 });
    res.json({ players });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.getOnlinePlayers = async (req, res) => {
  try {
    const players = await User.find({ online: true }).select('username level smoke gems currentPuff lastSave rebirthCount ascensionCount').sort({ lastSave: -1 });
    res.json({ players, count: players.length });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.modifyPlayer = async (req, res) => {
  try {
    const { playerId, field, value } = req.body;
    const allowed = ['smoke','gems','totalSmoke','totalGems','allTimeSmoke','smokePerClick','smokePerSecond','clickMultiplier','critChance','critMultiplier','rebirthCount','rebirthMultiplier','rebirthTokens','ascensionCount','ascensionMultiplier','ascensionPower','level','experience'];
    if (!allowed.includes(field)) return res.status(400).json({ error: 'Champ non modifiable.' });

    const user = await User.findById(playerId);
    if (!user) return res.status(404).json({ error: 'Joueur non trouvé.' });
    user[field] = Number(value);
    await user.save();

    await Log.create({ action: 'admin_modify', userId: req.user.id, username: req.user.username, details: `Modified ${user.username}: ${field} = ${value}` });
    res.json({ message: `${field} de ${user.username} mis à jour.` });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.giveItems = async (req, res) => {
  try {
    const { playerId, type, amount, puffId } = req.body;
    const user = await User.findById(playerId);
    if (!user) return res.status(404).json({ error: 'Joueur non trouvé.' });

    switch (type) {
      case 'smoke': user.smoke += Number(amount); user.totalSmoke += Number(amount); user.allTimeSmoke += Number(amount); break;
      case 'gems': user.gems += Number(amount); user.totalGems += Number(amount); break;
      case 'puff': if (puffId && !user.inventory.includes(puffId)) { user.inventory.push(puffId); user.puffLevels.set(puffId, 1); } break;
      default: return res.status(400).json({ error: 'Type invalide.' });
    }
    await user.save();

    await Log.create({ action: 'admin_give', userId: req.user.id, username: req.user.username, details: `Gave ${user.username}: ${type} ${amount || puffId}` });
    res.json({ message: `Items donnés à ${user.username}.` });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.banPlayer = async (req, res) => {
  try {
    const { playerId, ban } = req.body;
    const user = await User.findById(playerId);
    if (!user) return res.status(404).json({ error: 'Joueur non trouvé.' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Impossible de bannir un admin.' });
    user.banned = !!ban;
    user.online = false;
    await user.save();

    await Log.create({ action: ban ? 'admin_ban' : 'admin_unban', userId: req.user.id, username: req.user.username, details: `${ban ? 'Banned' : 'Unbanned'} ${user.username}` });
    res.json({ message: `${user.username} ${ban ? 'banni' : 'débanni'}.` });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.createEvent = async (req, res) => {
  try {
    const { type, name, description, bonusMultiplier, durationHours } = req.body;
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + (durationHours || 1));

    const event = new Event({
      eventId: `event_${Date.now()}`, type, name,
      description: description || '', bonusMultiplier: bonusMultiplier || 2,
      startTime: new Date(), endTime, createdBy: req.user.username
    });
    await event.save();

    await Log.create({ action: 'admin_event', userId: req.user.id, username: req.user.username, details: `Created: ${name} (${type}, x${bonusMultiplier}, ${durationHours}h)` });
    res.json({ message: 'Événement créé.', event });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.endEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findOne({ eventId });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé.' });
    event.active = false; event.endTime = new Date();
    await event.save();
    res.json({ message: 'Événement terminé.' });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ startTime: -1 }).limit(50);
    res.json({ events });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.sendAnnouncement = async (req, res) => {
  try {
    const { message, type, durationHours } = req.body;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (durationHours || 24));

    const announcement = new Announcement({ message, type: type || 'info', expiresAt, createdBy: req.user.username });
    await announcement.save();

    await Log.create({ action: 'admin_announce', userId: req.user.id, username: req.user.username, details: `Announcement: ${message}` });
    res.json({ message: 'Annonce envoyée.', announcement });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};

exports.getLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json({ logs });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur.' }); }
};
