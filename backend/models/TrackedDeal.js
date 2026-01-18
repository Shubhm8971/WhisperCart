const mongoose = require('mongoose');

const TrackedDealSchema = new mongoose.Schema({
  product: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    link: { type: String },
  },
  trackedAt: {
    type: Date,
    default: Date.now,
  },
  userId: { // Assuming we'll add user authentication later
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('TrackedDeal', TrackedDealSchema);
