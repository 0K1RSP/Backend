const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['info','warning','event','update'], default: 'info' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  createdBy: { type: String, default: 'admin' }
});

module.exports = mongoose.model('Announcement', announcementSchema);
