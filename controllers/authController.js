const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');

const ADMIN_USERNAME = 'ansaru';
const ADMIN_PASSWORD = 'ansarudev';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Le nom d\'utilisateur doit faire entre 3 et 20 caractères.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris.' });
    }

    const role = (username.toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) ? 'admin' : 'player';

    const user = new User({
      username: username.toLowerCase(),
      password,
      role,
      inventory: ['basic'],
      currentPuff: 'basic'
    });

    await user.save();

    const token = generateToken(user);

    await Log.create({
      action: 'signup',
      userId: user._id,
      username: user.username,
      details: `New user registered`,
      ip: req.ip
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        smoke: user.smoke,
        gems: user.gems
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
};

exports.login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('Login error: JWT_SECRET missing in environment');
      return res.status(500).json({ error: 'Configuration serveur manquante (JWT_SECRET).' });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    const user = await User.findOne({ username: String(username).toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
    } catch (e) {
      console.error('Password compare error:', e);
      return res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    // Promote admin if credentials match
    let roleChanged = false;
    if (String(username).toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD && user.role !== 'admin') {
      user.role = 'admin';
      roleChanged = true;
    }

    // Persist online + eventual role change. Failure here must not break login.
    try {
      user.online = true;
      await user.save({ validateModifiedOnly: true });
    } catch (saveErr) {
      console.error('Login save warning:', saveErr.message);
      if (roleChanged) {
        try {
          await User.updateOne({ _id: user._id }, { $set: { role: 'admin', online: true } });
        } catch (fallbackErr) {
          console.error('Login fallback update error:', fallbackErr.message);
        }
      } else {
        try {
          await User.updateOne({ _id: user._id }, { $set: { online: true } });
        } catch {}
      }
    }

    const token = generateToken(user);

    // Log is best-effort
    Log.create({
      action: 'login',
      userId: user._id,
      username: user.username,
      details: 'User logged in',
      ip: req.ip
    }).catch(e => console.error('Log login error:', e.message));

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        smoke: user.smoke,
        gems: user.gems
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};

exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { online: false });
    res.json({ message: 'Déconnexion réussie.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
