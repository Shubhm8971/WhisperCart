/**
 * AI Deal Negotiation Engine
 * 
 * Features:
 * - Auto-generates negotiation offers based on market price
 * - Creates personalized haggle messages
 * - Tracks negotiation success rate
 * - Escalates to support if needed
 * - Viral-worthy feature!
 */

const fetch = require('node-fetch');

class DealNegotiationEngine {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.negotiationHistory = new Map(); // In-memory for now
  }

  /**
   * Main function: Generate negotiation offers for a product
   * Returns multiple offer strategies
   */
  async generateOffers(product) {
    try {
      const { title, price, originalPrice, rating, reviews } = product;

      // Calculate discount potential
      const discountPotential = this.calculateDiscountPotential(
        price,
        originalPrice,
        rating
      );

      // Generate multiple negotiation strategies
      const offers = {
        aggressive: this.generateAggressiveOffer(price, discountPotential),
        moderate: this.generateModerateOffer(price, discountPotential),
        friendly: this.generateFriendlyOffer(price, discountPotential),
        bundleOffer: this.generateBundleOffer(product),
        reviewBased: this.generateReviewBasedOffer(price, rating, reviews),
      };

      // Use AI to make offers more natural (if API key available)
      if (this.openaiKey) {
        return await this.polishOffersWithAI(offers, product);
      }

      return offers;
    } catch (error) {
      console.error('Error generating offers:', error);
      return this.getFallbackOffers(product.price);
    }
  }

  /**
   * Calculate how much discount is realistically possible
   */
  calculateDiscountPotential(currentPrice, originalPrice, rating) {
    let potential = 0;

    // If product has original price, use that as reference
    if (originalPrice && originalPrice > currentPrice) {
      potential = Math.floor(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    // High-rated products: seller confident, less likely to negotiate
    if (rating >= 4.5) {
      potential = Math.max(potential, 5); // At least 5% off
    } else if (rating >= 4.0) {
      potential = Math.max(potential, 10);
    } else if (rating >= 3.5) {
      potential = Math.max(potential, 15);
    } else {
      potential = Math.max(potential, 20); // Low rated: more negotiable
    }

    return Math.min(potential, 30); // Cap at 30% max
  }

  /**
   * Aggressive offer: Ask for significant discount
   * Best for: Low-rated products, high-price items
   */
  generateAggressiveOffer(price, potentialDiscount) {
    const targetPrice = Math.floor(price * (1 - potentialDiscount / 100));
    const discount = price - targetPrice;

    return {
      strategy: 'aggressive',
      offer: `Can you do ₹${targetPrice}?`,
      reasoning: `Direct price reduction of ₹${discount}`,
      probability: potentialDiscount > 15 ? 'Medium' : 'Low',
      message: `I'm interested but can you offer this for ₹${targetPrice}? I'll buy immediately.`,
      whyItWorks: 'Direct and clear, shows serious intent',
    };
  }

  /**
   * Moderate offer: Reasonable middle-ground
   * Best for: Most products
   */
  generateModerateOffer(price, potentialDiscount) {
    const mediumDiscount = Math.floor(potentialDiscount * 0.6);
    const targetPrice = Math.floor(price * (1 - mediumDiscount / 100));
    const discount = price - targetPrice;

    return {
      strategy: 'moderate',
      offer: `Is ₹${targetPrice} possible?`,
      reasoning: `Realistic discount of ₹${discount} (~${mediumDiscount}%)`,
      probability: 'High',
      message: `This looks good! Would you be able to offer this at ₹${targetPrice}? I'm ready to purchase.`,
      whyItWorks: 'Reasonable, shows you did research',
    };
  }

  /**
   * Friendly offer: Builds relationship, asks for help
   * Best for: Building long-term customer relationship
   */
  generateFriendlyOffer(price, potentialDiscount) {
    const smallDiscount = Math.floor(potentialDiscount * 0.3);
    const targetPrice = Math.floor(price * (1 - smallDiscount / 100));

    return {
      strategy: 'friendly',
      offer: `Best price you can offer?`,
      reasoning: `Opens dialogue, builds relationship`,
      probability: 'Very High',
      message: `Hi! I really like this product. What's the best price you can offer me right now? I'm ready to buy.`,
      whyItWorks: 'Friendly, non-aggressive, invites dialogue',
    };
  }

  /**
   * Bundle offer: Buy multiple items for better discount
   */
  generateBundleOffer(product) {
    const halfPrice = Math.floor(product.price * 0.5);
    const bundlePrice = Math.floor(product.price * 1.8);

    return {
      strategy: 'bundle',
      offer: `Buy 2 for ₹${bundlePrice}?`,
      reasoning: 'Higher volume = better margin for seller',
      probability: 'High',
      message: `If I buy 2 of these, can you do both for ₹${bundlePrice}? (₹${Math.floor(bundlePrice / 2)} each)`,
      whyItWorks: 'Sellers love volume, win-win deal',
    };
  }

  /**
   * Review-based offer: Use low ratings as leverage
   */
  generateReviewBasedOffer(price, rating, reviews) {
    let offer = null;
    let reasoning = null;

    if (rating < 3.5 && reviews > 100) {
      const newPrice = Math.floor(price * 0.75);
      offer = `Can you do ₹${newPrice} given the mixed reviews?`;
      reasoning = `Low rating (${rating}/5) on ${reviews} reviews = buyer risk`;
    } else if (rating < 4.0 && reviews > 50) {
      const newPrice = Math.floor(price * 0.8);
      offer = `₹${newPrice} considering the reviews?`;
      reasoning = `Average rating (${rating}/5) = less buyer confidence`;
    } else {
      const newPrice = Math.floor(price * 0.85);
      offer = `Any room on the price given current reviews?`;
      reasoning = 'Neutral: polite, doesn\'t blame seller';
    }

    return {
      strategy: 'reviewBased',
      offer,
      reasoning,
      probability: rating < 3.5 ? 'High' : 'Medium',
      message: offer,
      whyItWorks: 'Factual, shows you read reviews, legitimate concern',
    };
  }

  /**
   * Polish offers with AI to make them more human-like
   */
  async polishOffersWithAI(offers, product) {
    try {
      const prompt = `Make these negotiation offers sound more natural and persuasive for an Indian e-commerce seller. Keep them brief (1 line max). Product: ${product.title}
      
      Current offers:
      ${JSON.stringify(offers, null, 2)}
      
      Return improved versions that are friendly, genuine, and likely to get a yes.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        return offers; // Return original if API fails
      }

      const data = await response.json();
      const polishedText = data.choices[0].message.content;

      // Parse and merge with original offers
      // For now, return original offers (AI polish is optional)
      return offers;
    } catch (error) {
      console.error('AI polish error:', error);
      return offers; // Return original offers if AI fails
    }
  }

  /**
   * Generate persuasive negotiation message to send to seller
   */
  async generateNegotiationMessage(product, strategy = 'moderate') {
    const offers = await this.generateOffers(product);
    const selectedOffer = offers[strategy] || offers.moderate;

    return {
      subject: `Price inquiry for: ${product.title.substring(0, 50)}`,
      body: selectedOffer.message,
      followUp: this.generateFollowUp(strategy),
      escalationText: this.generateEscalationOffer(),
    };
  }

  /**
   * Generate follow-up message if seller doesn't respond
   */
  generateFollowUp(strategy) {
    const followUps = {
      aggressive:
        "I really want this product. Is there any way you can meet my price? I'm a serious buyer.",
      moderate:
        'Let me know if this works for you. I can complete the purchase immediately.',
      friendly:
        'No pressure! Just let me know if you can work with me on the price.',
      bundle:
        'Buying in bulk helps both of us. Can we make this happen?',
      reviewBased:
        'I want to make sure I get good quality. Can we work out a fair price?',
    };

    return followUps[strategy] || followUps.moderate;
  }

  /**
   * Offer to escalate to customer support for negotiation
   */
  generateEscalationOffer() {
    return {
      text: 'Still interested? Let our team help negotiate!',
      action: 'Escalate to WhisperCart Support',
      benefit: 'Our team will contact the seller on your behalf',
      timeline: 'Response within 2 hours',
    };
  }

  /**
   * Fallback offers if something fails
   */
  getFallbackOffers(price) {
    const mediumPrice = Math.floor(price * 0.85);
    const lowPrice = Math.floor(price * 0.7);

    return {
      aggressive: {
        strategy: 'aggressive',
        offer: `Can you do ₹${lowPrice}?`,
        probability: 'Low',
        message: `Can you offer this at ₹${lowPrice}?`,
      },
      moderate: {
        strategy: 'moderate',
        offer: `Is ₹${mediumPrice} possible?`,
        probability: 'High',
        message: `Would ₹${mediumPrice} work for you?`,
      },
      friendly: {
        strategy: 'friendly',
        offer: `Best price available?`,
        probability: 'Very High',
        message: `Hi! What's your best price for this item?`,
      },
    };
  }

  /**
   * Track negotiation attempt and success
   */
  trackNegotiation(productId, strategy, outcome = 'sent') {
    const key = `${productId}_${strategy}`;
    const existing = this.negotiationHistory.get(key) || {
      attempts: 0,
      successes: 0,
      avgDiscount: 0,
    };

    existing.attempts += 1;
    if (outcome === 'success') existing.successes += 1;

    this.negotiationHistory.set(key, existing);
    return existing;
  }

  /**
   * Get success rate for a negotiation strategy
   */
  getStrategyStats(strategy) {
    let total = 0,
      successes = 0;

    for (const [key, data] of this.negotiationHistory.entries()) {
      if (key.includes(strategy)) {
        total += data.attempts;
        successes += data.successes;
      }
    }

    return {
      strategy,
      attempts: total,
      successes,
      successRate: total > 0 ? ((successes / total) * 100).toFixed(1) + '%' : 'N/A',
    };
  }

  /**
   * Get insights on which strategies work best
   */
  getTopStrategies() {
    const strategies = ['aggressive', 'moderate', 'friendly', 'bundle', 'reviewBased'];
    const stats = strategies.map((s) => this.getStrategyStats(s));

    return stats.sort((a, b) => {
      const aRate = parseFloat(a.successRate) || 0;
      const bRate = parseFloat(b.successRate) || 0;
      return bRate - aRate;
    });
  }
}

module.exports = new DealNegotiationEngine();
