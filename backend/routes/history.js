const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { db } = req.app.locals;
  try {
    const history = await db.collection('history').find({}).sort({ createdAt: -1 }).toArray();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

module.exports = router;
