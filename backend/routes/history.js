const express = require('express');
const router = express.Router();
const History = require('../models/History');
const authenticate = require('../middleware/auth');

console.log('Shopping History Route Loaded');

// @desc    Get user history and analytics
// @route   GET /api/history
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let history = await History.findOne({ user: req.user.id });

    // Create history document if it doesn't exist
    if (!history) {
      history = await History.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: {
        voiceSearches: history.voiceSearches.slice(-10), // Last 10 voice searches
        productSearches: history.productSearches.slice(-10), // Last 10 product searches
        negotiations: history.negotiations.slice(-5), // Last 5 negotiations
        analytics: history.analytics
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
});

// @desc    Track voice search
// @route   POST /api/history/voice
// @access  Private
router.post('/voice', authenticate, async (req, res) => {
  try {
    const { raw_text, detected_intent } = req.body;

    if (!raw_text || !detected_intent) {
      return res.status(400).json({
        success: false,
        error: 'raw_text and detected_intent are required'
      });
    }

    let history = await History.findOne({ user: req.user.id });

    if (!history) {
      history = await History.create({ user: req.user.id });
    }

    // Add voice search
    history.voiceSearches.push({
      raw_text,
      detected_intent,
      timestamp: new Date()
    });

    // Update analytics
    history.analytics.total_voice_searches += 1;
    history.analytics.last_activity = new Date();

    // Keep only last 50 voice searches
    if (history.voiceSearches.length > 50) {
      history.voiceSearches = history.voiceSearches.slice(-50);
    }

    await history.save();

    res.status(201).json({
      success: true,
      message: 'Voice search tracked successfully'
    });
  } catch (error) {
    console.error('Track voice search error:', error);
    res.status(500).json({ success: false, error: 'Failed to track voice search' });
  }
});

// @desc    Track product search
// @route   POST /api/history/search
// @access  Private
router.post('/search', authenticate, async (req, res) => {
  try {
    const { query, category, budget, results_count, filters_applied } = req.body;

    let history = await History.findOne({ user: req.user.id });

    if (!history) {
      history = await History.create({ user: req.user.id });
    }

    // Add product search
    history.productSearches.push({
      query,
      category,
      budget,
      results_count,
      filters_applied: filters_applied || [],
      timestamp: new Date()
    });

    // Update analytics
    history.analytics.total_product_searches += 1;
    history.analytics.last_activity = new Date();

    // Keep only last 50 product searches
    if (history.productSearches.length > 50) {
      history.productSearches = history.productSearches.slice(-50);
    }

    await history.save();

    res.status(201).json({
      success: true,
      message: 'Product search tracked successfully'
    });
  } catch (error) {
    console.error('Track product search error:', error);
    res.status(500).json({ success: false, error: 'Failed to track product search' });
  }
});

// @desc    Track negotiation
// @route   POST /api/history/negotiation
// @access  Private
router.post('/negotiation', authenticate, async (req, res) => {
  try {
    const { product, conversation, final_price, savings, successful } = req.body;

    if (!product || !conversation) {
      return res.status(400).json({
        success: false,
        error: 'product and conversation are required'
      });
    }

    let history = await History.findOne({ user: req.user.id });

    if (!history) {
      history = await History.create({ user: req.user.id });
    }

    // Add negotiation
    history.negotiations.push({
      product,
      conversation,
      final_price,
      savings: savings || 0,
      successful: successful || false,
      timestamp: new Date()
    });

    // Update analytics
    history.analytics.total_negotiations += 1;
    history.analytics.total_savings += (savings || 0);
    history.analytics.last_activity = new Date();

    // Keep only last 20 negotiations
    if (history.negotiations.length > 20) {
      history.negotiations = history.negotiations.slice(-20);
    }

    await history.save();

    res.status(201).json({
      success: true,
      message: 'Negotiation tracked successfully'
    });
  } catch (error) {
    console.error('Track negotiation error:', error);
    res.status(500).json({ success: false, error: 'Failed to track negotiation' });
  }
});

// @desc    Track purchase (for future use)
// @route   POST /api/history/purchase
// @access  Private
router.post('/purchase', authenticate, async (req, res) => {
  try {
    const { product, price, original_price, savings, store, category, affiliate_link } = req.body;

    let history = await History.findOne({ user: req.user.id });

    if (!history) {
      history = await History.create({ user: req.user.id });
    }

    // Add purchase
    history.purchases.push({
      product,
      price,
      original_price,
      savings: savings || 0,
      store,
      category,
      affiliate_link,
      timestamp: new Date()
    });

    // Update analytics
    history.analytics.total_purchases += 1;
    history.analytics.total_spent += (price || 0);
    history.analytics.total_savings += (savings || 0);
    history.analytics.last_activity = new Date();

    await history.save();

    res.status(201).json({
      success: true,
      message: 'Purchase tracked successfully'
    });
  } catch (error) {
    console.error('Track purchase error:', error);
    res.status(500).json({ success: false, error: 'Failed to track purchase' });
  }
});

// @desc    Get analytics summary
// @route   GET /api/history/analytics
// @access  Private
router.get('/analytics', authenticate, async (req, res) => {
  try {
    let history = await History.findOne({ user: req.user.id });

    if (!history) {
      history = await History.create({ user: req.user.id });
    }

    // Calculate additional analytics
    const analytics = {
      ...history.analytics,
      voice_searches_today: history.voiceSearches.filter(search =>
        new Date(search.timestamp).toDateString() === new Date().toDateString()
      ).length,
      product_searches_today: history.productSearches.filter(search =>
        new Date(search.timestamp).toDateString() === new Date().toDateString()
      ).length,
      negotiations_this_week: history.negotiations.filter(neg =>
        new Date(neg.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      avg_negotiation_savings: history.negotiations.length > 0 ?
        history.negotiations.reduce((sum, neg) => sum + (neg.savings || 0), 0) / history.negotiations.length : 0
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

// @desc    Clear user history
// @route   DELETE /api/history
// @access  Private
router.delete('/', authenticate, async (req, res) => {
  try {
    const { type } = req.query; // 'all', 'voice', 'searches', 'negotiations'

    let history = await History.findOne({ user: req.user.id });

    if (!history) {
      return res.status(404).json({ success: false, error: 'History not found' });
    }

    switch (type) {
      case 'voice':
        history.voiceSearches = [];
        history.analytics.total_voice_searches = 0;
        break;
      case 'searches':
        history.productSearches = [];
        history.analytics.total_product_searches = 0;
        break;
      case 'negotiations':
        history.negotiations = [];
        history.analytics.total_negotiations = 0;
        history.analytics.total_savings = 0;
        break;
      case 'all':
      default:
        history.voiceSearches = [];
        history.productSearches = [];
        history.negotiations = [];
        history.purchases = [];
        history.analytics = {
          total_voice_searches: 0,
          total_product_searches: 0,
          total_negotiations: 0,
          total_purchases: 0,
          total_spent: 0,
          total_savings: 0,
          favorite_categories: [],
          favorite_brands: [],
          preferred_stores: [],
          avg_budget: 0,
          last_activity: new Date()
        };
        break;
    }

    await history.save();

    res.status(200).json({
      success: true,
      message: `History cleared successfully (${type || 'all'})`
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear history' });
  }
});

module.exports = router;
