const config = require('../config');

console.log('Zero-Cost AI Intent Service Loaded');

/**
 * Advanced Intent Detection (Zero-Cost Strategy)
 * Prioritizes HuggingFace Free Tier, with a "Smart Local" Fallback.
 */
async function extractIntentWithLLM(text) {
  console.log('[v5.2] Starting Intent Detection on:', text);

  // Try HuggingFace first (Free Tier)
  if (config.huggingfaceToken) {
    try {
      return await extractIntentWithHuggingFace(text);
    } catch (error) {
      console.warn('HuggingFace failed/busy, using Smart Local engine...');
    }
  }

  // Final fallback to our highly optimized local engine
  return fallbackIntentExtraction(text);
}

/**
 * HuggingFace-based Intent Detection (Primary Free LLM)
 */
async function extractIntentWithHuggingFace(text) {
  console.log('[v5.2] HuggingFace Intent Detection on:', text);

  // Mistral is generally great for instruction following
  const modelId = config.huggingfaceModelId || 'mistralai/Mistral-7B-Instruct-v0.2';
  const prompt = `<s>[INST] You are WhisperCart Shopping Agent. Extract JSON from this transcript: "${text}". 
  Fields:
  - action (string: "search", "checkout", "wishlist", "clear_cart")
  - product (string, e.g. "Gaming Laptop")
  - budget (number, pure integer)
  - features (array of strings, e.g. ["blue", "waterproof"])
  - urgency (high/medium/low)
  Only return the JSON object. Do not explain. [/INST]`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.huggingfaceToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { return_full_text: false, max_new_tokens: 150, temperature: 0.1 }
      })
    });

    const data = await response.json();

    // Handle model loading state (Free tier quirk)
    if (data.error && data.error.includes('currently loading')) {
      console.log('HF Model is loading, falling back to local...');
      throw new Error('Model loading');
    }

    const content = data[0]?.generated_text || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[v5.2] HF Success:', parsed);
      return parsed;
    }
    throw new Error("Invalid format");
  } catch (error) {
    throw error; // Let the main function handle the fallback
  }
}

/**
 * Smart Local Intent Engine (Optimized Regex + Logic)
 * Truly free, instant, and surprisingly accurate for a demo.
 */
