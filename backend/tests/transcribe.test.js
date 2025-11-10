const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startServer, stopServer } = require('../server');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const llmService = require('../utils/llmService');

// Mock dependencies
jest.mock('../utils/llmService');
jest.mock('assemblyai', () => {
  const mockAssemblyAICreate = jest.fn(); // Define it here
  return {
    AssemblyAI: jest.fn(() => ({
      transcripts: {
        create: mockAssemblyAICreate,
      },
    })),
    mockAssemblyAICreate, // Export it so tests can access it
  };
});

// Import the mocked version of AssemblyAI to access mockAssemblyAICreate
const { mockAssemblyAICreate } = require('assemblyai');

let app;
let mongoServer;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  config.mongoURI = mongoServer.getUri();
  const server = await startServer();
  app = server;
  db = app.locals.db;
});

afterAll(async () => {
  await stopServer();
  await mongoServer.stop();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await db.collection('history').deleteMany({});
});

describe('Transcribe API', () => {
  const dummyAudioPath = path.join(__dirname, 'dummy_audio.m4a');

  afterEach(() => {
    // Clean up dummy file if it exists
    if (fs.existsSync(dummyAudioPath)) {
      fs.unlinkSync(dummyAudioPath);
    }
  });

  it('POST /transcribe should successfully transcribe audio, extract intent, and save history', async () => {
    mockAssemblyAICreate.mockResolvedValue({ text: 'I want to buy a red shirt for 500 rupees' });
    llmService.extractIntentWithLLM.mockResolvedValue({
      product: 'red shirt',
      budget: 500,
      features: ['red'],
    });

    fs.writeFileSync(dummyAudioPath, 'dummy audio content');

    const res = await request(app)
      .post('/transcribe')
      .attach('file', dummyAudioPath, 'audio.m4a');

    expect(res.statusCode).toEqual(200);
    expect(res.body.raw_text).toBe('I want to buy a red shirt for 500 rupees');
    expect(res.body.product).toBe('red shirt');
    expect(res.body.budget).toBe(500);
    expect(res.body.features).toEqual(['red']);

    const history = await db.collection('history').find({}).toArray();
    expect(history.length).toBe(1);
    expect(history[0].product).toBe('red shirt');
  });

  it('POST /transcribe should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/transcribe');
    expect(res.statusCode).toEqual(400);
  });

  it('POST /transcribe should return 500 if AssemblyAI transcription fails', async () => {
    mockAssemblyAICreate.mockRejectedValue(new Error('AssemblyAI error'));
    fs.writeFileSync(dummyAudioPath, 'dummy audio content');

    const res = await request(app)
      .post('/transcribe')
      .attach('file', dummyAudioPath, 'audio.m4a');

    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toContain('Failed to process audio.');
  });

  it('POST /transcribe should handle LLM failure gracefully', async () => {
    mockAssemblyAICreate.mockResolvedValue({ text: 'I want to buy a red shirt' });
    llmService.extractIntentWithLLM.mockResolvedValue(null); // Simulate LLM returning null

    fs.writeFileSync(dummyAudioPath, 'dummy audio content');

    const res = await request(app)
      .post('/transcribe')
      .attach('file', dummyAudioPath, 'audio.m4a');

    expect(res.statusCode).toEqual(200);
    expect(res.body.product).toBeNull();
    expect(res.body.raw_text).toBe('I want to buy a red shirt');
  });

  it('POST /transcribe should handle empty transcription text', async () => {
    mockAssemblyAICreate.mockResolvedValue({ text: null });

    fs.writeFileSync(dummyAudioPath, 'dummy audio content');

    const res = await request(app)
      .post('/transcribe')
      .attach('file', dummyAudioPath, 'audio.m4a');

    expect(res.statusCode).toEqual(200);
    expect(res.body.raw_text).toBe('');
    expect(res.body.product).toBeNull();

    const history = await db.collection('history').find({}).toArray();
    expect(history.length).toBe(0);
  });
});
