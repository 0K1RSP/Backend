const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/dashboard', ac.getDashboard);
router.get('/players', ac.getPlayers);
router.get('/online', ac.getOnlinePlayers);
router.post('/modifyPlayer', ac.modifyPlayer);
router.post('/giveItems', ac.giveItems);
router.post('/banPlayer', ac.banPlayer);
router.post('/createEvent', ac.createEvent);
router.post('/endEvent', ac.endEvent);
router.get('/events', ac.getEvents);
router.post('/announcement', ac.sendAnnouncement);
router.get('/logs', ac.getLogs);

module.exports = router;
