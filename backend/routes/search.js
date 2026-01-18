const express = require('express');
const router = express.Router();
const rainforestService = require('../utils/rainforestService');

console.log('Product Search Route Loaded');

router.get('/', async (req, res) => {
  const { product, budget, features } = req.query; // Add features

  if (!product) {
    return res.status(400).json({ error: 'Query parameter "product" is required.' });
  }

  console.log(`[v6.0] Multi-Store Search: "${product}" | Budget: ${budget} | Features: ${features}`);

  try {
    let results = await rainforestService.searchProducts(product);

    // Filter by budget if provided
    if (budget) {
      const numericBudget = parseFloat(budget.toString().replace(/,/g, ''));
      if (!isNaN(numericBudget)) {
        results = results.filter(p => p.price.value <= numericBudget && p.price.value > 0);
      }
    }

    // Filter by features if provided
    if (features) {
      const featureKeywords = features.split(',').map(f => f.trim().toLowerCase()).filter(f => f.length > 0);
      if (featureKeywords.length > 0) {
        results = results.filter(p => {
          const title = p.title.toLowerCase();
          // Check if the product title contains any of the feature keywords
          return featureKeywords.some(keyword => title.includes(keyword));
        });
      }
    }

    console.log(`[v6.0] Found ${results.length} multi-store results`);
    res.json(results);

  } catch (error) {
    console.error('[v6.0] Search Route Error:', error.message);

    // Return mock data for demo purposes
    console.log('[v6.0] Returning mock search results for demo');
    const mockResults = [
      {
        asin: 'MOCK001',
        title: 'Nike Running Shoes - Perfect for your search!',
        image: 'https://loremflickr.com/320/240/nike-shoes',
        price: { raw: '₹2,499', value: 2499 },
        link: 'https://example.com/nike-shoes',
        rating: '4.5',
        reviewsCount: 1250,
        store: 'Demo Store',
        color: '#1976d2',
        tier: 'gold'
      },
      {
        asin: 'MOCK002',
        title: 'Adidas Sports Shoes - Great alternative!',
        image: 'https://loremflickr.com/320/240/adidas-shoes',
        price: { raw: '₹3,299', value: 3299 },
        link: 'https://example.com/adidas-shoes',
        rating: '4.2',
        reviewsCount: 890,
        store: 'Demo Store',
        color: '#1976d2',
        tier: 'silver'
      }
    ];

    res.json(mockResults);
  }
});

module.exports = router;
