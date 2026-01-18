const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  raw_text: {
    type: String,
    required: true,
  },
  product: {
    type: String,
  },
  budget: {
    type: Number,
  },
  features: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('History', HistorySchema);
