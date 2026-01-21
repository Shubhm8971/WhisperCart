const fetch = require('node-fetch');
const config = require('../config');

/**
 * CueLinks Service - Indian Affiliate Network
 * 
 * Supports: Flipkart, Amazon, Myntra, Jabong, etc.
 * Commission: 1-10%
 * Setup: https://www.cuelinks.com/signup
 * 
 * Environment Variable: CUELINKS_API_KEY
 */

class CueLinksService {
  constructor() {
    this.apiKey = config.cuelinksApiKey;
    this.baseUrl = config.cuelinksBaseUrl;
    this.affiliateId = process.env.CUELINKS_AFFILIATE_ID;
  }

  /**
   * Search products across CueLinks merchants (Flipkart, Amazon, etc)
   */
  async searchProducts(query, options = {}) {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ CUELINKS_API_KEY not set. Using fallback method.');
        return this.getMockResults(query, options);
      }

      const { maxPrice, marketplace = 'flipkart', limit = 10 } = options;

      // CueLinks API call
      const response = await fetch(`${this.baseUrl}/products/search`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Marketplace': marketplace
        }
      });

      if (!response.ok) {
        throw new Error(`CueLinks API returned ${response.status}`);
      }

      const data = await response.json();
      let results = this.formatResults(data, marketplace);

      // Filter by price if specified
      if (maxPrice) {
        results = results.filter(p => p.price <= maxPrice);
      }

      return results.slice(0, limit);

    } catch (error) {
      console.error(`CueLinks search error: ${error.message}`);
      return this.getMockResults(query, options);
    }
  }

  /**
   * Format CueLinks API response
   */
  formatResults(data, marketplace) {
    const products = data.products || [];

    return products.map(product => ({
      id: product.product_id || product.id,
      title: product.name || product.title,
      price: this.parsePrice(product.price || product.selling_price),
      currency: '₹',
      image: product.image || product.images?.[0],
      rating: parseFloat(product.rating) || 0,
      reviews: product.review_count || 0,
      url: this.generateAffiliateUrl(product),
      store: marketplace.charAt(0).toUpperCase() + marketplace.slice(1),
      inStock: product.in_stock !== false,
      tier: this.determineTier(parseFloat(product.rating) || 0),
      commission: product.commission || '3-5%'
    }));
  }

  /**
   * Generate CueLinks affiliate URL
   */
  generateAffiliateUrl(product) {
    try {
      const productUrl = product.url || product.product_url;
      if (!productUrl) return null;

      // CueLinks format: https://cuelinks.com/click/[PRODUCT_ID]
      // Or direct product URL with parameters
      if (this.affiliateId) {
        const separator = productUrl.includes('?') ? '&' : '?';
        return `${productUrl}${separator}ref=cuelinks_${this.affiliateId}`;
      }

      return productUrl;
    } catch (error) {
      console.error('Error generating CueLinks URL:', error);
      return product.url || product.product_url;
    }
  }

  /**
   * Search specific marketplace via CueLinks
   */
  async searchFlipkart(query, maxPrice = null) {
    return this.searchProducts(query, {
      marketplace: 'flipkart',
      maxPrice,
      limit: 10
    });
  }

  async searchAmazon(query, maxPrice = null) {
    return this.searchProducts(query, {
      marketplace: 'amazon',
      maxPrice,
      limit: 10
    });
  }

  async searchMyntra(query, maxPrice = null) {
    return this.searchProducts(query, {
      marketplace: 'myntra',
      maxPrice,
      limit: 10
    });
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(category = 'electronics') {
    try {
      if (!this.apiKey) {
        return this.getMockTrending();
      }

      const response = await fetch(`${this.baseUrl}/trending/${category}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      if (!response.ok) throw new Error('Failed to fetch trending');
      const data = await response.json();
      return this.formatResults(data, 'flipkart');

    } catch (error) {
      console.error('Trending products error:', error);
      return this.getMockTrending();
    }
  }

  /**
   * Get product details with commission info
   */
  async getProductDetails(productId) {
    try {
      if (!this.apiKey) return null;

      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();

      return {
        ...data,
        affiliateUrl: this.generateAffiliateUrl(data),
        commission: data.commission || '3-5%'
      };

    } catch (error) {
      console.error('Product details error:', error);
      return null;
    }
  }

  /**
   * Parse price from various formats
   */
  parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;

    const match = price.toString().match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  /**
   * Determine product tier
   */
  determineTier(rating) {
    if (rating >= 4.5) return 'platinum';
    if (rating >= 4) return 'gold';
    if (rating >= 3) return 'silver';
    return 'standard';
  }

  /**
   * Mock results for development
   */
  getMockResults(query, options = {}) {
    const { maxPrice, marketplace = 'flipkart', limit = 10 } = options;
    const basePrice = 2500;

    const results = [
      {
        id: 'CUEL001',
        title: `Premium ${query} - Best Quality`,
        price: basePrice,
        currency: '₹',
        image: `https://via.placeholder.com/200?text=${encodeURIComponent(query)}`,
        rating: 4.5,
        reviews: 2500,
        url: `https://${marketplace}.com/search?q=${encodeURIComponent(query)}`,
        store: marketplace.charAt(0).toUpperCase() + marketplace.slice(1),
        inStock: true,
        tier: 'platinum',
        commission: '4-5%'
      },
      {
        id: 'CUEL002',
        title: `${query} - Great Value`,
        price: basePrice - 500,
        currency: '₹',
        image: `https://via.placeholder.com/200?text=Value`,
        rating: 4.2,
        reviews: 1800,
        url: `https://${marketplace}.com/search?q=${encodeURIComponent(query)}`,
        store: marketplace.charAt(0).toUpperCase() + marketplace.slice(1),
        inStock: true,
        tier: 'gold',
        commission: '3-4%'
      }
    ];

    return maxPrice
      ? results.filter(p => p.price <= maxPrice).slice(0, limit)
      : results.slice(0, limit);
  }

  getMockTrending() {
    return [
      {
        id: 'TREND001',
        title: 'Trending Electronics',
        price: 3999,
        currency: '₹',
        rating: 4.6,
        reviews: 5000
      }
    ];
  }
}

module.exports = new CueLinksService();
