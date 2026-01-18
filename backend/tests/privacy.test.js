const request = require('supertest');
const { app } = require('../server');
const History = require('../models/History');
const Notification = require('../models/Notification');
const PrivacyAudit = require('../models/PrivacyAudit');

describe('Privacy Routes', () => {
  beforeEach(async () => {
    // Clean up test data
    await History.deleteMany({});
    await Notification.deleteMany({});
    await PrivacyAudit.deleteMany({});
  });

  describe('GET /privacy/summary/:userId', () => {
    it('should return privacy data summary', async () => {
      const userId = 'test-user-123';
      
      // Insert test data
      await History.insertMany([
        { userId, raw_text: 'I want to buy shoes', product: 'shoes', createdAt: new Date() },
        { userId, raw_text: 'Hello world', createdAt: new Date() }
      ]);
      
      await Notification.insertOne({
        userId,
        type: 'price_drop',
        title: 'Deal Found',
        createdAt: new Date()
      });

      const response = await request(app)
        .get(`/privacy/summary/${userId}`)
        .expect(200);

      expect(response.body.voiceRecordingsCount).toBe(2);
      expect(response.body.shoppingHistoryCount).toBe(1);
      expect(response.body.notificationsCount).toBe(1);
    });

    it('should return zero counts for new user', async () => {
      const userId = 'new-user-456';
      
      const response = await request(app)
        .get(`/privacy/summary/${userId}`)
        .expect(200);

      expect(response.body.voiceRecordingsCount).toBe(0);
      expect(response.body.shoppingHistoryCount).toBe(0);
      expect(response.body.notificationsCount).toBe(0);
    });
  });

  describe('DELETE /privacy/delete-all/:userId', () => {
    it('should delete all user data', async () => {
      const userId = 'test-user-789';
      
      // Insert test data
      await History.insertOne({ userId, raw_text: 'test' });
      await Notification.insertOne({ userId, type: 'test' });

      const response = await request(app)
        .delete(`/privacy/delete-all/${userId}`)
        .expect(200);

      expect(response.body.message).toBe('All user data deleted successfully');
      expect(response.body.deletedRecords.history).toBe(1);
      expect(response.body.deletedRecords.notifications).toBe(1);

      // Verify data is deleted
      const historyCount = await History.countDocuments({ userId });
      const notificationCount = await Notification.countDocuments({ userId });
      
      expect(historyCount).toBe(0);
      expect(notificationCount).toBe(0);

      // Check audit log
      const auditEntry = await PrivacyAudit.findOne({ userId });
      expect(auditEntry.action).toBe('DELETE_ALL_DATA');
    });
  });

  describe('DELETE /privacy/delete-voice/:userId', () => {
    it('should delete only voice recordings, preserve shopping history', async () => {
      const userId = 'test-user-voice';
      
      // Insert test data
      await History.insertMany([
        { userId, raw_text: 'I want shoes', product: 'shoes' }, // Shopping intent
        { userId, raw_text: 'Hello world' } // Non-shopping
      ]);

      const response = await request(app)
        .delete(`/privacy/delete-voice/${userId}`)
        .expect(200);

      expect(response.body.deletedRecords).toBe(1);

      // Verify only non-shopping data is deleted
      const remainingItems = await History.find({ userId });
      expect(remainingItems).toHaveLength(1);
      expect(remainingItems[0].product).toBe('shoes');
    });
  });

  describe('GET /privacy/export/:userId', () => {
    it('should export user data in portable format', async () => {
      const userId = 'export-user';
      
      // Insert test data
      await History.insertOne({
        userId,
        product: 'shoes',
        budget: 2000,
        features: ['comfortable'],
        createdAt: new Date('2024-01-01')
      });

      const response = await request(app)
        .get(`/privacy/export/${userId}`)
        .expect(200);

      expect(response.body.userId).toBe(userId);
      expect(response.body.history).toHaveLength(1);
      expect(response.body.history[0].type).toBe('shopping_intent');
      expect(response.body.history[0].product).toBe('shoes');
      expect(response.body.exportDate).toBeDefined();
    });
  });

  describe('POST /privacy/cleanup-old-data', () => {
    it('should clean up old data based on retention policy', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago
      
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5); // 5 days ago

      // Insert test data
      await History.insertMany([
        { userId: 'user1', raw_text: 'old data', createdAt: oldDate },
        { userId: 'user2', raw_text: 'recent data', createdAt: recentDate }
      ]);

      await Notification.insertOne({
        userId: 'user1',
        type: 'test',
        createdAt: oldDate
      });

      const response = await request(app)
        .post('/privacy/cleanup-old-data')
        .send({ retentionDays: 30 })
        .expect(200);

      expect(response.body.deletedRecords.voiceData).toBe(1);
      expect(response.body.deletedRecords.notifications).toBe(1);

      // Verify recent data remains
      const remainingHistory = await History.countDocuments();
      const remainingNotifications = await Notification.countDocuments();
      
      expect(remainingHistory).toBe(1);
      expect(remainingNotifications).toBe(0);
    });
  });
});
