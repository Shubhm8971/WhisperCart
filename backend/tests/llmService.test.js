const { extractIntentWithLLM } = require('../utils/llmService');
const fetch = require('node-fetch'); // Import fetch to mock it

// Mock the node-fetch module
jest.mock('node-fetch', () => jest.fn());

describe('llmService.extractIntentWithLLM', () => {
  // Store original env
  const originalEnv = process.env;

  beforeAll(() => {
    // Set a dummy API token for tests
    process.env = {
      ...originalEnv,
      HUGGINGFACE_API_TOKEN: 'dummy_token_for_test',
    };
  });

  afterAll(() => {
    // Restore original env
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Reset the mock before each test
    fetch.mockReset();
  });

  test('should extract product, budget, and features correctly', async () => {
    const mockLLMResponse = {
      generated_text: '[INST] ... [/INST] {"product": "crocs", "budget": 2000, "features": ["under ₹2000", "comfortable"]}'
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockLLMResponse]),
    });

    const text = 'I want crocs under ₹2000, something comfortable.';
    const result = await extractIntentWithLLM(text);

    expect(result).toEqual({
      product: 'crocs',
      budget: 2000,
      features: ['under ₹2000', 'comfortable'],
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('should handle text with only product and no budget or features', async () => {
    const mockLLMResponse = {
      generated_text: '[INST] ... [/INST] {"product": "laptop", "budget": null, "features": []}'
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockLLMResponse]),
    });

    const text = 'I need a new laptop.';
    const result = await extractIntentWithLLM(text);

    expect(result).toEqual({
      product: 'laptop',
      budget: null,
      features: [],
    });
  });

  test('should handle text with product and budget but no features', async () => {
    const mockLLMResponse = {
      generated_text: '[INST] ... [/INST] {"product": "smartphone", "budget": 15000, "features": []}'
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockLLMResponse]),
    });

    const text = 'Looking for a smartphone around 15000 rupees.';
    const result = await extractIntentWithLLM(text);

    expect(result).toEqual({
      product: 'smartphone',
      budget: 15000,
      features: [],
    });
  });

  test('should return default values if LLM response is malformed JSON', async () => {
    const mockLLMResponse = {
      generated_text: '[INST] ... [/INST] This is not JSON.'
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockLLMResponse]),
    });

    const text = 'Buy me something.';
    const result = await extractIntentWithLLM(text);

    expect(result).toEqual({
      product: null,
      budget: null,
      features: [],
    });
  });

  test('should return default values if LLM response is empty', async () => {
    const mockLLMResponse = {
      generated_text: '[INST] ... [/INST] '
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockLLMResponse]),
    });

    const text = 'Just talking.';
    const result = await extractIntentWithLLM(text);

    expect(result).toEqual({
      product: null,
      budget: null,
      features: [],
    });
  });

  test('should throw an error if Hugging Face API call fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
    });

    const text = 'Test error case.';
    await expect(extractIntentWithLLM(text)).rejects.toThrow('Hugging Face API error: 500 - {"error":"Internal Server Error"}');
  });

  test('should handle LLM response with extra text before JSON', async () => {
    const mockLLMResponse = {
      generated_text: 'Some introductory text. {"product": "headphones", "budget": 5000, "features": ["noise cancelling"]}'
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockLLMResponse]),
    });

    const text = 'I want noise cancelling headphones for 5000.';
    const result = await extractIntentWithLLM(text);

    expect(result).toEqual({
      product: 'headphones',
      budget: 5000,
      features: ['noise cancelling'],
    });
  });
});