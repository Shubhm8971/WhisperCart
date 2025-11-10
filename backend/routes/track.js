const express = require('express');
const router = express.Router();

module.exports = () => {
  router.post('/', async (req, res) => {
    const { db } = req.app.locals;
    const { product } = req.body;

    if (!product || !product.id || !product.name || !product.price) {
      return res.status(400).json({ error: 'Product ID, name, and price are required for tracking.' });
    }

    try {
      const existingTrackedDeal = await db.collection('tracked_deals').findOne({ 'product.id': product.id });

      if (existingTrackedDeal) {
        return res.status(409).json({ message: 'Product is already being tracked.' });
      }

      const trackedDeal = {
        product: product,
        trackedAt: new Date(),
        // Add fields for price history, user ID, etc., as needed
      };

      await db.collection('tracked_deals').insertOne(trackedDeal);
      res.status(201).json({ message: 'Product added to tracking.', trackedDeal });
    } catch (error) {
      console.error('Error tracking deal:', error);
      res.status(500).json({ error: 'Failed to track deal.' });
    }
  });

  router.get('/', async (req, res) => {
    const { db } = req.app.locals;

    try {
      const trackedDeals = await db.collection('tracked_deals').find({}).toArray();
      res.status(200).json(trackedDeals);
    } catch (error) {
      console.error('Error fetching tracked deals:', error);
      res.status(500).json({ error: 'Failed to fetch tracked deals.' });
    }
  });

  return router;
};