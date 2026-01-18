const express = require('express');
const router = express.Router();
const llmService = require('../utils/llmService');

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