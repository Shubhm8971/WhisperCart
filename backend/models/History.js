const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },

  // Voice Interactions
  voiceSearches: [{
    raw_text: String,
    detected_intent: {
      action: String, // 'search', 'checkout', 'wishlist'
      product: String,
      budget: Number,
      features: [String],
      urgency: String,
      context: String, // 'personal', 'gift', 'work'
      purchaseIntent: String, // 'browsing', 'interested', 'ready_to_buy'
      brand: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Product Searches
  productSearches: [{
    query: String,
    category: String,
    budget: Number,
    results_count: Number,
    filters_applied: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Negotiation Interactions
  negotiations: [{
    product: {
      name: String,
      original_price: Number,
      store: String
    },
    conversation: [{
      sender: String, // 'user' or 'ai'
      message: String,
      timestamp: Date
    }],
    final_price: Number,
    savings: Number,
    successful: Boolean,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Purchase Tracking (for future use)
  purchases: [{
    product: String,
    price: Number,
    original_price: Number,
    savings: Number,
    store: String,
    category: String,
    affiliate_link: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Analytics Data
  analytics: {
    total_voice_searches: {
      type: Number,
      default: 0
    },
    total_product_searches: {
      type: Number,
      default: 0
    },
    total_negotiations: {
      type: Number,
      default: 0
    },
    total_purchases: {
      type: Number,
      default: 0
    },
    total_spent: {
      type: Number,
      default: 0
    },
    total_savings: {
      type: Number,
      default: 0
    },
    favorite_categories: [String],
    favorite_brands: [String],
    preferred_stores: [String],
    avg_budget: Number,
    last_activity: {
      type: Date,
      default: Date.now
    }
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
HistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for performance
HistorySchema.index({ user: 1, 'analytics.last_activity': -1 });
HistorySchema.index({ 'voiceSearches.timestamp': -1 });
HistorySchema.index({ 'productSearches.timestamp': -1 });

module.exports = mongoose.model('History', HistorySchema);
