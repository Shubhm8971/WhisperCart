const request = require('supertest');
const { app } = require('../server');
const TrackedDeal = require('../models/TrackedDeal');

beforeEach(async () => {
  await TrackedDeal.deleteMany({});
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

    const trackedDeals = await TrackedDeal.find({});
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

    await TrackedDeal.create({ product: productToTrack });

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

    await TrackedDeal.insertMany([
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