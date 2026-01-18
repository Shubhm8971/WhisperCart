const mongoose = require('mongoose');

const PrivacyAuditSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: Object,
  },
});

module.exports = mongoose.model('PrivacyAudit', PrivacyAuditSchema);
