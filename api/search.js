// api/search.js - Serverless search endpoint
const config = require('../backend/config');
const rainforestService = require('../backend/utils/rainforestService');
const cuelinksService = require('../backend/utils/cuelinksService');

export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  }

  try {
    const { q: query, budget, maxPrice } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`[Search] Query: ${query}, Budget: ${budget}`);

    // Try services in order
    let results = [];

    // Try CueLinks first (if available)
    if (config.cuelinksApiKey) {
      try {
        results = await cuelinksService.searchProducts(query, {
          maxPrice: budget ? parseInt(budget) : maxPrice,
          limit: 10
        });
        if (results.length > 0) {
          console.log(`✅ CueLinks returned ${results.length} results`);
          return res.json({ 
            success: true, 
            source: 'CueLinks',
            count: results.length,
            products: results 
          });
        }
      } catch (error) {
        console.log('CueLinks failed, trying Rainforest...');
      }
    }

    // Fallback to Rainforest
    if (config.rainforestApiKey) {
      try {
        results = await rainforestService.searchProducts(query, {
          maxPrice: budget ? parseInt(budget) : maxPrice,
          limit: 10
        });
        if (results.length > 0) {
          console.log(`✅ Rainforest returned ${results.length} results`);
          return res.json({ 
            success: true, 
            source: 'Rainforest',
            count: results.length,
            products: results 
          });
        }
      } catch (error) {
        console.log('Rainforest failed');
      }
    }

    // Return mock data as last resort
    const mockResults = [
      {
        asin: 'mock-1',
        title: `${query} - Premium Model`,
        image: 'https://via.placeholder.com/300',
        price: { raw: `₹${Math.min(parseInt(budget || 50000), 49999)}`, value: Math.min(parseInt(budget || 50000), 49999) },
        rating: 4.5,
        reviewsCount: 234,
        store: 'Amazon',
        link: 'https://amazon.in/s?k=' + encodeURIComponent(query)
      },
      {
        asin: 'mock-2',
        title: `${query} - Budget Friendly`,
        image: 'https://via.placeholder.com/300',
        price: { raw: `₹${Math.max(parseInt(budget || 5000) * 0.7, 1999)}`, value: Math.max(parseInt(budget || 5000) * 0.7, 1999) },
        rating: 4.2,
        reviewsCount: 156,
        store: 'Flipkart',
        link: 'https://flipkart.com/search?q=' + encodeURIComponent(query)
      }
    ];

    res.json({ 
      success: true, 
      source: 'Mock Data',
      count: mockResults.length,
      products: mockResults 
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};
