const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');
const mongoose = require('mongoose'); // Import mongoose for ObjectId

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Products API', () => {
  describe('POST /products', () => {
    it('should create a new product with valid data', async () => {
      const newProduct = { name: 'Test Laptop', price: 1200 };
      const res = await request(app).post('/products').send(newProduct);
      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe(newProduct.name);
      expect(res.body.price).toBe(newProduct.price);

      const count = await Product.countDocuments();
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
      await Product.insertMany(products);

      const res = await request(app).get('/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe('Laptop');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const product = await Product.create({ name: 'Old Name', price: 100 });
      const productId = product._id;
      const updatedData = { name: 'New Name', price: 150 };

      const res = await request(app).put(`/products/${productId}`).send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.price).toBe(150);
    });

    it('should return 404 for a non-existent product id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId
      const res = await request(app).put(`/products/${nonExistentId}`).send({ name: 'New Name', price: 150 });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete an existing product', async () => {
      const product = await Product.create({ name: 'To Be Deleted', price: 100 });
      const productId = product._id;

      const res = await request(app).delete(`/products/${productId}`);
      expect(res.statusCode).toEqual(204);

      const count = await Product.countDocuments();
      expect(count).toBe(0);
    });

    it('should return 404 for a non-existent product id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent ObjectId
      const res = await request(app).delete(`/products/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
