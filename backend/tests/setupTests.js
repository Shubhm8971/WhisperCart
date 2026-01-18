// backend/tests/setupTests.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { startServer, stopServer } = require('../server'); // Import startServer and stopServer

let mongo;
let app; // Declare app to be accessible globally in tests

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  
  process.env.MONGO_URI = mongoUri;
  process.env.HUGGINGFACE_API_TOKEN = 'dummy_token_for_test'; // Ensure this is set for LLM service tests
  process.env.JWT_SECRET = 'testsecret'; // for auth tests
  process.env.JWT_EXPIRE = '1h'; // for auth tests
  process.env.NODE_ENV = 'test'; // Ensure server starts in test mode

  // Start the Express server with the in-memory MongoDB URI
  app = await startServer(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await stopServer(); // Use the stopServer function
  await mongo.stop();
});

// Clean up database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

module.exports = { app }; // Export app for use in test files