export default async function negotiate(req, res) {
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

    // Mock negotiation responses
    const currentPrice = parseInt(product.price);
    const userBudget = budget ? parseInt(budget) : currentPrice * 0.8;
    const discountPercent = Math.max(10, Math.min(30, Math.round((currentPrice - userBudget) / currentPrice * 100)));
    const proposedPrice = Math.round(currentPrice * (1 - discountPercent / 100));

    const responses = [
      `I see you're interested in the ${product.name}. Current price is ₹${currentPrice}. Let me check what discount I can get for you...`,
      `Based on your budget of ₹${userBudget}, I can negotiate a ${discountPercent}% discount!`,
      `Great news! I've negotiated a special price of ₹${proposedPrice} for you. That's ₹${currentPrice - proposedPrice} off!`,
      `This is an excellent deal. Shall I add this to your cart?`
    ];

    const messageCount = messages.length;
    const responseText = responses[Math.min(messageCount, responses.length - 1)];

    res.json({
      responseText,
      proposedPrice: messageCount > 1 ? proposedPrice : null,
      dealAccepted: messageCount > 2
    });

  } catch (error) {
    console.error('Negotiation error:', error);
    res.status(500).json({ error: 'Failed to negotiate deal.' });
  }
}
