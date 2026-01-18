const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { db } = req.app.locals;
    try {
        const notifications = await db.collection('notifications')
            .find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.post('/read/:id', async (req, res) => {
    const { db } = req.app.locals;
    const { id } = req.params;
    try {
        await db.collection('notifications').updateOne(
            { id: id },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

module.exports = router;
