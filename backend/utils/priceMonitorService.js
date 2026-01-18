const { MongoClient } = require('mongodb');
const config = require('../config');

/**
 * Wishlist Price Monitor Service
 * Periodically checks the wishlist for price drops and triggers notifications.
 */
function startPriceMonitor(db) {
    console.log('[v7.0] Wishlist Price Monitor Service Started');

    // Check every 30 seconds for the demo
    setInterval(async () => {
        try {
            const wishlist = await db.collection('wishlist').find({}).toArray();

            if (wishlist.length === 0) return;

            console.log(`[v7.0] Checking prices for ${wishlist.length} items...`);

            for (const item of wishlist) {
                // Randomly simulate a price drop (10% chance)
                if (Math.random() > 0.9) {
                    const oldPrice = item.price.value;
                    const dropAmount = Math.floor(oldPrice * (0.05 + Math.random() * 0.1));
                    const newPrice = oldPrice - dropAmount;

                    const notification = {
                        id: 'pd-' + Date.now() + '-' + item.asin,
                        type: 'price_drop',
                        title: 'Price Drop Alert! 📉',
                        message: `Good news! "${item.title}" just dropped from ₹${oldPrice} to ₹${newPrice}. Get it before it's gone!`,
                        time: 'Just now',
                        isRead: false,
                        createdAt: new Date(),
                        productName: item.title,
                        asin: item.asin
                    };

                    await db.collection('notifications').insertOne(notification);
                    console.log(`[v7.0] Price Drop Notification triggered for: ${item.title}`);
                }
            }
        } catch (e) {
            console.error('Price Monitor Error:', e);
        }
    }, 30000);
}

module.exports = { startPriceMonitor };
