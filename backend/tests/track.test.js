const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startServer, stopServer } = require('../server');
const config = require('../config');
const express = require('express'); // Added
const cors = require('cors'); // Added

// Import the track route (which is a function)
const createTrackRouter = require('../routes/track');

let app; // Declare app here
let mongoServer;
let db;
let appInstance; // To hold the app instance from startServer for cleanup

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  config.mongoURI = mongoServer.getUri();
  appInstance = await startServer(); // Store the app instance for stopServer
  db = appInstance.locals.db;
});

afterAll(async () => {
  await stopServer();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Create a fresh app instance for each test
  app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(cors());
  app.locals.db = db; // Use the shared db instance

  // Create the track router
  const trackRouter = createTrackRouter();
  app.use('/track', trackRouter);

  await db.collection('tracked_deals').deleteMany({}); // Clear tracked deals before each test
});

describe('Track API', () => {
  it('POST /track should add a product to tracking', async () => {
    const productToTrack = {
      id: 'prod123',
      name: 'Test Product',
      price: 100,
      imageUrl: 'http://example.com/image.jpg',
      link: 'http://example.com/product/prod123',
    };

    const res = await request(app)
      .post('/track')
      .send({ product: productToTrack });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Product added to tracking.');
    expect(res.body.trackedDeal.product.id).toBe(productToTrack.id);

    const trackedDeals = await db.collection('tracked_deals').find({}).toArray();
    expect(trackedDeals.length).toBe(1);
    expect(trackedDeals[0].product.name).toBe(productToTrack.name);
  });

  it('POST /track should return 409 if product is already being tracked', async () => {
    const productToTrack = {
      id: 'prod123',
      name: 'Test Product',
      price: 100,
      imageUrl: 'http://example.com/image.jpg',
      link: 'http://example.com/product/prod123',
    };

    await db.collection('tracked_deals').insertOne({ product: productToTrack, trackedAt: new Date() });

    const res = await request(app)
      .post('/track')
      .send({ product: productToTrack });

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toBe('Product is already being tracked.');
  });

  it('POST /track should return 400 if product data is incomplete', async () => {
    const incompleteProduct = { id: 'prod456', name: 'Incomplete Product' }; // Missing price

    const res = await request(app)
      .post('/track')
      .send({ product: incompleteProduct });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Product ID, name, and price are required for tracking.');
  });

  it('GET /track should return all tracked deals', async () => {
    const product1 = { id: 'prod1', name: 'Product One', price: 100 };
    const product2 = { id: 'prod2', name: 'Product Two', price: 200 };

    await db.collection('tracked_deals').insertMany([
      { product: product1, trackedAt: new Date() },
      { product: product2, trackedAt: new Date() },
    ]);

    const res = await request(app).get('/track');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].product.name).toBe(product1.name);
    expect(res.body[1].product.name).toBe(product2.name);
  });

  it('GET /track should return an empty array if no deals are tracked', async () => {
    const res = await request(app).get('/track');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });
});