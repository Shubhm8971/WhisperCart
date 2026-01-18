const express = require('express');
const router = express.Router();
const History = require('../models/History'); // Import the History Mongoose model

router.get('/', async (req, res) => {
  try {
    // Use the Mongoose model directly
    const history = await History.find({}).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

module.exports = router;

