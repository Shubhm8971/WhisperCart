const express = require('express');
const router = express.Router();
const cuelinksService = require('../utils/cuelinksService');
const meeshoService = require('../utils/meeshoService');
const ecommerceAggregator = require('../utils/ecommerceAggregator');

console.log('Product Search Route Loaded');

router.get('/', async (req, res) => {
  const { product, budget, features, store } = req.query;

  if (!product) {
    return res.status(400).json({ error: 'Query parameter "product" is required.' });
  }

  const budgetNum = budget ? parseFloat(budget) : null;
  console.log(`[Search] Query: "${product}" | Budget: ${budget} | Store: ${store} | Features: ${features}`);

  try {
    let results = [];

    // Priority 1: Try Meesho for budget products (highest commission)
    if (!store || store === 'meesho') {
      console.log('[Search] Checking Meesho...');
      const meeshoResults = await meeshoService.searchProducts(product, {
        maxPrice: budgetNum,
        limit: 5
      });
      results.push(...meeshoResults);
    }

    // Priority 2: Try CueLinks (covers Flipkart, Amazon, etc)
    if ((!store || store === 'flipkart' || store === 'amazon') && results.length < 10) {
      console.log('[Search] Checking CueLinks...');
      const marketplace = store === 'amazon' ? 'amazon' : 'flipkart';
      const cuelinksResults = await cuelinksService.searchProducts(product, {
        marketplace,
        maxPrice: budgetNum,
        limit: 10 - results.length
      });
      results.push(...cuelinksResults);
    }

    // Fallback: Use existing aggregator if needed
    if (results.length === 0) {
      console.log('[Search] Using fallback aggregator...');
      results = await ecommerceAggregator.searchMultistore(product, {
        maxPrice: budgetNum,
        store: store || 'flipkart',
        maxResults: 10
      });
    }

    // Filter by features if provided
    if (features) {
      const featureKeywords = features.split(',').map(f => f.trim().toLowerCase()).filter(f => f.length > 0);
      if (featureKeywords.length > 0) {
        results = results.filter(p => {
          const title = p.title.toLowerCase();
          return featureKeywords.some(keyword => title.includes(keyword));
        });
      }
    }

    // Deduplicate results
    const seen = new Set();
    results = results.filter(p => {
      const key = `${p.title.toLowerCase()}_${Math.floor(p.price / 100) * 100}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by rating then price
    results.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return a.price - b.price;
    });

    console.log(`[Search] Found ${results.length} results from multiple sources for "${product}"`);
    res.json(results);

  } catch (error) {
    console.error('[Search] Error:', error.message);
    
    // Fallback to mock data
    console.log('[Search] Using mock data for demo');
    const mockResults = cuelinksService.getMockResults(product, budgetNum);
    res.json(mockResults);
  }
});

module.exports = router;
