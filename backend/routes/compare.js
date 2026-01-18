const express = require('express');
const router = express.Router();
const llmService = require('../utils/llmService');

/**
 * POST /compare
 * Compare multiple products and generate AI analysis
 */
router.post('/', async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length < 2) {
        return res.status(400).json({ error: 'Please provide at least 2 products to compare.' });
    }

    if (products.length > 3) {
        return res.status(400).json({ error: 'Maximum 3 products can be compared at once.' });
    }

    console.log(`[v7.0] Comparing ${products.length} products...`);

    try {
        const comparison = await llmService.generateProductComparison(products);
        res.json(comparison);
    } catch (error) {
        console.error('Comparison Error:', error.message);
        res.status(500).json({ error: 'Failed to generate comparison.' });
    }
});

module.exports = router;
