const express = require('express');
const router = express.Router();
const dealNegotiationEngine = require('../utils/dealNegotiationEngine');
const llmService = require('../utils/llmService');

/**
 * POST /negotiate/generate
 * Generate negotiation offers for a product
 */
router.post('/generate', async (req, res) => {
  try {
    const { product, preferredStrategy = 'moderate' } = req.body;

    if (!product || !product.price) {
      return res.status(400).json({ error: 'Product with price is required' });
    }

    console.log(`[Negotiation] Generating offers for: ${product.title || product.name}`);

    // Generate all offers
    const offers = await dealNegotiationEngine.generateOffers(product);

    // Track this negotiation
    dealNegotiationEngine.trackNegotiation(product.id || 'unknown', preferredStrategy);

    res.json({
      productId: product.id,
      productTitle: product.title || product.name,
      originalPrice: product.price,
      offers,
      recommendation: offers[preferredStrategy],
      strategies: Object.keys(offers).map((key) => ({
        name: key,
        offer: offers[key].offer,
        probability: offers[key].probability,
        whyItWorks: offers[key].whyItWorks,
      })),
    });
  } catch (error) {
    console.error('[Negotiation] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /negotiate/message
 * Generate a negotiation message to send to seller
 */
router.post('/message', async (req, res) => {
  try {
    const { product, strategy = 'moderate' } = req.body;

    if (!product) {
      return res.status(400).json({ error: 'Product is required' });
    }

    console.log(`[Negotiation] Generating message for: ${product.title || product.name}`);

    const message = await dealNegotiationEngine.generateNegotiationMessage(product, strategy);

    res.json({
      productId: product.id,
      message,
      nextSteps: [
        '1. Copy the message above',
        '2. Send to seller via chat/DM',
        '3. Wait for response (typically 1-2 hours)',
        '4. If seller agrees, purchase immediately!',
        '5. If not, try our escalation service',
      ],
      escalationAvailable: true,
    });
  } catch (error) {
    console.error('[Negotiation] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /negotiate/submit
 * Submit a negotiation attempt (track success)
 */
router.post('/submit', (req, res) => {
  try {
    const { productId, strategy = 'moderate', outcome = 'sent' } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const stats = dealNegotiationEngine.trackNegotiation(productId, strategy, outcome);

    console.log(`[Negotiation] Tracked: ${productId} | ${strategy} | ${outcome}`);

    res.json({
      success: true,
      tracked: {
        productId,
        strategy,
        outcome,
      },
      strategyStats: stats,
      message: outcome === 'success' ? '🎉 Great deal! Enjoy your purchase!' : 'Negotiation tracked',
    });
  } catch (error) {
    console.error('[Negotiation] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /negotiate/stats
 * Get negotiation success statistics
 */
router.get('/stats', (req, res) => {
  try {
    const topStrategies = dealNegotiationEngine.getTopStrategies();

    res.json({
      topStrategies,
      insights: {
        bestStrategy: topStrategies[0]?.strategy || 'friendly',
        message:
          'Friendly negotiation works best! Most sellers respond positively to respectful requests.',
      },
    });
  } catch (error) {
    console.error('[Negotiation] Stats Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /negotiate/escalate
 * Escalate to WhisperCart support team for negotiation
 */
router.post('/escalate', async (req, res) => {
  try {
    const { productId, productTitle, currentPrice, desiredPrice, sellerContact, reason } = req.body;

    if (!productId || !productTitle) {
      return res.status(400).json({ error: 'productId and productTitle required' });
    }

    console.log(`[Negotiation] Escalation requested: ${productTitle}`);

    res.json({
      success: true,
      escalationId: `ESC_${productId}_${Date.now()}`,
      status: 'Escalation submitted',
      nextSteps: {
        timeline: '1-2 hours',
        action: 'Our team will contact the seller',
        update: 'You\'ll get a notification with any new offers',
      },
      guarantee: 'If we can\'t negotiate, we refund your transaction fee',
      supportEmail: 'support@whispercart.com',
    });
  } catch (error) {
    console.error('[Negotiation] Escalation Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Legacy: POST /negotiate
 * Original conversational negotiation (kept for compatibility)
 */
router.post('/', async (req, res) => {
  const { product, budget, messages } = req.body;

  if (!product || !product.name || !product.price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }
  if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'A messages array is required.' });
  }

  try {
    // Call the new LLM function for conversational negotiation
    const negotiationResponse = await llmService.generateConversationalNegotiationWithLLM(
      product,
      budget,
      messages
    );

    if (!negotiationResponse || !negotiationResponse.responseText) {
      throw new Error('Failed to generate negotiation response from LLM.');
    }

    res.json({
      responseText: negotiationResponse.responseText,
      proposedPrice: negotiationResponse.proposedPrice,
      dealAccepted: negotiationResponse.dealAccepted
    });

  } catch (error) {
    console.error('Error during negotiation:', error);
    res.status(500).json({ error: 'Failed to negotiate deal.' });
  }
});

module.exports = router;