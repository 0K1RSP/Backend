const express = require('express');
const router = express.Router();
const gc = require('../controllers/gameController');
const { auth } = require('../middleware/auth');

router.get('/getData', auth, gc.getData);
router.post('/click', auth, gc.click);
router.post('/collectAuto', auth, gc.collectAutoSmoke);
router.post('/buyUpgrade', auth, gc.buyUpgrade);
router.post('/buyPuff', auth, gc.buyPuff);
router.post('/equipPuff', auth, gc.equipPuff);
router.post('/levelUpPuff', auth, gc.levelUpPuff);
router.post('/openBox', auth, gc.openBox);
router.post('/equipLiquid', auth, gc.equipLiquid);
router.post('/sellLiquid', auth, gc.sellLiquid);
router.post('/claimQuest', auth, gc.claimQuest);
router.post('/claimAchievement', auth, gc.claimAchievement);
router.post('/prestige', auth, gc.prestige);
router.post('/ascend', auth, gc.ascend);
router.post('/buyBuff', auth, gc.buyBuff);
router.post('/save', auth, gc.save);

module.exports = router;
