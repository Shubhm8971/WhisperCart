const express = require('express');
const router = express.Router();
const History = require('../models/History');
const Notification = require('../models/Notification');
const PrivacyAudit = require('..//models/PrivacyAudit');

/**
 * PRIVACY DATA MANAGEMENT ENDPOINTS
 * These endpoints handle user data privacy requests
 */

// Get user's privacy data summary
router.get('/summary/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Get all voice recordings and history for user using Mongoose models
    const voiceRecordings = await History.find({
      userId: userId,
      raw_text: { $exists: true }
    });

    const shoppingHistory = await History.find({
      userId: userId,
      product: { $exists: true, $ne: null }
    });

    const notifications = await Notification.find({
      userId: userId
    });

    const summary = {
      voiceRecordingsCount: voiceRecordings.length,
      shoppingHistoryCount: shoppingHistory.length,
      notificationsCount: notifications.length,
      lastActivity: voiceRecordings.length > 0 ? 
        voiceRecordings[voiceRecordings.length - 1].createdAt : null,
      dataRetentionDays: 30, // Configurable retention period
    };

    res.json(summary);

  } catch (error) {
    console.error('Error fetching privacy summary:', error);
    res.status(500).json({ error: 'Failed to fetch privacy summary' });
  }
});

// Delete all user data (GDPR compliance)
router.delete('/delete-all/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Delete from all collections using Mongoose models
    const historyResult = await History.deleteMany({ userId });
    const notificationsResult = await Notification.deleteMany({ userId });
    
    // Add to audit log using Mongoose model
    await PrivacyAudit.create({
      userId,
      action: 'DELETE_ALL_DATA',
      timestamp: new Date(),
      recordsDeleted: {
        history: historyResult.deletedCount,
        notifications: notificationsResult.deletedCount
      }
    });

    res.json({
      message: 'All user data deleted successfully',
      deletedRecords: {
        history: historyResult.deletedCount,
        notifications: notificationsResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

// Delete voice recordings only (keep shopping history)
router.delete('/delete-voice/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Delete only voice recordings, preserve shopping intent data using Mongoose model
    const result = await History.deleteMany({
      userId,
      product: { $exists: false }
    });

    // Add to audit log using Mongoose model
    await PrivacyAudit.create({
      userId,
      action: 'DELETE_VOICE_RECORDINGS',
      timestamp: new Date(),
      recordsDeleted: result.deletedCount
    });

    res.json({
      message: 'Voice recordings deleted successfully',
      deletedRecords: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting voice recordings:', error);
    res.status(500).json({ error: 'Failed to delete voice recordings' });
  }
});

// Export user data (GDPR data portability)
router.get('/export/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await History.find({ userId });
    const notifications = await Notification.find({ userId });

    const exportData = {
      userId,
      exportDate: new Date(),
      history: history.map(item => ({
        type: 'shopping_intent',
        product: item.product,
        budget: item.budget,
        features: item.features,
        timestamp: item.createdAt,
        isPrivacyMode: item.isPrivacyMode
      })),
      notifications: notifications.map(item => ({
        type: item.type,
        title: item.title,
        message: item.message,
        timestamp: item.createdAt,
        isRead: item.isRead
      }))
    };

    res.json(exportData);

  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// Auto-cleanup old data (retention policy)
router.post('/cleanup-old-data', async (req, res) => {
  const { retentionDays = 30 } = req.body;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Delete old non-shopping voice data using Mongoose model
    const voiceCleanupResult = await History.deleteMany({
      createdAt: { $lt: cutoffDate },
      product: { $exists: false }
    });

    // Delete old notifications using Mongoose model
    const notificationCleanupResult = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.json({
      message: 'Old data cleanup completed',
      deletedRecords: {
        voiceData: voiceCleanupResult.deletedCount,
        notifications: notificationCleanupResult.deletedCount
      },
      retentionDays
    });

  } catch (error) {
    console.error('Error during data cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup old data' });
  }
});

// Get privacy audit log for user
router.get('/audit-log/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const auditLog = await PrivacyAudit.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(auditLog);

  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

module.exports = router;
