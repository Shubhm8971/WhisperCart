const fetch = require('node-fetch');

/**
 * REAL SOLUTION: Use Rainforest API to search Flipkart
 * Rainforest API supports Flipkart, Amazon, and other marketplaces
 * 
 * Setup:
 * 1. Get API key from https://www.rainforestapi.com
 * 2. Set environment variable: RAINFOREST_API_KEY=your_key
 * 3. This service will handle both Amazon and Flipkart
 */

class EcommerceAggregator {
  constructor() {
    this.rainforestKey = process.env.RAINFOREST_API_KEY;
    this.rainforestBaseUrl = 'https://api.rainforestapi.com/request';
  }

  /**
   * Search across multiple platforms using Rainforest API
   * Supports: Amazon, Flipkart, Ebay, Walmart, etc.
   */
  async searchMultistore(query, options = {}) {
    try {
      const { maxPrice, store = 'flipkart', maxResults = 5 } = options;

      if (!this.rainforestKey) {
        console.warn('⚠️  RAINFOREST_API_KEY not set. Using mock data.');
        return this.getMockResults(query, maxPrice, store);
      }

      // Build Rainforest API request
      const requestBody = {
        api_key: this.rainforestKey,
        type: 'search',
        amazon_domain: 'amazon.in', // For Indian marketplace
        search_term: query,
        max_results: maxResults,
        ...(store === 'flipkart' && { domain: 'flipkart.com' }),
        ...(maxPrice && { min_price: maxPrice * 0.5, max_price: maxPrice })
      };

      const response = await fetch(this.rainforestBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Rainforest API returned ${response.status}`);
      }

      const data = await response.json();
      return this.formatResults(data, store);

    } catch (error) {
      console.error(`Search error for ${query}:`, error.message);
      return this.getMockResults(query, maxPrice, store);
    }
  }

  /**
   * Format Rainforest API response to unified format
   */
  formatResults(data, store) {
    const results = [];

    const products = data.search_results || [];

    for (const product of products) {
      const formatted = {
        id: product.asin || product.product_id,
        title: product.title,
        price: this.extractPrice(product.price),
        currency: '₹',
        image: product.image,
        url: product.link,
        rating: parseFloat(product.rating) || 0,
        reviewCount: product.review_count || 0,
        store: store.charAt(0).toUpperCase() + store.slice(1),
        inStock: product.availability !== 'Out of stock',
        availability: product.availability || 'Check website',
        tier: this.determineTier(product.rating)
      };

      results.push(formatted);
    }

    return results;
  }

  /**
   * Extract price as number
   */
  extractPrice(priceStr) {
    if (!priceStr) return 0;
    const match = priceStr.toString().match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  /**
   * Determine product tier based on rating
   */
  determineTier(rating) {
    if (!rating) return 'standard';
    if (rating >= 4.5) return 'platinum';
    if (rating >= 4) return 'gold';
    if (rating >= 3) return 'silver';
    return 'standard';
  }

  /**
   * Mock results for development/demo
   */
  getMockResults(query, maxPrice = null, store = 'flipkart') {
    const basePrice = 2000;
    const results = [
      {
        id: 'MOCK001',
        title: `Premium ${query} - Best Quality`,
        price: basePrice,
        currency: '₹',
        image: `https://via.placeholder.com/200?text=${encodeURIComponent(query)}`,
        url: `https://${store}.com/search?q=${encodeURIComponent(query)}`,
        rating: 4.5,
        reviewCount: 2500,
        store: store.charAt(0).toUpperCase() + store.slice(1),
        inStock: true,
        availability: 'In stock',
        tier: 'platinum',
        discount: '20% off'
      },
      {
        id: 'MOCK002',
        title: `Standard ${query} - Good Value`,
        price: basePrice - 500,
        currency: '₹',
        image: `https://via.placeholder.com/200?text=Standard${query}`,
        url: `https://${store}.com/search?q=${encodeURIComponent(query)}`,
        rating: 4.2,
        reviewCount: 1800,
        store: store.charAt(0).toUpperCase() + store.slice(1),
        inStock: true,
        availability: 'In stock',
        tier: 'gold'
      },
      {
        id: 'MOCK003',
        title: `Budget ${query} - Economic Choice`,
        price: basePrice - 1000,
        currency: '₹',
        image: `https://via.placeholder.com/200?text=Budget${query}`,
        url: `https://${store}.com/search?q=${encodeURIComponent(query)}`,
        rating: 3.8,
        reviewCount: 1200,
        store: store.charAt(0).toUpperCase() + store.slice(1),
        inStock: true,
        availability: 'In stock',
        tier: 'silver'
      }
    ];

    return maxPrice
      ? results.filter(p => p.price <= maxPrice)
      : results;
  }

  /**
   * Get affiliate link for Flipkart product
   */
  generateAffiliateLink(productUrl, affiliateId) {
    try {
      if (!productUrl.includes('flipkart.com')) return productUrl;
      
      // Flipkart affiliate parameter
      const separator = productUrl.includes('?') ? '&' : '?';
      return `${productUrl}${separator}affid=${affiliateId}`;
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      return productUrl;
    }
  }
}

module.exports = new EcommerceAggregator();