function fallbackIntentExtraction(text) {
  console.log('[v7.0] Using Smart Local Engine');
  const lowerText = text.toLowerCase();

  let action = 'search';
  let product = 'Generic Product';
  let budget = null;
  let features = [];
  let urgency = 'medium';

  // 0. Action Detection
  if (lowerText.match(/checkout|pay|buy|purchase/)) action = 'checkout';
  else if (lowerText.match(/wishlist|save|favorite/)) action = 'wishlist';
  else if (lowerText.match(/clear|empty|delete/)) action = 'clear_cart';

  // 1. Core Category detection (only if action is 'search')
  if (action === 'search') {
    if (lowerText.match(/watch|series|apple|galaxy|smartwatch/)) product = 'Smartwatch';
    else if (lowerText.match(/shoe|sneaker|nike|adidas|puma|running|footwear/)) product = 'Running Shoes';
    else if (lowerText.match(/croc|clog/)) product = 'Crocs';
    else if (lowerText.match(/phone|iphone|mobile|smartphone|pixel/)) product = 'Smartphone';
    else if (lowerText.match(/laptop|macbook|computer|dell|hp/)) product = 'Laptop';
    else if (lowerText.match(/headphone|buds|sony|bose|audio/)) product = 'Headphones';
    else if (lowerText.match(/jacket|hoodie|shirt|clothes/)) product = 'Apparel';
  } else {
    product = null; // Don't search for products when action is not 'search'
  }

  // 2. Brand detection
  const brands = ['apple', 'samsung', 'nike', 'adidas', 'dell', 'hp', 'sony', 'bose', 'razer', 'crocs', 'puma'];
  for (const b of brands) {
    if (lowerText.includes(b)) {
      brand_preference = b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  // 3. Feature detection (colors, qualities)
  const colors = ['red', 'blue', 'black', 'white', 'green', 'pink', 'silver', 'gold'];
  const specs = ['waterproof', 'wireless', 'gaming', 'noise cancelling', 'leather', 'denim', 'cotton'];
  colors.forEach(c => { if (lowerText.includes(c)) features.push(c); });
  specs.forEach(s => { if (lowerText.includes(s)) features.push(s); });

  // 4. Budget Extraction (improved)
  const budgetMatch = lowerText.match(/under\s?\$?([\d,]+)/) ||
    lowerText.match(/([\d,]+)\s?(?:rupees|rs|usd|dollars|\$)/) ||
    lowerText.match(/budget(?:\s?of)?\s?\$?([\d,]+)/) ||
    lowerText.match(/\$?([\d,]+)/);

  if (budgetMatch) {
    budget = parseInt(budgetMatch[1].replace(/,/g, ''));
  }

  // 5. Urgency
  if (lowerText.match(/now|urgent|today|asap|fast/)) urgency = 'high';

  const result = { action, product, budget, features, urgency };
  console.log('[v7.0] Smart Local Result:', result);
  return result;
}

/**
 * EXPERT LLM NEGOTIATOR (HuggingFace Primary)
 */
async function generateConversationalNegotiationWithLLM(product, budget, messages) {
  console.log(`[v5.2] Starting AI Negotiation for ${product.name}`);

  // Try HuggingFace first
  if (config.huggingfaceToken) {
    try {
      return await generateNegotiationWithHuggingFace(product, budget, messages);
    } catch (error) {
      console.warn('HuggingFace negotiation failed/busy, using Smart Local negotiator...');
    }
  }

  // Final fallback to our highly optimized local engine
  return fallbackNegotiation(product, budget, messages);
}

/**
 * HuggingFace-based Negotiation (Primary LLM)
 */
async function generateNegotiationWithHuggingFace(product, budget, messages) {
  console.log('[v5.2] HuggingFace Negotiation on:', product.name);

  const modelId = config.huggingfaceModelId || 'mistralai/Mistral-7B-Instruct-v0.2';
  const conversationHistory = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  const productInfo = `Product: ${product.name}, Current Price: ${product.price}, User Budget: ${budget || 'not specified'}`;

  const prompt = `<s>[INST] You are a helpful WhisperCart AI negotiation agent. Your goal is to negotiate a good deal for the user on a product.
Here is the product information:
${productInfo}

Here is the conversation history so far:
${conversationHistory}

Based on the conversation and product details, decide on a response.
Your response should be a JSON object with the following fields:
- responseText (string): Your conversational message to the user.
- proposedPrice (number, optional): A new price you are offering. Only include if you are making a specific offer.
- dealAccepted (boolean, optional): Set to true if the user has accepted a deal and the negotiation should end.

Be creative but stay focused on negotiation. Do not offer unrealistic discounts. If the user accepts, set dealAccepted to true.
Only return the JSON object. Do not explain. [/INST]`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.huggingfaceToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { return_full_text: false, max_new_tokens: 200, temperature: 0.7 }
      })
    });

    const data = await response.json();

    if (data.error && data.error.includes('currently loading')) {
      throw new Error('Model loading');
    }

    const content = data[0]?.generated_text || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[v5.2] HF Negotiation Success:', parsed);
      return parsed;
    }
    throw new Error("Invalid format or no JSON in response");
  } catch (error) {
    console.error('HuggingFace negotiation error:', error);
    throw error;
  }
}

/**
 * EXPERT LOCAL NEGOTIATOR (Fallback)
 */
async function fallbackNegotiation(product, budget, messages) {
  console.log(`[v5.2] Local AI Negotiation: ${product.name}`);

  const currentPrice = parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
  const userBudget = budget ? parseFloat(budget.toString()) : null;
  const lastMsgObj = messages && messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessage = (lastMsgObj ? (lastMsgObj.text || lastMsgObj.content || "") : "").toLowerCase();

  await new Promise(resolve => setTimeout(resolve, 800));

  if (lastMessage.match(/discount|cheaper|lower|price|bargain|negotiate|expensive|less/)) {
    const discountPrice = (currentPrice * 0.92).toFixed(2);
    const deepDiscount = (currentPrice * 0.88).toFixed(2);

    if (userBudget && userBudget < currentPrice * 0.85) {
      return {
        responseText: `I see your budget is ₹${userBudget}. While it's quite low for this premium ${product.name}, I can authorize a "First-Time Buyer" discount to bring it down to ₹${deepDiscount}. That's my absolute best offer!`,
        proposedPrice: deepDiscount
      };
    }
    return {
      responseText: `I definitely want to help you get this ${product.name}! I can drop the price from ₹${currentPrice} to ₹${discountPrice} if you're ready to order now. What do you think?`,
      proposedPrice: discountPrice
    };
  }

  if (lastMessage.match(/why|feature|better|good|worth|details|quality/)) {
    return { responseText: `This ${product.name} stands out for its durability and highly-rated performance. It's currently a hot seller, and at ₹${currentPrice}, it's a very competitive deal for these specs!` };
  }

  if (lastMessage.match(/yes|ok|okay|sure|add|buy|get|sounds good/)) {
    return {
      responseText: `Awesome! I've marked the ${product.name} at the discounted rate. Click "Add to Cart" below and we'll get it shipped out to you! 🚀`,
      dealAccepted: true
    };
  }

  return {
    responseText: `Hi! I'm your WhisperCart Assistant. I'm looking at the ${product.name} (₹${currentPrice}) with you. Are you looking for a better price, or do you have questions about its features?`
  };
}

