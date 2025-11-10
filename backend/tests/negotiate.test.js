const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startServer, stopServer } = require('../server');
const config = require('../config');
const llmService = require('../utils/llmService');

// Explicitly mock llmService
jest.mock('../utils/llmService');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  config.mongoURI = mongoServer.getUri();
  app = await startServer();
}, 30000); // Increase timeout for beforeAll

afterAll(async () => {
  await stopServer();
  await mongoServer.stop();
}, 30000); // Increase timeout for afterAll

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Negotiate API', () => {
  const productData = { name: 'Smartwatch', price: 3000 };
  const initialMessages = [{ id: 1, text: 'Hello', sender: 'user' }];

  it('POST /negotiate should return a conversational response on success', async () => {
    const mockConversationalResponse = {
      responseText: 'I can offer you a special price of ₹2700!',
    };
    llmService.generateConversationalNegotiationWithLLM.mockResolvedValue(mockConversationalResponse);

    const res = await request(app)
      .post('/negotiate')
      .send({ product: productData, budget: 2800, messages: initialMessages });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('responseText');
    expect(res.body.responseText).toBe(mockConversationalResponse.responseText);
    expect(llmService.generateConversationalNegotiationWithLLM).toHaveBeenCalledTimes(1);
    expect(llmService.generateConversationalNegotiationWithLLM).toHaveBeenCalledWith(
      productData,
      2800,
      initialMessages
    );
  }, 30000);

  it('POST /negotiate should return 400 if product name or price is missing', async () => {
    const res1 = await request(app).post('/negotiate').send({ product: { name: 'Smartwatch' }, budget: 3000, messages: initialMessages }); // Missing price
    expect(res1.statusCode).toEqual(400);

    const res2 = await request(app).post('/negotiate').send({ product: { price: 3000 }, budget: 3000, messages: initialMessages }); // Missing name
    expect(res2.statusCode).toEqual(400);

    const res3 = await request(app).post('/negotiate').send({ product: {}, budget: 3000, messages: initialMessages }); // Missing both
    expect(res3.statusCode).toEqual(400);
  }, 30000);

  it('POST /negotiate should return 400 if messages array is missing or invalid', async () => {
    const res1 = await request(app).post('/negotiate').send({ product: productData, budget: 3000 }); // Missing messages
    expect(res1.statusCode).toEqual(400);
    expect(res1.body.error).toContain('A messages array is required.');

    const res2 = await request(app).post('/negotiate').send({ product: productData, budget: 3000, messages: 'not an array' }); // Invalid messages
    expect(res2.statusCode).toEqual(400);
    expect(res2.body.error).toContain('A messages array is required.');
  }, 30000);

  it('POST /negotiate should return 500 if LLM conversational call fails', async () => {
    llmService.generateConversationalNegotiationWithLLM.mockRejectedValue(new Error('LLM API error')); // Simulate LLM failure

    const res = await request(app)
      .post('/negotiate')
      .send({ product: productData, budget: 2800, messages: initialMessages });

    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toBe('Failed to negotiate deal.');
    expect(llmService.generateConversationalNegotiationWithLLM).toHaveBeenCalledTimes(1);
  }, 30000);
});
