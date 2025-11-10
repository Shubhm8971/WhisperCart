const fetch = require('node-fetch');

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HUGGINGFACE_MODEL_ID = process.env.HUGGINGFACE_MODEL_ID;
const INTENT_MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2'; // A good model for this task

// Generic function to call the Hugging Face Inference API
async function callHuggingFace(modelId, inputs, parameters) {
  if (!HUGGINGFACE_API_TOKEN) {
    throw new Error('Hugging Face API token not configured.');
  }

  const API_URL = `https://router.huggingface.co/hf-inference/${modelId}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
      },
      body: JSON.stringify({
        inputs,
        parameters,
        options: {
          use_cache: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Hugging Face API Error:', errorData);
      throw new Error(`Hugging Face API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    // Re-throw the specific API error if it originated from the !response.ok block
    if (error.message.startsWith('Hugging Face API error:')) {
      throw error;
    }
    console.error(`Error calling Hugging Face model ${modelId}:`, error);
    throw new Error('Failed to get response from AI model.');
  }
}

// Specific function for extracting structured intent data.
async function extractIntentWithLLM(text) {
  const prompt = `[INST] You are an expert at understanding shopping intents from conversations. Analyze the following text and extract the core product the user wants to buy, their budget, and any specific features they mention (like color, brand, size, etc.). Return ONLY a valid JSON object with the following keys: "product" (string or null), "budget" (number or null), and "features" (an array of strings). Text: '${text}' [/INST]`;

  const result = await callHuggingFace(INTENT_MODEL_ID, prompt, {
    max_new_tokens: 150,
    temperature: 0.1, // Lower temperature for more deterministic JSON output
  });

  if (result && result[0] && result[0].generated_text) {
    // Extract the part of the string that contains the JSON
    const generatedText = result[0].generated_text;
    const jsonString = generatedText.substring(generatedText.indexOf('{'));
    
    if (jsonString) {
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.error('Failed to parse JSON from LLM response:', e, 'Raw response:', jsonString);
        return { product: null, budget: null, features: [] };
      }
    }
  }
  return { product: null, budget: null, features: [] };
}

async function generateConversationalNegotiationWithLLM(product, budget, messages) {
  const hfMessages = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  const systemPrompt = {
    role: 'system',
    content: `You are an AI negotiation assistant for a shopping app called WhisperCart. Your goal is to help the user get the best possible deal on "${product.name}" (current price: ₹${product.price}).
    
    Here's how you should operate:
    1.  **Simulate Negotiation:** Act as if you are actively negotiating with a seller. Use phrases like "Let me see what I can do," "I've managed to find," or "How about this?"
    2.  **Offer Discounts:** If the current price is above the user's budget of ₹${budget} (or even if it's close), try to offer a simulated discount. For example, you could say, "I've managed to get you a 10% discount, bringing the price down to ₹${(product.price * 0.9).toFixed(2)}." Make the discount sound like a special effort.
    3.  **Suggest Alternatives:** If a direct discount isn't feasible or the price is still too high, suggest looking for cheaper, similar alternative products. You can say something like, "While I couldn't get a further discount on this one, I can look for similar models that fit your budget."
    4.  **Be Helpful and Concise:** Keep your responses friendly, professional, and to the point. Focus on providing value to the user.
    5.  **Maintain Context:** Remember the conversation history and respond naturally.
    
    Always aim to make the user feel like they are getting a good deal or being helped effectively.`,
  };

  // We need to format the input for a conversational model correctly
  const inputs = {
    past_user_inputs: hfMessages.filter(m => m.role === 'user').map(m => m.content),
    generated_responses: hfMessages.filter(m => m.role === 'assistant').map(m => m.content),
    text: '' // The new user input, which is empty in this case as we are just getting a response
  };

  const result = await callHuggingFace(HUGGINGFACE_MODEL_ID, [systemPrompt, ...hfMessages], {
    max_new_tokens: 150,
    temperature: 0.7,
    top_p: 0.9,
  });

  const botResponse = result[0]?.generated_text?.pop()?.content;

  if (!botResponse) {
    throw new Error('No response text from Hugging Face API.');
  }

  return { responseText: botResponse };
}

module.exports = {
  extractIntentWithLLM,
  generateConversationalNegotiationWithLLM,
};
