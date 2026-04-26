const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'totalSmoke', limit = 20 } = req.query;

    const validTypes = ['totalSmoke', 'totalGems', 'level', 'clicks', 'prestigeLevel'];
    const sortField = validTypes.includes(type) ? type : 'totalSmoke';

    const users = await User.find({})
      .select('username totalSmoke totalGems level clicks prestigeLevel currentPuff')
      .sort({ [sortField]: -1 })
      .limit(Math.min(parseInt(limit), 100));

    res.json({
      type: sortField,
      leaderboard: users.map((u, index) => ({
        rank: index + 1,
        username: u.username,
        totalSmoke: u.totalSmoke,
        totalGems: u.totalGems,
        level: u.level,
        clicks: u.clicks,
        prestigeLevel: u.prestigeLevel,
        currentPuff: u.currentPuff
      }))
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
