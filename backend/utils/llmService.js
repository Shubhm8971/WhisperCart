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
 * Enhanced Smart Local Intent Engine (Advanced AI Detection)
 * Improved with context understanding, purchase intent, and comprehensive categorization
 */
function fallbackIntentExtraction(text) {
  console.log('[v8.0] Enhanced AI Detection Engine');
  const lowerText = text.toLowerCase();

  let action = 'search';
  let product = null;
  let budget = null;
  let features = [];
  let urgency = 'medium';
  let context = 'personal'; // personal, gift, work, replacement
  let purchaseIntent = 'browsing'; // browsing, interested, ready_to_buy, urgent

  // 0. Action Detection (Enhanced)
  if (lowerText.match(/checkout|pay|buy now|purchase now|order now/)) {
    action = 'checkout';
    purchaseIntent = 'ready_to_buy';
  } else if (lowerText.match(/add to cart|buy|purchase|get it/)) {
    action = 'checkout';
    purchaseIntent = 'interested';
  } else if (lowerText.match(/wishlist|save for later|favorite|bookmark/)) {
    action = 'wishlist';
  } else if (lowerText.match(/clear|empty|delete|remove all/)) {
    action = 'clear_cart';
  } else if (lowerText.match(/compare|vs|versus|difference/)) {
    action = 'compare';
  }

  // Context Detection
  if (lowerText.match(/gift|birthday|anniversary|present|surprise/)) {
    context = 'gift';
  } else if (lowerText.match(/work|office|business|professional|meeting/)) {
    context = 'work';
  } else if (lowerText.match(/replace|broken|old one|upgrade|new version/)) {
    context = 'replacement';
  }

  // Purchase Intent Analysis
  if (lowerText.match(/need it now|urgent|emergency|asap|immediately/)) {
    purchaseIntent = 'urgent';
    urgency = 'high';
  } else if (lowerText.match(/looking for|interested in|thinking about/)) {
    purchaseIntent = 'interested';
  } else if (lowerText.match(/just browsing|checking|see what/)) {
    purchaseIntent = 'browsing';
  }

  // 1. Advanced Product Category Detection
  if (action === 'search') {
    // Electronics & Tech
    if (lowerText.match(/watch|apple watch|galaxy watch|smartwatch|fitness tracker/)) {
      product = 'Smartwatch';
      features.push('fitness_tracking');
    } else if (lowerText.match(/phone|iphone|android|smartphone|mobile|pixel|galaxy/)) {
      product = 'Smartphone';
      if (lowerText.includes('gaming')) features.push('gaming_phone');
    } else if (lowerText.match(/laptop|macbook|computer|notebook|dell|hp|lenovo|asus/)) {
      product = 'Laptop';
      if (lowerText.includes('gaming')) features.push('gaming_laptop');
    } else if (lowerText.match(/headphone|earbuds|airpods|sony|bose|audio|wireless/)) {
      product = 'Headphones';
      if (lowerText.includes('noise')) features.push('noise_cancelling');
    } else if (lowerText.match(/tablet|ipad|kindle|surface/)) {
      product = 'Tablet';
    } else if (lowerText.match(/tv|television|smart tv|samsung tv|lg tv/)) {
      product = 'Smart TV';
    } else if (lowerText.match(/speaker|soundbar|alexa|google home/)) {
      product = 'Smart Speaker';
    }

    // Fashion & Footwear
    else if (lowerText.match(/shoe|sneaker|running shoe|nike|adidas|puma|footwear/)) {
      product = 'Running Shoes';
      if (lowerText.includes('running') || lowerText.includes('jog')) features.push('running');
      if (lowerText.includes('casual')) features.push('casual');
    } else if (lowerText.match(/croc|clog|crocs/)) {
      product = 'Crocs';
    } else if (lowerText.match(/boot|boots|timberland|dr martens/)) {
      product = 'Boots';
    } else if (lowerText.match(/sandal|flip flop|havaianas/)) {
      product = 'Sandals';
    }

    // Clothing & Accessories
    else if (lowerText.match(/jacket|hoodie|coat|blazer/)) {
      product = 'Jacket';
      if (lowerText.includes('winter')) features.push('winter');
      if (lowerText.includes('leather')) features.push('leather');
    } else if (lowerText.match(/shirt|tshirt|top|polo/)) {
      product = 'Shirt';
      if (lowerText.includes('cotton')) features.push('cotton');
      if (lowerText.includes('formal')) features.push('formal');
    } else if (lowerText.match(/jeans|pants|trousers/)) {
      product = 'Jeans';
      if (lowerText.includes('denim')) features.push('denim');
    } else if (lowerText.match(/bag|backpack|luggage|travel/)) {
      product = 'Bag';
      if (lowerText.includes('laptop')) features.push('laptop_bag');
    } else if (lowerText.match(/watch|wristwatch|rolex|casio|timex/)) {
      product = 'Watch';
      if (!lowerText.includes('smart')) features.push('analog');
    }

    // Home & Kitchen
    else if (lowerText.match(/coffee maker|nespresso|breville/)) {
      product = 'Coffee Maker';
    } else if (lowerText.match(/blender|mixer|nutribullet/)) {
      product = 'Blender';
    } else if (lowerText.match(/air fryer|instant pot|cooker/)) {
      product = 'Air Fryer';
    }

    // Sports & Fitness
    else if (lowerText.match(/dumbbell|weight|gym equipment/)) {
      product = 'Dumbbells';
    } else if (lowerText.match(/yoga mat|fitness mat/)) {
      product = 'Yoga Mat';
    } else if (lowerText.match(/bicycle|bike|cycle/)) {
      product = 'Bicycle';
    }

    // Books & Education
    else if (lowerText.match(/book|novel|textbook|kindle/)) {
      product = 'Book';
    }

    // If no specific category found, extract general product
    if (!product) {
      const productMatch = lowerText.match(/(?:looking for|find me|show me|i want|i need)\s+(.+?)(?:\s+under|\s+for|\s+with|\s+in|$)/i);
      if (productMatch) {
        product = productMatch[1].trim();
      }
    }
  }

  // 2. Enhanced Brand Detection (50+ brands)
  const brands = [
    // Tech
    'apple', 'samsung', 'google', 'oneplus', 'xiaomi', 'realme', 'oppo', 'vivo',
    'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'razer', 'alienware',
    'sony', 'bose', 'jbl', 'sennheiser', 'marshall', 'beats',
    'nintendo', 'playstation', 'xbox',

    // Fashion
    'nike', 'adidas', 'puma', 'reebok', 'under armour', 'new balance',
    'crocs', 'havaianas', 'skechers', 'clarks', 'timberland', 'dr martens',
    'levis', 'wrangler', 'pepe jeans', 'zara', 'h&m', 'uniqlo', 'forever 21',
    'rolex', 'casio', 'fossil', 'tissot',

    // Home
    'nespresso', 'breville', 'philips', 'instant pot', 'nutribullet',
    'samsung', 'lg', 'sony', 'panasonic'
  ];

  let detectedBrand = null;
  for (const brand of brands) {
    if (lowerText.includes(brand)) {
      detectedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      features.push(`brand_${brand}`);
      break;
    }
  }

  // 3. Advanced Feature Detection
  const colors = ['red', 'blue', 'black', 'white', 'green', 'pink', 'silver', 'gold', 'gray', 'purple', 'orange', 'yellow', 'brown', 'navy', 'maroon'];
  const sizes = ['small', 'medium', 'large', 'xl', 'xxl', 'xs', 's', 'm', 'l', '32', '34', '36', '38', '40', '42'];
  const specs = [
    'waterproof', 'wireless', 'gaming', 'noise cancelling', 'leather', 'denim', 'cotton',
    'bluetooth', 'usb-c', 'fast charging', '4k', 'hd', 'oled', 'touchscreen',
    'mechanical', 'rgb', 'backlit', 'ergonomic', 'portable', 'compact'
  ];

  // Detect colors
  colors.forEach(color => {
    if (lowerText.includes(color)) features.push(`color_${color}`);
  });

  // Detect sizes
  sizes.forEach(size => {
    if (lowerText.includes(size)) features.push(`size_${size}`);
  });

  // Detect specifications
  specs.forEach(spec => {
    if (lowerText.includes(spec.replace(' ', '')) || lowerText.includes(spec)) {
      features.push(spec.replace(' ', '_'));
    }
  });

  // Special feature combinations
  if (lowerText.match(/noise.cancelling|noise cancelling/)) features.push('noise_cancelling');
  if (lowerText.match(/water.resistant|water resistant/)) features.push('water_resistant');
  if (lowerText.match(/fast.charging|fast charging/)) features.push('fast_charging');

  // 4. Advanced Budget Extraction
  const budgetPatterns = [
    /under\s+(?:rs\.?|rupees?|₹|usd|\$)?\s*([\d,]+(?:\.\d+)?)/i,
    /(?:rs\.?|rupees?|₹|usd|\$)\s*([\d,]+(?:\.\d+)?)\s+(?:or less|maximum|at most|below)/i,
    /budget\s+(?:of|is)?\s+(?:rs\.?|rupees?|₹|usd|\$)?\s*([\d,]+(?:\.\d+)?)/i,
    /(?:rs\.?|rupees?|₹|usd|\$)?\s*([\d,]+(?:\.\d+)?)\s+(?:rupees?|bucks|dollars?)/i,
    /no more than\s+(?:rs\.?|rupees?|₹|usd|\$)?\s*([\d,]+(?:\.\d+)?)/i
  ];

  for (const pattern of budgetPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      budget = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Convert USD to INR if needed (rough estimate)
  if (lowerText.includes('usd') || lowerText.includes('dollar') || lowerText.includes('$')) {
    if (budget && budget < 1000) { // Likely USD if under 1000
      budget = budget * 83; // Current USD to INR rate
    }
  }

  // 5. Enhanced Urgency Detection
  if (lowerText.match(/right now|immediately|urgent|emergency|asap|today|deadline/)) {
    urgency = 'high';
  } else if (lowerText.match(/soon|this week|quickly|fast/)) {
    urgency = 'medium';
  } else if (lowerText.match(/eventually|later|whenever|sometime/)) {
    urgency = 'low';
  }

  // 6. Purchase Intent Refinement
  if (urgency === 'high' && (lowerText.match(/need|must have|essential/))) {
    purchaseIntent = 'urgent';
  }

  // 7. Size/Quantity Detection
  const quantityMatch = lowerText.match(/(\d+)\s*(?:pieces?|pcs?|items?|units?)/i);
  if (quantityMatch) {
    features.push(`quantity_${quantityMatch[1]}`);
  }

  // 8. Quality/Price Preference
  if (lowerText.match(/cheapest|budget|affordable|inexpensive/)) {
    features.push('budget_friendly');
  } else if (lowerText.match(/premium|luxury|high.end|expensive|best/)) {
    features.push('premium_quality');
  }

  const result = {
    action,
    product,
    budget,
    features: [...new Set(features)], // Remove duplicates
    urgency,
    context,
    purchaseIntent,
    brand: detectedBrand
  };

  console.log('[v8.0] Enhanced AI Detection Result:', result);
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
