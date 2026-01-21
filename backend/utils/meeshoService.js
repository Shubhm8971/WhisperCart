const fetch = require('node-fetch');

/**
 * Meesho API Service - Budget E-commerce Platform
 * 
 * Features: High commission (4-15%), Budget products, Real API
 * Target: ₹100-₹3000 price range (perfect for "under ₹2000" queries)
 * Setup: https://meesho.app/ → Business Account → Affiliate Program
 * 
 * Environment Variables:
 * - MEESHO_API_KEY
 * - MEESHO_AFFILIATE_ID
 * - MEESHO_API_URL (default: https://api.meesho.com)
 */

class MeeshoService {
  constructor() {
    this.apiKey = process.env.MEESHO_API_KEY;
    this.affiliateId = process.env.MEESHO_AFFILIATE_ID;
    this.baseUrl = process.env.MEESHO_API_URL || 'https://api.meesho.com/v2';
  }

  /**
   * Search products on Meesho
   * BEST FOR: Budget products (₹100-₹3000)
   * COMMISSION: 4-15% (highest in India)
   */
  async searchProducts(query, options = {}) {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ MEESHO_API_KEY not set. Using mock data.');
        return this.getMockResults(query, options);
      }

      const { maxPrice, limit = 10 } = options;

      const payload = {
        q: query,
        limit,
        sort: 'popularity',
        ...(maxPrice && { maxPrice })
      };

      const response = await fetch(`${this.baseUrl}/search/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'WhisperCart/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Meesho API returned ${response.status}`);
      }

      const data = await response.json();
      return this.formatResults(data.products || data.data || []);

    } catch (error) {
      console.error(`Meesho search error: ${error.message}`);
      return this.getMockResults(query, options);
    }
  }

  /**
   * Format Meesho API response to standard format
   */
  formatResults(products) {
    return products.map(product => {
      const price = this.parsePrice(product.selling_price || product.price);
      const originalPrice = this.parsePrice(product.original_price);
      const discount = originalPrice > 0 
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      return {
        id: product.product_id || product.id,
        title: product.name || product.title,
        price,
        originalPrice,
        discount: `${discount}% off`,
        currency: '₹',
        image: product.images?.[0] || product.image,
        rating: parseFloat(product.rating) || 0,
        reviews: product.reviews_count || product.review_count || 0,
        url: this.generateAffiliateLink(product),
        store: 'Meesho',
        inStock: product.status !== 'OUT_OF_STOCK',
        tier: this.determineTier(parseFloat(product.rating) || 0),
        commission: '4-15%',
        commissionRange: {
          min: 4,
          max: 15,
          estimated: this.estimateCommission(price)
        },
        category: product.category || 'General',
        supplier: product.supplier_name || 'Meesho Supplier'
      };
    });
  }

  /**
   * Estimate commission based on product price
   */
  estimateCommission(price) {
    // Budget products have higher commission
    if (price < 500) return 12; // ₹60 on ₹500
    if (price < 1000) return 10; // ₹100 on ₹1000
    if (price < 2000) return 8; // ₹160 on ₹2000
    if (price < 5000) return 6; // ₹300 on ₹5000
    return 4; // Premium products
  }

  /**
   * Generate Meesho affiliate link
   */
  generateAffiliateLink(product) {
    try {
      const productUrl = product.product_url || product.url;
      if (!productUrl) return null;

      // Meesho affiliate format
      if (this.affiliateId) {
        const separator = productUrl.includes('?') ? '&' : '?';
        // Add affiliate tracking parameters
        return `${productUrl}${separator}utm_source=whispercart&utm_medium=affiliate&utm_id=${this.affiliateId}`;
      }

      return productUrl;
    } catch (error) {
      console.error('Error generating Meesho affiliate link:', error);
      return product.product_url || product.url;
    }
  }

  /**
   * Search for products under specific budget
   * PERFECT FOR: "I want crocs under ₹2000"
   */
  async searchBudget(query, maxPrice) {
    return this.searchProducts(query, { maxPrice, limit: 10 });
  }

  /**
   * Get trending products (good for recommendations)
   */
  async getTrendingProducts(category = 'general', limit = 10) {
    try {
      if (!this.apiKey) {
        return this.getMockTrending();
      }

      const response = await fetch(`${this.baseUrl}/trending`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, limit })
      });

      if (!response.ok) throw new Error('Failed to fetch trending');
      const data = await response.json();
      return this.formatResults(data.products || []);

    } catch (error) {
      console.error('Trending products error:', error);
      return this.getMockTrending();
    }
  }

  /**
   * Get product by ID with full details
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
        affiliateUrl: this.generateAffiliateLink(data),
        estimatedCommission: this.estimateCommission(
          this.parsePrice(data.selling_price || data.price)
        )
      };

    } catch (error) {
      console.error('Product details error:', error);
      return null;
    }
  }

  /**
   * Get top suppliers for a category (for future supplier partnerships)
   */
  async getTopSuppliers(category, limit = 10) {
    try {
      if (!this.apiKey) return [];

      const response = await fetch(`${this.baseUrl}/suppliers/top`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, limit })
      });

      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();

    } catch (error) {
      console.error('Suppliers error:', error);
      return [];
    }
  }

  /**
   * Parse price handling various formats
   */
  parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;

    const match = price.toString().match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  /**
   * Determine product tier based on rating
   */
  determineTier(rating) {
    if (rating >= 4.5) return 'platinum';
    if (rating >= 4) return 'gold';
    if (rating >= 3) return 'silver';
    return 'standard';
  }

  /**
   * Mock results for development (when API key not set)
   */
  getMockResults(query, options = {}) {
    const { maxPrice = 2000, limit = 10 } = options;
    const basePrice = Math.min(maxPrice * 0.8, 1500);

    const results = [
      {
        id: 'MESH001',
        title: `Premium ${query} - Best Seller`,
        price: Math.floor(basePrice),
        originalPrice: Math.floor(basePrice * 1.4),
        discount: '30% off',
        currency: '₹',
        image: `https://via.placeholder.com/200?text=${encodeURIComponent(query)}`,
        rating: 4.6,
        reviews: 3200,
        url: `https://www.meesho.com/search?q=${encodeURIComponent(query)}`,
        store: 'Meesho',
        inStock: true,
        tier: 'platinum',
        commission: '4-15%',
        commissionRange: {
          min: 4,
          max: 15,
          estimated: 12
        },
        category: 'Lifestyle',
        supplier: 'Top Meesho Seller'
      },
      {
        id: 'MESH002',
        title: `${query} - Great Value`,
        price: Math.floor(basePrice - 200),
        originalPrice: Math.floor(basePrice * 1.3),
        discount: '25% off',
        currency: '₹',
        image: `https://via.placeholder.com/200?text=Value`,
        rating: 4.3,
        reviews: 2100,
        url: `https://www.meesho.com/search?q=${encodeURIComponent(query)}`,
        store: 'Meesho',
        inStock: true,
        tier: 'gold',
        commission: '4-15%',
        commissionRange: {
          min: 4,
          max: 15,
          estimated: 10
        },
        category: 'Lifestyle',
        supplier: 'Verified Seller'
      }
    ];

    return results.slice(0, limit);
  }

  getMockTrending() {
    return [
      {
        id: 'TREND001',
        title: 'Trending Fashion Item',
        price: 799,
        originalPrice: 1199,
        discount: '33% off',
        currency: '₹',
        rating: 4.7,
        reviews: 5000,
        store: 'Meesho',
        commission: '4-15%'
      }
    ];
  }
}

module.exports = new MeeshoService();
