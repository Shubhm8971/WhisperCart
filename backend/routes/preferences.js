const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/auth');

console.log('User Preferences Route Loaded');

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return preferences with defaults if not set
    const preferences = {
      favoriteCategories: user.preferences?.favoriteCategories || [],
      favoriteBrands: user.preferences?.favoriteBrands || [],
      budgetRanges: user.preferences?.budgetRanges || { min: 0, max: 50000 },
      preferredStores: user.preferences?.preferredStores || [],
      notificationsEnabled: user.preferences?.notificationsEnabled ?? true
    };

    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to get preferences' });
  }
});

// @desc    Update user preferences
// @route   PUT /api/preferences
// @access  Private
router.put('/', authenticate, async (req, res) => {
  try {
    const {
      favoriteCategories,
      favoriteBrands,
      budgetRanges,
      preferredStores,
      notificationsEnabled
    } = req.body;

    // Validate budget ranges
    if (budgetRanges) {
      if (budgetRanges.min < 0 || budgetRanges.max < budgetRanges.min) {
        return res.status(400).json({
          success: false,
          error: 'Invalid budget ranges'
        });
      }
    }

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'preferences.favoriteCategories': favoriteCategories || [],
          'preferences.favoriteBrands': favoriteBrands || [],
          'preferences.budgetRanges': budgetRanges || { min: 0, max: 50000 },
          'preferences.preferredStores': preferredStores || [],
          'preferences.notificationsEnabled': notificationsEnabled ?? true,
          'preferences.updatedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedUser.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// @desc    Add favorite category
// @route   POST /api/preferences/favorites/categories
// @access  Private
router.post('/favorites/categories', authenticate, async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: { 'preferences.favoriteCategories': category },
        $set: { 'preferences.updatedAt': new Date() }
      },
      { new: true }
    ).select('preferences.favoriteCategories');

    res.status(200).json({
      success: true,
      data: updatedUser.preferences.favoriteCategories,
      message: `${category} added to favorites`
    });
  } catch (error) {
    console.error('Add favorite category error:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite category' });
  }
});

// @desc    Add favorite brand
// @route   POST /api/preferences/favorites/brands
// @access  Private
router.post('/favorites/brands', authenticate, async (req, res) => {
  try {
    const { brand } = req.body;

    if (!brand) {
      return res.status(400).json({
        success: false,
        error: 'Brand is required'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: { 'preferences.favoriteBrands': brand },
        $set: { 'preferences.updatedAt': new Date() }
      },
      { new: true }
    ).select('preferences.favoriteBrands');

    res.status(200).json({
      success: true,
      data: updatedUser.preferences.favoriteBrands,
      message: `${brand} added to favorites`
    });
  } catch (error) {
    console.error('Add favorite brand error:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite brand' });
  }
});

// @desc    Remove favorite category
// @route   DELETE /api/preferences/favorites/categories/:category
// @access  Private
router.delete('/favorites/categories/:category', authenticate, async (req, res) => {
  try {
    const { category } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { 'preferences.favoriteCategories': category },
        $set: { 'preferences.updatedAt': new Date() }
      },
      { new: true }
    ).select('preferences.favoriteCategories');

    res.status(200).json({
      success: true,
      data: updatedUser.preferences.favoriteCategories,
      message: `${category} removed from favorites`
    });
  } catch (error) {
    console.error('Remove favorite category error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite category' });
  }
});

// @desc    Remove favorite brand
// @route   DELETE /api/preferences/favorites/brands/:brand
// @access  Private
router.delete('/favorites/brands/:brand', authenticate, async (req, res) => {
  try {
    const { brand } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { 'preferences.favoriteBrands': brand },
        $set: { 'preferences.updatedAt': new Date() }
      },
      { new: true }
    ).select('preferences.favoriteBrands');

    res.status(200).json({
      success: true,
      data: updatedUser.preferences.favoriteBrands,
      message: `${brand} removed from favorites`
    });
  } catch (error) {
    console.error('Remove favorite brand error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite brand' });
  }
});

module.exports = router;