/**
 * SMART PRODUCT COMPARISON (Phase 3)
 * Generates AI-powered comparison analysis between products
 */
async function generateProductComparison(products) {
  console.log(`[v7.0] Generating comparison for ${products.length} products`);

  // Build comparison prompt
  const productSummaries = products.map((p, idx) => {
    return `Product ${idx + 1}: ${p.title}
- Price: ${p.price.raw}
- Rating: ${p.rating}/5 (${p.reviewsCount} reviews)
- Store: ${p.store || 'Amazon'}`;
  }).join('\n\n');

  const prompt = `Compare these products and provide a concise analysis:

${productSummaries}

Provide:
1. Key Differences (specs, features, quality)
2. Price-to-Value Analysis
3. Pros and Cons for each
4. Recommendation (which to buy and why)

Keep it concise and actionable.`;

  // Try HuggingFace first
  if (config.huggingfaceToken) {
    try {
      const analysis = await generateComparisonWithHuggingFace(prompt);
      return { analysis, products };
    } catch (error) {
      console.warn('HuggingFace comparison failed, using local fallback...');
    }
  }

  // Local fallback
  return generateComparisonFallback(products);
}

async function generateComparisonWithHuggingFace(prompt) {
  const modelId = config.huggingfaceModelId || 'mistralai/Mistral-7B-Instruct-v0.2';

  const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.huggingfaceToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: `<s>[INST] ${prompt} [/INST]`,
      parameters: { return_full_text: false, max_new_tokens: 400, temperature: 0.3 }
    })
  });

  const data = await response.json();

  if (data.error && data.error.includes('currently loading')) {
    throw new Error('Model loading');
  }

  const analysis = data[0]?.generated_text || "";
  if (!analysis) throw new Error('No analysis generated');

  return analysis;
}

function generateComparisonFallback(products) {
  console.log('[v7.0] Using Smart Local Comparison Engine');

  // Sort by price
  const sorted = [...products].sort((a, b) => a.price.value - b.price.value);
  const cheapest = sorted[0];
  const mostExpensive = sorted[sorted.length - 1];

  // Find highest rated
  const highestRated = [...products].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))[0];

  const analysis = `**Smart Comparison Analysis**

**Key Differences:**
- Price Range: ${cheapest.price.raw} to ${mostExpensive.price.raw}
- Highest Rated: ${highestRated.title} (${highestRated.rating}/5)
- Stores: ${products.map(p => p.store).join(', ')}

**Price-to-Value:**
${products.map((p, idx) => {
    const value = parseFloat(p.rating) / (p.price.value / 1000);
    return `${idx + 1}. ${p.title}: ${value > 4 ? 'Excellent' : value > 2 ? 'Good' : 'Fair'} value`;
  }).join('\n')}

**Pros & Cons:**
${products.map((p, idx) => `
Product ${idx + 1} (${p.title}):
✅ ${parseFloat(p.rating) >= 4.5 ? 'Highly rated by customers' : 'Decent customer reviews'}
✅ ${p.price.value === cheapest.price.value ? 'Most affordable option' : 'Premium quality'}
❌ ${p.price.value === mostExpensive.price.value ? 'Higher price point' : 'May have fewer features'}
`).join('\n')}

**Recommendation:**
${highestRated.price.value === cheapest.price.value
      ? `Go with ${highestRated.title} - it's both the cheapest AND highest rated. Best value!`
      : `If budget allows, choose ${highestRated.title} for best quality. For savings, ${cheapest.title} is solid.`}`;

  return { analysis, products };
}

module.exports = {
  extractIntentWithLLM,
  generateConversationalNegotiationWithLLM,
  generateProductComparison,
};
