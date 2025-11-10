const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startServer, stopServer } = require('../server');
const config = require('../config');

let app;
let mongoServer;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  config.mongoURI = mongoServer.getUri();
  app = await startServer();
  db = app.locals.db;
});

afterAll(async () => {
  await stopServer();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('products').deleteMany({});
});

describe('Products API', () => {
  describe('POST /products', () => {
    it('should create a new product with valid data', async () => {
      const newProduct = { name: 'Test Laptop', price: 1200 };
      const res = await request(app).post('/products').send(newProduct);
      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe(newProduct.name);
      expect(res.body.price).toBe(newProduct.price);

      const count = await db.collection('products').countDocuments();
      expect(count).toBe(1);
    });

    it('should return 400 for invalid data (missing name)', async () => {
      const newProduct = { price: 1200 };
      const res = await request(app).post('/products').send(newProduct);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const products = [
        { name: 'Laptop', price: 1200 },
        { name: 'Mouse', price: 25 },
      ];
      await db.collection('products').insertMany(products);

      const res = await request(app).get('/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe('Laptop');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const product = await db.collection('products').insertOne({ name: 'Old Name', price: 100 });
      const productId = product.insertedId;
      const updatedData = { name: 'New Name', price: 150 };

      const res = await request(app).put(`/products/${productId}`).send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.price).toBe(150);
    });

    it('should return 404 for a non-existent product id', async () => {
      const nonExistentId = '60d5ecb5b39e3d3e3c8b4567'; // A valid but non-existent ObjectId
      const res = await request(app).put(`/products/${nonExistentId}`).send({ name: 'New Name', price: 150 });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete an existing product', async () => {
      const product = await db.collection('products').insertOne({ name: 'To Be Deleted', price: 100 });
      const productId = product.insertedId;

      const res = await request(app).delete(`/products/${productId}`);
      expect(res.statusCode).toEqual(204);

      const count = await db.collection('products').countDocuments();
      expect(count).toBe(0);
    });

    it('should return 404 for a non-existent product id', async () => {
      const nonExistentId = '60d5ecb5b39e3d3e3c8b4567';
      const res = await request(app).delete(`/products/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
