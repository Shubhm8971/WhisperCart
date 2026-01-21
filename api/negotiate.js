// api/negotiate.js - Serverless negotiation endpoint
const config = require('../backend/config');
const llmService = require('../backend/utils/llmService');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product, budget, messages } = req.body;

    if (!product || !product.name || !product.price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'A messages array is required.' });
    }

    console.log(`[Negotiation] Starting for: ${product.name}`);

    // Use LLM service for negotiation
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
    console.error('Negotiation error:', error);
    res.status(500).json({ error: 'Failed to negotiate deal.' });
  }
};
